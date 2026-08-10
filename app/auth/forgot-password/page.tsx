'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  IconLoader,
  IconMail,
  IconArrowRight
} from '@/components/shared/PremiumIcons'
import { MorphingIcon } from '@/components/shared/MorphingIcon'
import { motion } from 'framer-motion'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setError(null)
    setSuccess(false)
    const supabase = createClient()
    
    await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })

    // Always set success to true to prevent email enumeration
    setSuccess(true)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.05,
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as const
      }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-[460px] mx-auto"
    >
      <Card className="bg-background lg:bg-secondary/95 lg:backdrop-blur-md border border-border text-primary shadow-matte-lg rounded-3xl overflow-hidden p-3 sm:p-6 lg:border-white/40">
        <motion.div variants={itemVariants}>
          <CardHeader className="space-y-3 pb-6 text-center lg:text-left">
            <CardTitle className="text-balance text-3xl font-semibold tracking-tight text-primary font-serif">
              Reset password
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs font-light leading-relaxed max-w-[320px] mx-auto lg:mx-0">
              Enter your email address and we'll email you a secure link to reset it.
            </CardDescription>
          </CardHeader>
        </motion.div>

        <CardContent className="space-y-6">
          {success ? (
            <motion.div 
              className="py-6 text-center space-y-4 flex flex-col items-center justify-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.15 }}
              >
                <MorphingIcon name="check" size={64} className="text-emerald-600" strokeWidth={2.5} />
              </motion.div>
              <h3 className="text-balance text-2xl font-bold font-serif text-primary">Check your inbox</h3>
              <p className="text-xs text-muted-foreground font-light max-w-sm leading-relaxed">
                If that email is registered, you'll receive a reset link. Please check your inbox and spam folders.
              </p>
              <Link href="/auth/login" className="pt-4">
                <Button className="bg-primary hover:bg-black text-white font-semibold px-6 rounded-full h-11 text-xs hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 ease-out hover:shadow-matte-sm active:scale-[0.97]">
                  Back to sign in
                </Button>
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <motion.div 
                  variants={itemVariants}
                  className="bg-destructive/5 border border-destructive/20 text-destructive rounded-xl p-3.5 text-xs text-center font-semibold shadow-matte-xs"
                >
                  {error}
                </motion.div>
              )}
              
              <motion.div variants={itemVariants} className="space-y-2 text-left">
                <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Email Address
                </Label>
                <div className="relative">
                  <IconMail className="absolute left-4.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-ring" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    {...register('email')}
                    aria-invalid={errors.email ? "true" : "false"}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className="bg-card border border-transparent focus:border-ring/30 focus:bg-card transition-all duration-300 rounded-lg px-4 text-xs text-primary outline-none focus:ring-2 focus:ring-ring/15 h-11 pl-12 w-full"
                  />
                </div>
                {errors.email && (
                  <p id="email-error" className="text-xs text-destructive font-medium mt-1">
                    {errors.email.message}
                  </p>
                )}
              </motion.div>

              <motion.div variants={itemVariants}>
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-black text-white font-semibold rounded-full h-11 mt-4 cursor-pointer flex items-center justify-center gap-2 shadow-matte-xs hover:shadow-matte-md hover:-translate-y-0.5 transition-all duration-300 ease-out text-xs active:translate-y-0 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <IconLoader className="h-4 w-4 text-white animate-spin" />
                  ) : (
                    <>
                      Send reset link <IconArrowRight className="w-4.5 h-4.5" />
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
          )}
        </CardContent>

        <motion.div variants={itemVariants}>
          <CardFooter className="flex flex-wrap items-center justify-center gap-2 border-t border-border pt-6 pb-2">
            <Link 
              href="/auth/login" 
              className="text-xs font-semibold text-ring hover:text-primary transition-colors flex items-center gap-1.5"
            >
              <MorphingIcon name="arrow-left" className="w-4 h-4" /> Back to sign in
            </Link>
          </CardFooter>
        </motion.div>
      </Card>
    </motion.div>
  )
}
