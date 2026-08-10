export const metadata = {
  title: 'Shipping Policy',
  description: 'Learn about our print-on-demand shipping timelines, partners, and charges.',
}

export default function ShippingPage() {
  return (
    <div className="bg-[#FAF7F4] min-h-screen text-[#1A1A1A] pb-24">
      {/* Header */}
      <div className="text-center pt-6 md:pt-8 pb-12 md:pb-16 border-b border-[#E8E2DB] px-4">
        <span className="inline-block text-[#B8763C] text-xs font-bold uppercase tracking-[0.2em] mb-3">
          Information
        </span>
        <h1 className="text-balance text-4xl md:text-5xl font-bold font-serif tracking-tight text-zinc-900">
          Shipping Policy
        </h1>
      </div>

      {/* Content */}
      <div className="container mx-auto px-5 lg:px-16 xl:px-24 max-w-[800px] mt-12 md:mt-16 bg-white border border-[#E8E2DB] rounded-[32px] p-8 md:p-12 shadow-sm space-y-8 text-sm md:text-base leading-relaxed text-[#444444]">
        <section className="space-y-3">
          <h2 className="text-balance text-xl md:text-2xl font-bold font-serif text-[#1A1A1A]">
            1. Print-on-Demand Fulfillment
          </h2>
          <p>
            All products ordered on Alpona are custom-made specifically for you. Unlike standard retail brands, we do not store pre-printed products. Once your order is placed and payment is cleared:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-4 text-xs md:text-sm">
            <li>Printing/Production: Takes 2-3 business days.</li>
            <li>Packaging & Dispatched: Synced directly from our print partner Qikink.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-balance text-xl md:text-2xl font-bold font-serif text-[#1A1A1A]">
            2. Domestic Shipping & Delivery
          </h2>
          <p>
            We ship to over 20,000 pin codes across India. Transit times vary depending on the destination:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-4 text-xs md:text-sm">
            <li>Metro Cities: 3-5 business days after dispatch.</li>
            <li>Rest of India: 5-7 business days after dispatch.</li>
            <li>Northeast & Remote Regions: 7-9 business days after dispatch.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-balance text-xl md:text-2xl font-bold font-serif text-[#1A1A1A]">
            3. Shipping Rates
          </h2>
          <p>
            Shipping charges are calculated at checkout based on cart totals:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-4 text-xs md:text-sm">
            <li>Orders below ₹999: A flat rate of ₹99 shipping charge is added.</li>
            <li>Orders at or above ₹999: Free shipping is automatically unlocked!</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-balance text-xl md:text-2xl font-bold font-serif text-[#1A1A1A]">
            4. Tracking Your Order
          </h2>
          <p>
            When your package is handed over to the courier (Delhivery, Shiprocket, etc.), we send a shipping confirmation email containing your AWB tracking number. You can monitor your tracking status on our portal at `/order/track`.
          </p>
        </section>
      </div>
    </div>
  )
}
