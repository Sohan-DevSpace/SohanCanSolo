import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { FaqPageClient } from './FaqPageClient'
import Link from 'next/link'
import { MessageCircle, Sparkles, ShieldCheck, Truck, ArrowRight } from 'lucide-react'
import { JsonLd } from '@/components/shared/JsonLd'
import { SITE_NAME, SITE_URL } from '@/constants/config'

export const metadata: Metadata = {
  title: `Frequently Asked Questions | ${SITE_NAME}`,
  description: 'Need help? Check out answers to our most common questions about orders, customized apparel, printing, returns, and shipping.',
  alternates: {
    canonical: `${SITE_URL}/faq`,
  },
  openGraph: {
    title: `Frequently Asked Questions | ${SITE_NAME}`,
    description: 'Find quick answers on custom t-shirts, print quality, shipping times, and returns.',
    url: `${SITE_URL}/faq`,
    siteName: SITE_NAME,
    type: 'website',
  },
}

const STATIC_FALLBACK_FAQS = [
  {
    id: 'f1',
    question: 'How does the custom design studio work?',
    answer: 'It\'s easy! Head over to our "Create Your Own" studio, select the base product (like a Hoodie or Tee), upload your high-resolution artwork (PNG/JPEG), adjust its positioning using our live preview canvas, and add it straight to your cart. We print it exactly as previewed.',
    category: 'Ordering & Customization',
    created_at: new Date().toISOString()
  },
  {
    id: 'f2',
    question: 'What type of design files should I upload?',
    answer: 'For best results, upload PNG files with transparent backgrounds at 150–300 DPI resolution. Avoid low-resolution screenshots to prevent pixelation on printed apparel.',
    category: 'Ordering & Customization',
    created_at: new Date().toISOString()
  },
  {
    id: 'f3',
    question: 'Can I change or cancel my custom order?',
    answer: 'Production starts shortly after payment confirmation. You can request changes or cancellations within 2 hours of placing your order by contacting support. Once printing begins, orders cannot be cancelled.',
    category: 'Ordering & Customization',
    created_at: new Date().toISOString()
  },
  {
    id: 'f4',
    question: 'How long does shipping take?',
    answer: 'Every garment is printed on demand to avoid waste. Production takes 24–48 hours, followed by 3–5 business days express shipping across India with live SMS tracking.',
    category: 'Shipping & Delivery',
    created_at: new Date().toISOString()
  },
  {
    id: 'f5',
    question: 'Do you ship internationally?',
    answer: 'Currently, we ship nationwide within India. International shipping will be launched soon!',
    category: 'Shipping & Delivery',
    created_at: new Date().toISOString()
  },
  {
    id: 'f6',
    question: 'What is your return & exchange policy?',
    answer: 'We offer a 7-day hassle-free return and size exchange policy for standard apparel. Custom workbench orders are non-refundable unless there is a print or garment defect, in which case we issue a 100% free replacement.',
    category: 'Returns & Refunds',
    created_at: new Date().toISOString()
  },
  {
    id: 'f7',
    question: 'How do I care for printed apparel?',
    answer: 'To maximize print durability, wash garments inside out in cold water with mild detergent. Tumble dry low or line dry in shade. Never iron directly on the printed graphic.',
    category: 'Product Care',
    created_at: new Date().toISOString()
  },
  {
    id: 'f8',
    question: 'Is Cash on Delivery (COD) supported?',
    answer: 'Yes! Cash on Delivery is supported nationwide alongside instant Razorpay checkout via UPI, NetBanking, and credit/debit cards.',
    category: 'Ordering & Customization',
    created_at: new Date().toISOString()
  }
]

export default async function FAQPage() {
  const supabase = await createClient()

  // Try to fetch FAQs from DB
  const { data: dbFaqs, error } = await supabase
    .from('faqs')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching FAQs:', error)
  }

  // Use DB FAQs if available, otherwise fallback to static ones
  const faqs = dbFaqs && dbFaqs.length > 0 ? dbFaqs : STATIC_FALLBACK_FAQS

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f: any) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  }

  return (
    <div className="bg-[#FAF7F4] min-h-screen text-[#1A1A1A] pb-24">
      <JsonLd data={faqSchema} />
      {/* Hero Header */}
      <div className="text-center pt-8 md:pt-14 pb-12 md:pb-16 border-b border-[#E8E2DB] px-5 max-w-[1440px] mx-auto">
        <span className="inline-block font-body text-[11px] font-bold uppercase tracking-[0.2em] text-[#B8763C] mb-3 bg-[#B8763C]/10 border border-[#B8763C]/20 px-3.5 py-1 rounded-full">
          Help Center & Guidance
        </span>
        <h1 className="text-balance text-4xl md:text-5xl lg:text-6xl font-bold font-serif tracking-tight text-[#1A1A1A]">
          Frequently Asked Questions
        </h1>
        <p className="text-[#6B6560] text-sm md:text-base mt-4 max-w-xl mx-auto leading-relaxed">
          Quick answers on print quality, custom design studio, express shipping across India, and size returns.
        </p>

        {/* High Trust Hero Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mt-8 pt-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1A1A1A] bg-white border border-[#E8E2DB] px-3.5 py-1.5 rounded-full shadow-xs">
            <Truck className="w-3.5 h-3.5 text-[#B8763C]" /> Express Shipping India
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1A1A1A] bg-white border border-[#E8E2DB] px-3.5 py-1.5 rounded-full shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% Quality Guarantee
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1A1A1A] bg-white border border-[#E8E2DB] px-3.5 py-1.5 rounded-full shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> 24/7 AI Smart Assistant
          </div>
        </div>
      </div>

      {/* Tabs and Accordions */}
      <FaqPageClient faqs={faqs} />

      {/* Bottom Direct Support CTA */}
      <div className="max-w-[800px] mx-auto px-5 mt-16">
        <div className="bg-[#1A1A1A] text-white rounded-3xl p-8 md:p-10 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left z-10">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#D4A574]">
              Still Have Questions?
            </span>
            <h3 className="font-serif text-2xl md:text-3xl font-bold leading-tight">
              We&apos;re Here to Help
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm">
              Connect directly with our support team on WhatsApp or chat with our 24/7 AI Smart Assistant.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 z-10 w-full md:w-auto">
            <Link
              href="https://wa.me/918100412401?text=Hi%20Alpona%20Support%2C%20I%20have%20a%20question%20about%20my%20order"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md active:scale-95 min-h-[44px]"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              WhatsApp Support
            </Link>
          </div>

          {/* Background Decorative Pattern */}
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-[#B8763C]/10 rounded-full blur-2xl pointer-events-none" />
        </div>
      </div>
    </div>
  )
}
