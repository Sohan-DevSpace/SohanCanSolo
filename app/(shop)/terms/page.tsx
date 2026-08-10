export const metadata = {
  title: 'Terms & Conditions',
  description: 'Learn about our terms of service, checkout conditions, and customer agreements.',
}

export default function TermsPage() {
  return (
    <div className="bg-[#FAF7F4] min-h-screen text-[#1A1A1A] pb-24">
      {/* Header */}
      <div className="text-center pt-6 md:pt-8 pb-12 md:pb-16 border-b border-[#E8E2DB] px-4">
        <span className="inline-block text-[#B8763C] text-xs font-bold uppercase tracking-[0.2em] mb-3">
          Legal
        </span>
        <h1 className="text-balance text-4xl md:text-5xl font-bold font-serif tracking-tight text-zinc-900">
          Terms & Conditions
        </h1>
      </div>

      {/* Content */}
      <div className="container mx-auto px-5 lg:px-16 xl:px-24 max-w-[800px] mt-12 md:mt-16 bg-white border border-[#E8E2DB] rounded-[32px] p-8 md:p-12 shadow-sm space-y-8 text-sm md:text-base leading-relaxed text-[#444444]">
        <p>
          Welcome to **Alpona**. By accessing our website, browsing our catalog, or making orders, you agree to comply with and be bound by the following Terms & Conditions.
        </p>

        <section className="space-y-3">
          <h2 className="text-balance text-xl md:text-2xl font-bold font-serif text-[#1A1A1A]">
            1. User-Uploaded Designs
          </h2>
          <p>
            When using our **Custom Design Studio**, you are solely responsible for the designs and files you upload:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-4 text-xs md:text-sm">
            <li>You warrant that you own or have the licensing rights to print all uploaded graphics.</li>
            <li>We do not print materials that violate copyright laws, trademark protections, or contain highly offensive content.</li>
            <li>We reserve the right to review and cancel orders containing intellectual property violations.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-balance text-xl md:text-2xl font-bold font-serif text-[#1A1A1A]">
            2. Orders & Payment
          </h2>
          <p>
            All prices listed on our website are inclusive of GST. Shipping charges are added separately at checkout. Payments must be processed in full using our integrated Razorpay portal prior to order fulfillment.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-balance text-xl md:text-2xl font-bold font-serif text-[#1A1A1A]">
            3. Limitation of Liability
          </h2>
          <p>
            We attempt to represent colors and print alignments on our live mockup generator as accurately as possible. However, actual printed garments might have slight shifts in placement or minor differences in color hue due to direct-to-garment (DTG) print fabrics and monitor color settings. We are not liable for minor variations.
          </p>
        </section>
      </div>
    </div>
  )
}
