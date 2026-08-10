require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ggielaflfgkkfubwfgck.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const uuid = () => crypto.randomUUID();

const productsToInsert = [];
const variantsToInsert = [];

const category_id = '6471d0c7-dc06-4fb7-ac9f-acdbc2efd75c'; // T-Shirts
const subcategory_id = 'acd9d21e-cd90-4428-984b-ba545ac756be'; 
const product_type_id = '80a49a3a-b0f7-4fcd-ae4c-0cc4a4faac31';

const REAL_TSHIRTS = [
  {
    name: 'Heavyweight Dropped Tee',
    price_base: 699, price_sell: 1499,
    images: ['/images/categories/tee_heavyweight_front_1783452312326.png', '/images/categories/tee_heavyweight_life_1783452386658.png']
  },
  {
    name: 'Mock Neck Signature',
    price_base: 599, price_sell: 1299,
    images: ['/images/categories/tee_mockneck_front_1783452322189.png', '/images/categories/tee_mockneck_life_1783452395879.png']
  },
  {
    name: 'Washed Core T-Shirt',
    price_base: 799, price_sell: 1599,
    images: ['/images/categories/tee_washed_front_1783452332858.png', '/images/categories/tee_washed_life_1783452408236.png']
  },
  {
    name: 'Pima Cotton Crewneck',
    price_base: 899, price_sell: 1899,
    images: ['/images/categories/tee_pima_front_1783452342079.png', '/images/categories/tee_pima_life_1783452417641.png']
  },
  {
    name: 'Boxy Vintage Wash',
    price_base: 649, price_sell: 1349,
    images: ['/images/categories/tee_boxy_front_1783452352103.png', '/images/categories/tee_boxy_life_1783452430600.png']
  },
  {
    name: 'Essential V-Neck',
    price_base: 499, price_sell: 999,
    images: ['/images/categories/tee_vneck_front_1783452468360.png', '/images/categories/tee_vneck_life_1783452543200.png']
  },
  {
    name: 'Raw Edge Streetwear Top',
    price_base: 749, price_sell: 1449,
    images: ['/images/categories/tee_rawedge_front_1783452481680.png', '/images/categories/tee_rawedge_life_1783452552382.png']
  }
];

const COLORS = [{name: 'Off-White', hex: '#FDFBF7'}, {name: 'Charcoal', hex: '#363636'}];
const SIZES = ['S', 'M', 'L'];

REAL_TSHIRTS.forEach((p, idx) => {
  const pId = uuid();
  const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-ai';

  productsToInsert.push({
    id: pId,
    name: p.name,
    slug: slug,
    description: `Real premium ${p.name}, showcasing absolute authentic photography. True high-end streetwear.`,
    category_id,
    subcategory_id,
    product_type_id,
    base_price: p.price_base,
    selling_price: p.price_sell,
    images: p.images,
    is_active: true,
    display_name: p.name,
    short_description: `100% Unique AI Generated Luxury ${p.name}`,
    product_highlights: ['Unique Design', 'Premium Material', 'Comfort Fit'],
    stock_status: 'in_stock',
    status: 'active',
    is_featured: true,
    is_bestseller: true
  });

  COLORS.forEach((color, cIdx) => {
    SIZES.forEach((size, sIdx) => {
      variantsToInsert.push({
        id: uuid(),
        product_id: pId,
        size: size,
        color: color.name,
        color_hex: color.hex,
        stock: 10,
        price: p.price_sell,
        base_price: p.price_base,
        is_active: true,
        stock_status: 'in_stock',
        is_default: cIdx === 0 && sIdx === 0,
        image_url: p.images[cIdx % p.images.length]
      });
    });
  });
});

async function run() {
  console.log(`Inserting ${productsToInsert.length} real products and ${variantsToInsert.length} variants...`);
  const { error: pErr } = await supabase.from('products').insert(productsToInsert);
  if (pErr) console.error("Error inserting products:", pErr);
  
  const { error: vErr } = await supabase.from('product_variants').insert(variantsToInsert);
  if (vErr) console.error("Error inserting variants:", vErr);
  
  console.log("Real products seeded successfully!");
}

run();
