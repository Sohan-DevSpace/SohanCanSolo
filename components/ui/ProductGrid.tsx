import { ProductCard, ProductWithCategory } from './ProductCard'

interface ProductGridProps {
  products: ProductWithCategory[]
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center px-6">
        <div className="w-24 h-24 rounded-3xl bg-[#F8F4EF] border-2 border-dashed border-[#E8E2DB] flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-[#BBAE9E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-[#1A1A1A]" style={{ fontFamily: "'Georgia', serif" }}>
          No products found
        </h3>
        <p className="text-sm text-[#888] mt-2 max-w-xs leading-relaxed">
          Try adjusting your category or price filters to find what you are looking for.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} index={i} />
      ))}
    </div>
  )
}
