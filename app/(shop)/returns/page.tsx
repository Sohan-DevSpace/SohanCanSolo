export const metadata = {
  title: 'Returns & Exchanges',
  description: 'Learn about our print-on-demand returns, exchanges, and refund policy.',
}

export default function ReturnsPage() {
  return (
    <div className="bg-[#FAF7F4] min-h-screen text-[#1A1A1A] pb-24">
      {/* Header */}
      <div className="text-center pt-6 md:pt-8 pb-12 md:pb-16 border-b border-[#E8E2DB] px-4">
        <span className="inline-block text-[#B8763C] text-xs font-bold uppercase tracking-[0.2em] mb-3">
          Information
        </span>
        <h1 className="text-balance text-4xl md:text-5xl font-bold font-serif tracking-tight text-zinc-900">
          Returns & Exchanges
        </h1>
      </div>

      {/* Content */}
      <div className="container mx-auto px-5 lg:px-16 xl:px-24 max-w-[800px] mt-12 md:mt-16 bg-white border border-[#E8E2DB] rounded-[32px] p-8 md:p-12 shadow-sm space-y-8 text-sm md:text-base leading-relaxed text-[#444444]">
        <section className="space-y-3">
          <h2 className="text-balance text-xl md:text-2xl font-bold font-serif text-[#1A1A1A]">
            1. Print-on-Demand Policy
          </h2>
          <p>
            Because every single apparel, mug, or accessory ordered is custom printed to order, **we do not accept returns or exchanges for sizing issues, color choices, or change of mind**.
          </p>
          <p>
            Please double-check size measurements using the sizing charts available on each product page before submitting checkout details.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-balance text-xl md:text-2xl font-bold font-serif text-[#1A1A1A]">
            2. Damaged or Defective Items
          </h2>
          <p>
            If you receive a product that is damaged in transit, contains a print/embellishment error, or has a manufacturing defect, we will gladly arrange a **free replacement or issue a full refund**.
          </p>
          <p className="font-semibold text-[#1A1A1A]">
            Criteria for replacement/refund:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-4 text-xs md:text-sm">
            <li>You must submit your request within 30 days of receiving the package.</li>
            <li>You must provide clear photos of the defect, the product layout, and the shipping label.</li>
            <li>The item must be unused, unwashed, and in its original packaging.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-balance text-xl md:text-2xl font-bold font-serif text-[#1A1A1A]">
            3. How to Request a Replacement
          </h2>
          <p>
            To submit a claim, please send an email to <span className="text-[#B8763C] font-semibold">support@alpona.com</span> with:
          </p>
          <ol className="list-decimal list-inside space-y-1.5 pl-4 text-xs md:text-sm">
            <li>Your Order Number (e.g., ORD-XXXXXXXX-XXXXX).</li>
            <li>A brief description of the defect or shipping issue.</li>
            <li>Attached photos showing the damage or misprinted design.</li>
          </ol>
          <p>
            Once approved by our support team, we will dispatch a brand-new replacement at no extra charge or issue a full refund to your original payment method.
          </p>
        </section>
      </div>
    </div>
  )
}
