export interface QikinkProduct {
  sku: string
  name: string
  collection: string
  gender: 'men' | 'women' | 'kids' | 'unisex'
  basePrice: number
  availableColors: string[]
  availableSizes: string[]
  printPositions: string[]
  printingTypes: ('DTG' | 'Embroidery' | 'DTF')[]
  image?: string
}

export const QIKINK_CATEGORIES = [
  {
    id: 'tshirts',
    name: 'T-Shirts',
    desc: 'Classic, oversized, crop tops, polo, raglan and more.',
    image: '/images/categories/tshirts.png', 
    productCount: 27
  },
  {
    id: 'hoodies',
    name: 'Hoodies & Jackets',
    desc: 'Pullovers, zip hoodies, sweatshirts, bomber jackets.',
    image: '/images/categories/hoodies.png',
    productCount: 12
  },
  {
    id: 'bottomwear',
    name: 'Bottomwear',
    desc: 'Joggers, sweatpants, shorts and more.',
    image: '/images/categories/bottomwear.png',
    productCount: 6
  },
  {
    id: 'kids',
    name: 'Kids Clothing',
    desc: 'T-shirts and hoodies sized for children.',
    image: '/images/categories/kids.png',
    productCount: 5
  }
]

export const QIKINK_PRODUCTS: QikinkProduct[] = [
  // T-SHIRTS
  { sku: 'US21', name: 'Male Standard Crew T-Shirt', collection: 'tshirts', gender: 'men',
    basePrice: 170, availableColors: ['White', 'Black'], availableSizes: ['S','M','L','XL','XXL'],
    printPositions: ['front', 'back', 'left_pocket'], printingTypes: ['DTG', 'DTF'] },
  
  { sku: 'UC22', name: 'Unisex Oversized Classic T-Shirt', collection: 'tshirts', gender: 'unisex',
    basePrice: 265, availableColors: ['White', 'Black', 'Grey', 'Navy'], availableSizes: ['S','M','L','XL','XXL'],
    printPositions: ['front', 'back'], printingTypes: ['DTG', 'DTF'] },
  
  { sku: 'FT47', name: 'Female Baby Tee', collection: 'tshirts', gender: 'women',
    basePrice: 180, availableColors: ['White', 'Black', 'Pink'],
    availableSizes: ['XS','S','M','L','XL'], printPositions: ['front', 'back'], printingTypes: ['DTG'] }
]
