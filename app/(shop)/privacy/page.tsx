export const metadata = {
  title: 'Privacy Policy',
  description: 'Learn how Alpona collects, processes, and protects your personal data.',
}

export default function PrivacyPage() {
  return (
    <div className="bg-[#FAF7F4] min-h-screen text-[#1A1A1A] pb-24">
      {/* Header */}
      <div className="text-center pt-6 md:pt-8 pb-12 md:pb-16 border-b border-[#E8E2DB] px-4">
        <span className="inline-block text-[#B8763C] text-xs font-bold uppercase tracking-[0.2em] mb-3">
          Legal
        </span>
        <h1 className="text-balance text-4xl md:text-5xl font-bold font-serif tracking-tight text-zinc-900">
          Privacy Policy
        </h1>
      </div>

      {/* Content */}
      <div className="container mx-auto px-5 lg:px-16 xl:px-24 max-w-[800px] mt-12 md:mt-16 bg-white border border-[#E8E2DB] rounded-[32px] p-8 md:p-12 shadow-sm space-y-8 text-sm md:text-base leading-relaxed text-[#444444]">
        <p>
          At **Alpona**, your privacy is of paramount importance to us. This Privacy Policy details how we collect, use, and protect your information when you browse our website, customize templates in our design studio, and make purchases.
        </p>

        <section className="space-y-3">
          <h2 className="text-balance text-xl md:text-2xl font-bold font-serif text-[#1A1A1A]">
            1. Information We Collect
          </h2>
          <p>
            When you purchase products, upload images to our creator studio, or create accounts, we collect:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-4 text-xs md:text-sm">
            <li>**Identity Data**: Full Name, email address, phone number.</li>
            <li>**Shipping Data**: Address details, city, state, and pincode.</li>
            <li>**Design Assets**: Customized PNG/JPEG graphics uploaded to our design editor.</li>
            <li>**Payment Information**: All payments are processed securely through Razorpay. We do not store or collect credit/debit card numbers.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-balance text-xl md:text-2xl font-bold font-serif text-[#1A1A1A]">
            2. How We Use Your Data
          </h2>
          <p>
            We process your personal information to fulfill orders, specifically:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-4 text-xs md:text-sm">
            <li>Passing shipping coordinates and uploaded design mockups to our manufacturing sync partner **Qikink**.</li>
            <li>Sending tracking details and order confirmation updates.</li>
            <li>Managing user accounts and profiles in **Supabase**.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-balance text-xl md:text-2xl font-bold font-serif text-[#1A1A1A]">
            3. Data Retention
          </h2>
          <p>
            We retain your profile data, order history, and design mockups as long as your account remains active. You can request deletion of your account and personal data at any time by contacting our support desk.
          </p>
        </section>
      </div>
    </div>
  )
}
