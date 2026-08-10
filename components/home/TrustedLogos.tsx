'use client'

import { motion } from 'framer-motion'

export function TrustedLogos() {
  const logos = [
    { name: 'YOURSTORY', style: 'font-extrabold tracking-tighter text-sm' },
    { name: 'INDIE HACKERS', style: 'font-display font-semibold tracking-wide text-xs' },
    { name: 'MENSXP', style: 'font-sans font-black tracking-normal text-sm' },
    { name: 'BEING CREATIVE', style: 'font-mono tracking-widest text-xs' },
    { name: 'Inc42', style: 'font-serif font-black tracking-tight text-sm' },
    { name: 'FASHION', style: 'font-serif tracking-[0.25em] text-xs font-light' },
  ]

  return (
    <section className="py-16 bg-[#FAF7F4] border-b border-[#E8E2DB]/30 select-none relative overflow-hidden">
      <div className="absolute inset-0 bg-white/20 blur-[80px] pointer-events-none" />
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8A8580] mb-8">
          Trusted by Creators. Loved by Thousands.
        </p>
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.06,
                delayChildren: 0.1,
              }
            }
          }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 md:gap-x-16"
        >
          {logos.map((logo, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, y: 12 },
                show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 20 } }
              }}
              whileHover={{ scale: 1.05 }}
              className={`text-[#6B6560] hover:text-primary transition-all duration-200 active:scale-[0.97] cursor-pointer select-none ${logo.style}`}
            >
              {logo.name}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
