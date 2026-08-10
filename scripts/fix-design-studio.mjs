import fs from 'fs'

let content = fs.readFileSync('components/create/DesignStudio.tsx', 'utf8')
content = content.replace(/import \{ Upload, X, Check, ArrowLeft, Loader2 \} from 'lucide-react'/g, "import { IconUpload, IconClose, IconCheck, IconArrowLeft, IconLoader } from '@/components/shared/PremiumIcons'")
content = content.replace(/<Check /g, '<IconCheck size={16} ')
content = content.replace(/<ArrowLeft /g, '<IconArrowLeft size={16} ')
content = content.replace(/<Loader2 /g, '<IconLoader size={24} ')
content = content.replace(/<X /g, '<IconClose size={12} ')
content = content.replace(/<Upload /g, '<IconUpload size={20} ')
fs.writeFileSync('components/create/DesignStudio.tsx', content)

console.log('Fixed DesignStudio.tsx')
