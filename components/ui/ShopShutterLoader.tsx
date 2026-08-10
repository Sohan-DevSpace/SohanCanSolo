'use client'

import React, { useEffect, useState, useRef, useMemo } from 'react'
import Image from 'next/image'
import { motion, useAnimationControls, useMotionValue, useTransform, animate } from 'framer-motion'

interface ShopShutterLoaderProps {
  onComplete: () => void
}

/* ═══════════════════════════════════════════════════════
   Expo-out easing for silky deceleration.
   All motion in this file uses this or a variant of it.
   ═══════════════════════════════════════════════════════ */
const EXPO_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]
const QUINT_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]
const SHUTTER_EASE: [number, number, number, number] = [0.76, 0, 0.24, 1]

/* ─── Floating Dust Motes (deterministic, stable across renders) ─── */
function DustMotes() {
  const motes = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: ((i * 37 + 11) % 100),
        y: ((i * 53 + 7) % 100),
        size: 1 + (i % 3),
        delay: (i * 0.5) % 3.5,
        duration: 6 + (i % 4) * 2,
        opacity: 0.08 + (i % 5) * 0.04,
      })),
    []
  )

  return (
    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
      {motes.map(m => (
        <motion.div
          key={m.id}
          className="absolute rounded-full"
          style={{
            width: m.size,
            height: m.size,
            left: `${m.x}%`,
            top: `${m.y}%`,
            backgroundColor: '#B8763C',
          }}
          animate={{
            y: [0, -20, -10, -35],
            x: [0, 6, -5, 3],
            opacity: [0, m.opacity, m.opacity * 0.5, 0],
          }}
          transition={{
            duration: m.duration,
            delay: m.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

/* ─── Animated Brand Letters with blur-in ─── */
function BrandLetters({ phase, reducedMotion }: { phase: string; reducedMotion: boolean }) {
  const letters = 'ALPONA'.split('')

  if (reducedMotion) {
    return (
      <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light tracking-[0.3em] text-white">
        ALPONA
      </h1>
    )
  }

  return (
    <div className="flex items-baseline gap-[0.04em]">
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
          animate={
            phase !== 'idle'
              ? { opacity: 1, y: 0, filter: 'blur(0px)' }
              : {}
          }
          transition={{
            duration: 0.8,
            delay: 0.5 + i * 0.09,
            ease: EXPO_OUT,
          }}
          className="inline-block font-serif text-4xl sm:text-5xl md:text-6xl font-light tracking-[0.3em] text-white will-change-[transform,opacity,filter]"
        >
          {letter}
        </motion.span>
      ))}
    </div>
  )
}

/* ─── Progress Bar with smooth gradient sweep ─── */
function ProgressLine({ phase }: { phase: string }) {
  const getWidth = () => {
    switch (phase) {
      case 'idle': return '0%'
      case 'unlocking': return '35%'
      case 'shuddering': return '65%'
      case 'rolling': return '100%'
      default: return '100%'
    }
  }

  return (
    <div className="w-20 h-px bg-white/[0.06] overflow-hidden mt-8">
      <motion.div
        className="h-full"
        style={{ background: 'linear-gradient(to right, #8B5523, #B8763C, #D4A574)' }}
        animate={{ width: getWidth() }}
        transition={{ duration: 1.2, ease: EXPO_OUT }}
      />
    </div>
  )
}

/* ─── Light Streak Sweep (horizontal gleam across the sign) ─── */
function LightStreak({ phase }: { phase: string }) {
  return (
    <motion.div
      className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-2xl"
      initial={{ opacity: 0 }}
      animate={phase === 'unlocking' ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="absolute top-0 bottom-0 w-[120px]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
          filter: 'blur(1px)',
        }}
        initial={{ x: '-120px' }}
        animate={phase !== 'idle' ? { x: '400px' } : {}}
        transition={{ duration: 1.8, delay: 0.8, ease: QUINT_OUT }}
      />
    </motion.div>
  )
}

export function ShopShutterLoader({ onComplete }: ShopShutterLoaderProps) {
  const [phase, setPhase] = useState<'idle' | 'unlocking' | 'shuddering' | 'rolling' | 'finished'>('idle')
  const shutterControls = useAnimationControls()
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const totalSlats = 14
  const slatHeightPercent = 100 / totalSlats

  // Detect reduced motion preference
  const [reducedMotion, setReducedMotion] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    const playTimeline = async () => {
      if (reducedMotion) {
        setPhase('unlocking')
        await new Promise(r => setTimeout(r, 1200))
        setPhase('finished')
        onCompleteRef.current()
        return
      }

      // Phase 1: Ambient hold — let darkness breathe
      await new Promise(r => setTimeout(r, 600))
      setPhase('unlocking')

      // Phase 2: Unlock — padlock swings, brand reveals
      await new Promise(r => setTimeout(r, 1100))
      setPhase('shuddering')

      // Phase 3: Mechanical shudder — tension release with micro-vibrations
      await shutterControls.start({
        y: [0, -4, 2.5, -1.5, 0.8, 0],
        transition: { duration: 0.35, ease: 'easeInOut' },
      })

      // Tiny breath before the big reveal
      await new Promise(r => setTimeout(r, 200))

      // Phase 4: Roll up — the grand reveal
      setPhase('rolling')
      await new Promise(r => setTimeout(r, 2200))

      setPhase('finished')
      onCompleteRef.current()
    }

    playTimeline()
  }, [shutterControls, reducedMotion])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={phase === 'finished' ? { opacity: 0 } : {}}
      transition={{ duration: 0.5, ease: EXPO_OUT }}
      className="fixed inset-0 z-[99999] overflow-hidden pointer-events-auto"
    >
      {/* ─── Deep Ambient Background ─── */}
      <motion.div
        className="absolute inset-0 bg-black"
        animate={phase === 'rolling' ? { opacity: 0 } : {}}
        transition={{ duration: 2, ease: QUINT_OUT }}
      />

      {/* ─── Bronze Ambient Glow ─── */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background: 'radial-gradient(ellipse 450px 350px at 50% 50%, rgba(184, 118, 60, 0.08) 0%, transparent 70%)',
        }}
        initial={{ opacity: 0 }}
        animate={{
          opacity: phase === 'idle' ? 0
            : phase === 'unlocking' ? 0.6
            : phase === 'shuddering' ? 1
            : 0.3,
        }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      />

      {/* ─── Film Grain ─── */}
      <div
        className="absolute inset-0 opacity-[0.018] pointer-events-none z-[2] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ─── Floating Dust Motes ─── */}
      {!reducedMotion && <DustMotes />}

      {/* ─── Guide Rails ─── */}
      <div className="absolute left-0 top-0 bottom-0 w-2 sm:w-3 md:w-4 bg-neutral-950 z-30 pointer-events-none">
        <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/[0.05] to-transparent" />
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-2 sm:w-3 md:w-4 bg-neutral-950 z-30 pointer-events-none">
        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-white/[0.05] to-transparent" />
      </div>

      {/* ─── Top Valance ─── */}
      <div className="absolute top-0 left-0 right-0 h-10 sm:h-12 md:h-14 z-40 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black to-neutral-950" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            initial={{ opacity: 0, filter: 'blur(4px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1, delay: 0.2, ease: EXPO_OUT }}
            className="text-[7px] sm:text-[8px] tracking-[0.5em] uppercase text-neutral-600 font-semibold"
          >
            Alpona Studio
          </motion.span>
        </div>
      </div>

      {/* ═══════════ SHUTTER SLATS ═══════════ */}
      {!reducedMotion && (
        <motion.div
          animate={shutterControls}
          className="relative w-full h-full flex flex-col z-20"
        >
          {Array.from({ length: totalSlats }).map((_, i) => {
            const reverseIndex = totalSlats - 1 - i
            // Exponential stagger: bottom slats leave first, top slats accelerate
            const staggerDelay = Math.pow(reverseIndex / totalSlats, 0.7) * 0.9

            return (
              <motion.div
                key={i}
                style={{ height: `${slatHeightPercent}vh` }}
                initial={{ y: 0, opacity: 1 }}
                animate={
                  phase === 'rolling'
                    ? {
                        y: `-${(i + 1) * slatHeightPercent + 5}vh`,
                        opacity: [1, 1, 0],
                      }
                    : {}
                }
                transition={{
                  duration: 0.8,
                  delay: staggerDelay,
                  ease: SHUTTER_EASE,
                  opacity: { duration: 0.6, delay: staggerDelay + 0.2 },
                }}
                className="relative w-full shrink-0 overflow-hidden will-change-transform"
              >
                {/* Slat body */}
                <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 to-black" />

                {/* Top edge highlight */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />

                {/* Bottom shadow */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-black" />

                {/* Horizontal ridge */}
                <div className="absolute top-1/2 -translate-y-1/2 left-3 right-3 sm:left-5 sm:right-5 h-[1.5px] bg-black/50 rounded-full" />

                {/* Rivets */}
                <div className="absolute top-1/2 -translate-y-1/2 left-3 sm:left-6 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-neutral-700 shadow-[inset_0_0.5px_0.5px_rgba(255,255,255,0.08)]" />
                <div className="absolute top-1/2 -translate-y-1/2 right-3 sm:right-6 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-neutral-700 shadow-[inset_0_0.5px_0.5px_rgba(255,255,255,0.08)]" />
              </motion.div>
            )
          })}

          {/* ─── Retracting Latch Bars ─── */}
          <motion.div
            initial={{ scaleX: 1, opacity: 1 }}
            animate={
              phase === 'unlocking' || phase === 'shuddering' || phase === 'rolling'
                ? { scaleX: 0, opacity: 0 }
                : {}
            }
            transition={{ duration: 0.8, ease: EXPO_OUT }}
            className="absolute bottom-[3vh] left-0 right-0 h-1 z-20 flex justify-between px-3 sm:px-5 pointer-events-none origin-center"
          >
            <div className="w-[46%] h-full bg-gradient-to-r from-neutral-600 via-neutral-400 to-neutral-500 rounded-sm" />
            <div className="w-[46%] h-full bg-gradient-to-l from-neutral-600 via-neutral-400 to-neutral-500 rounded-sm" />
          </motion.div>

          {/* ─── Central Padlock ─── */}
          <motion.div
            initial={{ y: 0, opacity: 1, scale: 1 }}
            animate={
              phase === 'rolling'
                ? { y: '-100vh', opacity: 0, scale: 0.7 }
                : phase === 'unlocking'
                ? { rotate: [0, -8, 4, -2, 0], scale: [1, 0.98, 1.01, 1] }
                : phase === 'shuddering'
                ? { rotate: [0, -15, 8, -4, 0], scale: [1, 0.96, 1.02, 0.99, 1] }
                : {}
            }
            transition={
              phase === 'rolling'
                ? { duration: 0.7, ease: SHUTTER_EASE }
                : { duration: 0.7, ease: QUINT_OUT }
            }
            className="absolute bottom-[0.5vh] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none select-none"
          >
            {/* Bracket */}
            <div className="w-10 h-4 bg-gradient-to-b from-neutral-800 to-black border border-white/[0.04] rounded-t flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-neutral-700" />
            </div>

            {/* Padlock body */}
            <div className="w-11 h-11 sm:w-13 sm:h-13 bg-gradient-to-b from-zinc-300 via-zinc-400 to-zinc-600 border border-white/20 rounded-md shadow-[0_6px_20px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.4)] flex flex-col items-center justify-center relative">
              {/* Shackle — spring physics for organic swing */}
              <motion.div
                initial={{ y: 0, rotate: 0 }}
                animate={
                  phase === 'unlocking' || phase === 'shuddering' || phase === 'rolling'
                    ? { y: -10, rotate: 18 }
                    : {}
                }
                transition={{
                  type: 'spring' as const,
                  stiffness: 200,
                  damping: 10,
                  mass: 0.6,
                }}
                className="absolute -top-5 sm:-top-6 w-7 sm:w-8 h-5 sm:h-6 border-[3px] border-zinc-400 border-b-0 rounded-t-full -z-10 origin-bottom-right"
              />
              {/* Keyhole */}
              <div className="w-1.5 h-2.5 bg-black rounded-full shadow-[inset_0_1px_1px_rgba(0,0,0,0.8)] relative">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-1 bg-neutral-900" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ═══════════ CENTER BRAND SIGNBOARD ═══════════ */}
      <motion.div
        initial={{ y: 0, opacity: 1, scale: 1 }}
        animate={
          phase === 'rolling'
            ? { y: '-50vh', opacity: 0, scale: 0.9, filter: 'blur(6px)' }
            : {}
        }
        transition={{
          duration: 1.6,
          ease: SHUTTER_EASE,
          delay: 0.15,
          filter: { duration: 1, delay: 0.6 },
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center pointer-events-none select-none w-[85%] max-w-xs sm:max-w-sm"
      >
        {/* Thin hanging wires — gentle pendulum entrance */}
        {!reducedMotion && (
          <div className="flex justify-between w-28 sm:w-32 h-7 sm:h-9 px-2 -mb-px">
            <motion.div
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.15, ease: EXPO_OUT }}
              className="w-px h-full bg-gradient-to-b from-transparent via-neutral-600/30 to-neutral-500/50 origin-top"
            />
            <motion.div
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.25, ease: EXPO_OUT }}
              className="w-px h-full bg-gradient-to-b from-transparent via-neutral-600/30 to-neutral-500/50 origin-top"
            />
          </div>
        )}

        {/* Sign body — gentle scale entrance with pendulum sway */}
        <motion.div
          initial={{
            opacity: reducedMotion ? 1 : 0,
            scale: reducedMotion ? 1 : 0.96,
            rotate: reducedMotion ? 0 : -1.5,
          }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{
            duration: 1.2,
            delay: reducedMotion ? 0 : 0.3,
            ease: EXPO_OUT,
            rotate: {
              type: 'spring' as const,
              stiffness: 60,
              damping: 12,
              mass: 1.2,
              delay: 0.3,
            },
          }}
          className="w-full relative"
        >
          {/* Top edge light */}
          <div className="absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent pointer-events-none" />

          <div className="relative bg-neutral-950/90 border border-white/[0.06] rounded-2xl px-8 py-10 sm:px-10 sm:py-12 flex flex-col items-center text-center overflow-hidden">

            {/* Subtle interior gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.015] to-transparent pointer-events-none rounded-2xl" />

            {/* Light streak sweep */}
            <LightStreak phase={phase} />

            {/* ─── Mandala Logo ─── */}
            <motion.div
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.5, rotate: -30 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{
                duration: reducedMotion ? 0 : 1.2,
                delay: reducedMotion ? 0 : 0.4,
                ease: EXPO_OUT,
              }}
              className="relative mb-7"
            >
              {/* Slow breathing glow */}
              {!reducedMotion && (
                <motion.div
                  className="absolute -inset-5 rounded-full"
                  animate={{
                    boxShadow: [
                      '0 0 20px 4px rgba(184,118,60,0)',
                      '0 0 35px 10px rgba(184,118,60,0.08)',
                      '0 0 20px 4px rgba(184,118,60,0)',
                    ],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
              {/* Slow continuous rotation */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 relative z-10 mx-auto">
                <Image
                  src="/logo-light.png?v=10"
                  alt="Alpona Logo"
                  fill
                  priority
                  className="object-contain"
                />
              </div>
            </motion.div>

            {/* ─── Brand Name ─── */}
            <BrandLetters phase={phase} reducedMotion={reducedMotion} />

            {/* ─── Tagline ─── */}
            <motion.p
              initial={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 6, filter: reducedMotion ? 'none' : 'blur(4px)' }}
              animate={phase !== 'idle' ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
              transition={{ duration: 0.8, delay: reducedMotion ? 0 : 1.1, ease: EXPO_OUT }}
              className="text-[10px] sm:text-[11px] tracking-[0.35em] uppercase text-neutral-400 font-medium mt-5"
            >
              Handcrafted Art Studio
            </motion.p>

            {/* ─── Progress Line ─── */}
            {!reducedMotion && (
              <motion.div
                initial={{ opacity: 0, scaleX: 0.5 }}
                animate={phase !== 'idle' ? { opacity: 1, scaleX: 1 } : {}}
                transition={{ delay: 1.3, duration: 0.6, ease: EXPO_OUT }}
              >
                <ProgressLine phase={phase} />
              </motion.div>
            )}

            {/* ─── Established ─── */}
            <motion.div
              initial={{ opacity: reducedMotion ? 1 : 0 }}
              animate={phase !== 'idle' ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: reducedMotion ? 0 : 1.5, ease: EXPO_OUT }}
              className="mt-6 text-[10px] text-neutral-500 tracking-[0.3em] font-medium"
            >
              ESTD · 2026
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
