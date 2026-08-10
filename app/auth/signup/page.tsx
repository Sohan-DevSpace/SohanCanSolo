'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion } from 'framer-motion'
import {
  IconLoader,
  IconArrowRight,
  IconSparkles,
} from '@/components/shared/PremiumIcons'
import { Eye, EyeOff, Mail, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import { AnimatedInput } from '@/components/ui/AnimatedInput'

const signupSchema = z.object({
  fullName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long.' })
    .regex(/[A-Za-z]/, { message: 'Password must contain at least one letter.' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number.' }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type SignupFormValues = z.infer<typeof signupSchema>

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl') || '/account'
  
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupFormValues) => {
    setError(null)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          password: data.password,
        }),
      })

      const result = await res.json()

      if (!res.ok || result.error) {
        const errorMsg = typeof result.error === 'string' 
          ? result.error 
          : result.error?.message || 'Failed to create account.'
        setError(errorMsg)
        return
      }

      if (result.sessionExists) {
        toast.success('Account created successfully')
        router.push(returnUrl)
        router.refresh()
      } else {
        toast.success('Please check your email to verify your account')
        router.push('/auth/login')
      }
    } catch {
      setError('An unexpected network error occurred. Please try again.')
    }
  }

  const handleGoogleLogin = async () => {
    setError(null)
    try {
      const supabase = createClient()
      const redirectOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://alpona.vercel.app'
      const redirectUrl = `${redirectOrigin}/auth/callback?next=${encodeURIComponent(returnUrl)}`
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      })
      if (error) {
        setError(error.message || 'Failed to initiate Google authentication.')
      }
    } catch {
      setError('An unexpected error occurred initiating Google sign up.')
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 pt-10 pb-[max(2.5rem,env(safe-area-inset-bottom))] lg:py-8 lg:w-full lg:max-w-none"
    >
      
      {/* Desktop Left Content */}
      <motion.div 
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:flex flex-col w-[400px] shrink-0 text-white"
      >
        <span className="text-xs font-bold tracking-[0.3em] text-[#B8763C] uppercase block mb-4">Join Alpona</span>
        <h1 className="text-balance text-6xl font-light font-serif leading-[1.1] tracking-tight drop-shadow-sm">
          Join <br />
          <span className="italic text-[#B8763C]">Alpona</span>
        </h1>
        
        <div className="flex items-center gap-4 my-10 opacity-80">
          <svg width="12" height="12" viewBox="0 0 24 24" className="fill-[#B8763C]">
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>
          <div className="h-[1px] w-32 bg-gradient-to-r from-[#B8763C]/60 to-transparent" />
        </div>

        <p className="text-sm text-white/70 font-medium leading-relaxed mb-12 max-w-[360px]">
          Create an account to save your custom designs, track orders, and unlock member perks.
        </p>

        <div className="flex justify-between items-start gap-6">
          <div className="flex flex-col gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-500">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="stroke-[#B8763C]" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white mb-0.5">Secure & Private</h4>
              <p className="text-[10px] font-medium text-white/50">Your data is protected</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-500">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="stroke-[#B8763C]" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z"/><path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"/></svg>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white mb-0.5">Sustainable</h4>
              <p className="text-[10px] font-medium text-white/50">Zero waste production</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-500">
              <IconSparkles size={16} className="text-[#B8763C]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white mb-0.5">Premium Quality</h4>
              <p className="text-[10px] font-medium text-white/50">Made just for you</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Top Text */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="lg:hidden w-full px-6 mb-6 mt-2 text-white text-center"
      >
        <span className="text-[10px] font-bold tracking-[0.25em] text-[#B8763C] uppercase block mb-3">Join Alpona</span>
        <h1 className="text-balance text-4xl font-light font-serif leading-[1.1]">
          Join <span className="italic text-[#B8763C]">Alpona</span>
        </h1>
      </motion.div>

      {/* Main Glassmorphic Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="w-full bg-[#0A0A0A]/90 lg:bg-[#0A0A0A]/60 backdrop-blur-2xl rounded-[32px] p-8 sm:p-12 lg:w-[480px] shadow-[0_8px_40px_0_rgba(0,0,0,0.6)] border border-white/20 flex flex-col relative overflow-hidden"
      >
        <style>{`
          input:-webkit-autofill,
          input:-webkit-autofill:hover, 
          input:-webkit-autofill:focus, 
          input:-webkit-autofill:active{
              -webkit-box-shadow: 0 0 0 30px rgba(0, 0, 0, 0.5) inset !important;
              -webkit-text-fill-color: white !important;
              transition: background-color 5000s ease-in-out 0s;
          }
        `}</style>
        {/* Subtle inner glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-[32px]" />
        
        {/* Mobile drag indicator */}
        <div className="w-12 h-1.5 bg-white/30 rounded-full mx-auto mb-8 lg:hidden" />

        <div className="mb-8 text-center lg:text-left relative z-10">
          <h2 className="text-balance text-3xl font-serif text-white mb-3 tracking-tight">Create an account</h2>
          <p className="text-white/80 text-[13px] font-medium leading-relaxed max-w-[320px] mx-auto lg:mx-0">Enter your details below to create your design studio account and save custom apparel.</p>
        </div>

        {/* Social Logins — Google Only */}
        <div className="flex flex-col gap-3.5 mb-8 relative z-10">
          <button onClick={handleGoogleLogin} type="button" className="group active:scale-[0.98] w-full h-12 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center gap-3 text-[14px] font-semibold text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300 shadow-sm cursor-pointer">
            <svg className="w-[18px] h-[18px] group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.61 14.99 1 12 1 7.35 1 3.4 3.65 1.57 7.5L5.05 10.2C5.9 7.22 8.69 5.04 12 5.04z" />
              <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.7 2.87c2.16-2 3.73-4.94 3.73-8.6z" />
              <path fill="#FBBC05" d="M5.05 13.8c-.24-.72-.37-1.5-.37-2.3s.13-1.58.37-2.3L1.57 6.5C.57 8.5 0 10.7 0 13s.57 4.5 1.57 6.5l3.48-2.7z" />
              <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.03.69-2.35 1.1-4.26 1.1-3.31 0-6.1-2.18-6.95-5.16L1.57 16.5C3.4 20.35 7.35 23 12 23z" />
            </svg>
            Continue with Google
          </button>
        </div>

        <div className="flex items-center gap-4 mb-8 relative z-10">
          <div className="h-px bg-white/20 flex-1" />
          <span className="text-[11px] text-white/70 uppercase tracking-widest font-bold">Or register with</span>
          <div className="h-px bg-white/20 flex-1" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl p-4 text-sm text-center font-semibold backdrop-blur-md" role="alert">
              {error}
            </motion.div>
          )}
          
          <AnimatedInput
            id="fullName"
            label="Full Name"
            register={register('fullName')}
            error={errors.fullName?.message}
            icon={<User className="w-[20px] h-[20px]" strokeWidth={1.5} />}
          />

          <AnimatedInput
            id="email"
            type="email"
            label="Email Address"
            register={register('email')}
            error={errors.email?.message}
            icon={<Mail className="w-[20px] h-[20px]" strokeWidth={1.5} />}
          />

          <AnimatedInput
            id="password"
            type="password"
            label="Password"
            register={register('password')}
            error={errors.password?.message}
          />

          <AnimatedInput
            id="confirmPassword"
            type="password"
            label="Confirm Password"
            register={register('confirmPassword')}
            error={errors.confirmPassword?.message}
          />

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="group relative active:scale-[0.98] w-full h-14 bg-white hover:bg-gray-100 text-black rounded-2xl mt-4 text-[15px] font-bold flex items-center justify-center gap-2 transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-[0_4px_20px_0_rgba(255,255,255,0.3)]"
          >
            <div className="absolute inset-0 bg-black/5 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-700 ease-in-out" />
            {isSubmitting ? <IconLoader className="w-6 h-6 animate-spin" /> : <>Sign up <IconArrowRight className="w-[20px] h-[20px] group-hover:translate-x-1 transition-transform" /></>}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-white/50 relative z-10">
          Already have an account? <Link href={`/auth/login?returnUrl=${returnUrl}`} className="text-[#B8763C] font-semibold hover:text-white transition-colors border-b border-[#B8763C]/30 hover:border-white pb-0.5 ml-1">Sign in</Link>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><IconLoader className="w-8 h-8 text-[#B8763C] animate-spin" /></div>}>
      <SignupForm />
    </Suspense>
  )
}
