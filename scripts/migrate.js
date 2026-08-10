const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('route.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk('e:/Projects/Alpona/app/api/ai');

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  
  if (!content.includes('import { createApiHandler }')) {
    content = "import { createApiHandler } from '@/lib/api/handler'\n" + content;
  }
  
  content = content.replace(
    /export async function POST\(req: Request\) \{/g,
    "export const POST = createApiHandler({\n  auth: 'optional',\n  handler: async ({ req, body }) => {"
  );

  content = content.replace(
    /(const|let|var)\s+(\{[\s\S]*?\})\s*=\s*await req\.json\(\)(?:\.catch\(\(\) => \(\{\}\)\))?/g,
    "$1 $2 = body as any"
  );
  
  content = content.replace(
    /(const|let|var)\s+([a-zA-Z0-9_]+)\s*=\s*await req\.json\(\)/g,
    "$1 $2 = body as any"
  );

  const lastBraceIndex = content.lastIndexOf('}');
  if (lastBraceIndex !== -1) {
    content = content.substring(0, lastBraceIndex) + '  }\n})\n' + content.substring(lastBraceIndex + 1);
  }

  fs.writeFileSync(f, content, 'utf8');
});

console.log('Done migrating ' + files.length + ' files.');
