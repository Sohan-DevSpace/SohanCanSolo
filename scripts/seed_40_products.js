require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ggielaflfgkkfubwfgck.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to generate UUID
const uuid = () => crypto.randomUUID();

// High end Unsplash imagery per category
const IMAGES = {
  tshirts: [
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80',
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80'
  ],
  bags: [
    'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80',
    'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&q=80',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80',
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
    'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&q=80'
  ],
  kids: [
    'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800&q=80',
    'https://images.unsplash.com/photo-1622290319146-7b63df48a635?w=800&q=80',
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',
    'https://images.unsplash.com/photo-1519689680058-324335c77eb2?w=800&q=80',
    'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80'
  ],
  hoodies: [
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80',
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80',
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80'
  ]
};

const NAMES = {
  tshirts: [
    "The Core Oversized Tee", "Vintage Wash Drop Shoulder", "Heavyweight Boxy Crewneck", 
    "Essential Mock Neck Tee", "Raw Edge Streetwear Top", "Minimalist Pima Cotton Tee",
    "Signature Heavy Blank", "Faded Washed Blank Tee", "Athletic Cut Gym Tee", "Luxury Staple Crewneck"
  ],
  bags: [
    "Minimalist Utility Tote", "Leather Trimmed Carryall", "Heavy Canvas Weekend Bag",
    "Structured Commuter Tote", "Matte Black Crossbody", "Tactical Nylon Duffle",
    "Everyday Shopper Bag", "Luxury Leather Sling", "Raw Canvas Gym Bag", "Urban Explorer Backpack"
  ],
  kids: [
    "Organic Cotton Romper", "Ribbed Knit Two-Piece", "Pastel Waffle Set",
    "Soft Linen Jumpsuit", "Earth Tone Baby Sweater", "Toddler Minimalist Hoodie",
    "Cozy Fleece Kids Set", "GOTS Certified Bodysuit", "Miniature Streetwear Pants", "Premium Terry Shorts"
  ],
  hoodies: [
    "Heritage Heavyweight Fleece", "450GSM Loopback Crew", "Oversized French Terry Hoodie",
    "Double-Lined Essential Hoodie", "Vintage Washed Pullover", "Boxy Fit Zip-Up",
    "Streetwear Utility Sweater", "Minimalist Drop-Shoulder Hoodie", "Premium Thick Fleece", "Signature Blank Hoodie"
  ]
};

const METADATA = {
  tshirts: {
    category_id: '6471d0c7-dc06-4fb7-ac9f-acdbc2efd75c',
    subcategory_id: 'acd9d21e-cd90-4428-984b-ba545ac756be',
    product_type_id: '80a49a3a-b0f7-4fcd-ae4c-0cc4a4faac31',
    price_base: 599, price_sell: 1299,
    colors: [{name: 'Off-White', hex: '#FDFBF7'}, {name: 'Charcoal', hex: '#363636'}, {name: 'Olive', hex: '#556B2F'}],
    sizes: ['S', 'M', 'L', 'XL']
  },
  bags: {
    category_id: '8d10f607-0ff0-4e22-a115-916c2818785b',
    subcategory_id: '456b5991-bb34-4d8d-bab3-fbb16d651023',
    product_type_id: '177c6b66-9d0f-4bbe-9411-9e6b8c57167d',
    price_base: 499, price_sell: 899,
    colors: [{name: 'Sand', hex: '#E6DEC9'}, {name: 'Olive Drab', hex: '#4B5320'}],
    sizes: ['One Size']
  },
  kids: {
    category_id: '14d3ef11-dcad-4792-8f28-fd680574ce35',
    subcategory_id: 'bec64e05-7a4a-4049-8f30-c648e3e17c44',
    product_type_id: 'd5abd6cc-d8c3-405d-af4d-e7c27d613650',
    price_base: 399, price_sell: 749,
    colors: [{name: 'Sage', hex: '#8F9779'}, {name: 'Rose', hex: '#B76E79'}, {name: 'Cream', hex: '#FFFDD0'}],
    sizes: ['6-12M', '12-18M', '18-24M']
  },
  hoodies: {
    category_id: '78a3582e-6ec4-4962-9aee-20a74f536b55',
    subcategory_id: '12bf9871-3310-449e-b9b2-ff6b62acb6c2',
    product_type_id: '83bd4782-ee92-4fbc-b40b-d2c679a832fa',
    price_base: 1199, price_sell: 2499,
    colors: [{name: 'Desert Sand', hex: '#C2B280'}, {name: 'Jet Black', hex: '#0A0A0A'}],
    sizes: ['S', 'M', 'L', 'XL']
  }
};

const productsToInsert = [];
const variantsToInsert = [];

Object.keys(NAMES).forEach(catKey => {
  const meta = METADATA[catKey];
  const names = NAMES[catKey];
  const images = IMAGES[catKey];

  names.forEach((name, idx) => {
    const pId = uuid();
    const pImages = [images[idx % images.length], images[(idx+1) % images.length], images[(idx+2) % images.length]];
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + idx;

    productsToInsert.push({
      id: pId,
      name: name,
      slug: slug,
      description: `Premium ${name} meticulously crafted for style and longevity. True high-end streetwear.`,
      category_id: meta.category_id,
      subcategory_id: meta.subcategory_id,
      product_type_id: meta.product_type_id,
      base_price: meta.price_base,
      selling_price: meta.price_sell,
      images: pImages,
      is_active: true,
      display_name: name,
      short_description: `High-End Luxury ${name}`,
      product_highlights: ['Premium Material', 'Comfort Fit', 'Minimalist Aesthetics', 'Durable Construction'],
      stock_status: 'in_stock',
      status: 'active',
      is_featured: idx === 0,
      is_bestseller: idx === 1
    });

    meta.colors.forEach((color, cIdx) => {
      meta.sizes.forEach((size, sIdx) => {
        variantsToInsert.push({
          id: uuid(),
          product_id: pId,
          size: size,
          color: color.name,
          color_hex: color.hex,
          stock: 50,
          price: meta.price_sell,
          base_price: meta.price_base,
          is_active: true,
          stock_status: 'in_stock',
          is_default: cIdx === 0 && sIdx === 0,
          image_url: pImages[cIdx % pImages.length]
        });
      });
    });
  });
});

async function run() {
  console.log(`Prepared ${productsToInsert.length} products and ${variantsToInsert.length} variants.`);
  
  console.log("Inserting products...");
  for(let i = 0; i < productsToInsert.length; i += 10) {
    const chunk = productsToInsert.slice(i, i+10);
    const { error } = await supabase.from('products').insert(chunk);
    if(error) console.error("Error inserting products:", error);
  }

  console.log("Inserting variants...");
  for(let i = 0; i < variantsToInsert.length; i += 50) {
    const chunk = variantsToInsert.slice(i, i+50);
    const { error } = await supabase.from('product_variants').insert(chunk);
    if(error) console.error("Error inserting variants:", error);
  }

  console.log("Database seeded successfully!");
}

run();
