import { Variants, Transition } from 'framer-motion'

export const authContainerVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.1
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.98,
    transition: { duration: 0.4 }
  }
}

export const authItemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1]
    }
  }
}

// Legacy exports to fix broken imports across the app
export const containerVariants = authContainerVariants
export const itemVariants = authItemVariants
export const SPRING_GENTLE: Transition = { type: 'spring', stiffness: 400, damping: 30 }
export const SPRING_STIFF: Transition = { type: 'spring', stiffness: 500, damping: 30 }
export const EASE_OUT_CUBIC = [0.215, 0.61, 0.355, 1] as const
