'use client'

import { motion, useReducedMotion, useSpring } from 'framer-motion'
import { useEffect, useRef } from 'react'

// ─── Constants ───────────────────────────────────────────────────────────────
const VIEWBOX_SIZE = 14
const CENTER = 7

// ─── Line Coordinate Definition ──────────────────────────────────────────────
export interface IconLine {
  x1: number
  y1: number
  x2: number
  y2: number
  opacity?: number
}

export interface IconDefinition {
  lines: [IconLine, IconLine, IconLine]
  rotation?: number
  group?: string
}

// ─── Collapsed Line Representation ───────────────────────────────────────────
const collapsed: IconLine = {
  x1: CENTER,
  y1: CENTER,
  x2: CENTER,
  y2: CENTER,
  opacity: 0,
}

// ─── Line Coordinate Sets ────────────────────────────────────────────────────
const menuLines: [IconLine, IconLine, IconLine] = [
  { x1: 2, y1: 3.5, x2: 12, y2: 3.5, opacity: 1 },
  { x1: 2, y1: 7, x2: 12, y2: 7, opacity: 1 },
  { x1: 2, y1: 10.5, x2: 12, y2: 10.5, opacity: 1 },
]

const crossLines: [IconLine, IconLine, IconLine] = [
  { x1: 3.5, y1: 3.5, x2: 10.5, y2: 10.5, opacity: 1 },
  { x1: 10.5, y1: 3.5, x2: 3.5, y2: 10.5, opacity: 1 },
  collapsed,
]

const chevronLines: [IconLine, IconLine, IconLine] = [
  { x1: 3.5, y1: 5.5, x2: 7, y2: 9, opacity: 1 },
  { x1: 7, y1: 9, x2: 10.5, y2: 5.5, opacity: 1 },
  collapsed,
]

const arrowLines: [IconLine, IconLine, IconLine] = [
  { x1: 2, y1: 7, x2: 12, y2: 7, opacity: 1 },
  { x1: 8, y1: 3, x2: 12, y2: 7, opacity: 1 },
  { x1: 8, y1: 11, x2: 12, y2: 7, opacity: 1 },
]

const plusLines: [IconLine, IconLine, IconLine] = [
  { x1: 2, y1: 7, x2: 12, y2: 7, opacity: 1 },
  { x1: 7, y1: 2, x2: 7, y2: 12, opacity: 1 },
  collapsed,
]

const minusLines: [IconLine, IconLine, IconLine] = [
  { x1: 2, y1: 7, x2: 12, y2: 7, opacity: 1 },
  collapsed,
  collapsed,
]

const checkLines: [IconLine, IconLine, IconLine] = [
  { x1: 2.5, y1: 7.5, x2: 5.5, y2: 10.5, opacity: 1 },
  { x1: 5.5, y1: 10.5, x2: 11.5, y2: 3.5, opacity: 1 },
  collapsed,
]

const moreLines: [IconLine, IconLine, IconLine] = [
  { x1: 3, y1: 7, x2: 3, y2: 7, opacity: 1 },
  { x1: 7, y1: 7, x2: 7, y2: 7, opacity: 1 },
  { x1: 11, y1: 7, x2: 11, y2: 7, opacity: 1 },
]

// ─── Registered Icons Mappings ────────────────────────────────────────────────
export const MORPH_ICONS: Record<string, IconDefinition> = {
  'menu': { lines: menuLines, rotation: 0, group: 'menu-close' },
  'cross': { lines: crossLines, rotation: 0, group: 'menu-close' },
  'close': { lines: crossLines, rotation: 0, group: 'menu-close' },
  
  'chevron-down': { lines: chevronLines, rotation: 0, group: 'chevron' },
  'chevron-right': { lines: chevronLines, rotation: -90, group: 'chevron' },
  'chevron-left': { lines: chevronLines, rotation: 90, group: 'chevron' },
  'chevron-up': { lines: chevronLines, rotation: 180, group: 'chevron' },

  'arrow-right': { lines: arrowLines, rotation: 0, group: 'arrow' },
  'arrow-down': { lines: arrowLines, rotation: 90, group: 'arrow' },
  'arrow-left': { lines: arrowLines, rotation: 180, group: 'arrow' },
  'arrow-up': { lines: arrowLines, rotation: -90, group: 'arrow' },

  'plus': { lines: plusLines, rotation: 0, group: 'plus-minus' },
  'minus': { lines: minusLines, rotation: 0, group: 'plus-minus' },

  'check': { lines: checkLines, rotation: 0 },
  'more': { lines: moreLines, rotation: 0 },
}

export type MorphIconName = keyof typeof MORPH_ICONS

// ─── Component Props ──────────────────────────────────────────────────────────
export interface MorphingIconProps {
  name: MorphIconName
  size?: number
  color?: string
  strokeWidth?: number
  className?: string
}

export function MorphingIcon({
  name,
  size = 24,
  color = 'currentColor',
  strokeWidth = 1.7,
  className = '',
}: MorphingIconProps) {
  const definition = MORPH_ICONS[name] || MORPH_ICONS['menu']!
  const prevDef = useRef<IconDefinition>(definition)
  const isReducedMotion = useReducedMotion() ?? false

  // Set up spring value for rotation as required by [morphing-spring-rotation]
  const rotationSpring = useSpring(definition.rotation ?? 0, {
    stiffness: 300,
    damping: 24,
  })

  useEffect(() => {
    // Jump instantly if the icon group changes as required by [morphing-jump-non-grouped]
    const sameGroup = prevDef.current.group && definition.group && prevDef.current.group === definition.group
    
    if (isReducedMotion) {
      rotationSpring.jump(definition.rotation ?? 0)
    } else if (sameGroup) {
      rotationSpring.set(definition.rotation ?? 0)
    } else {
      rotationSpring.jump(definition.rotation ?? 0)
    }
    
    prevDef.current = definition
  }, [name, definition, rotationSpring, isReducedMotion])

  const transition = isReducedMotion ? { duration: 0 } : ({ ease: [0.19, 1, 0.22, 1], duration: 0.45 } as any)

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
      fill="none"
      className={className}
      aria-hidden="true" // Required by [morphing-aria-hidden]
      style={{ rotate: rotationSpring, originX: '7px', originY: '7px' }}
    >
      {definition.lines.map((line, idx) => (
        <motion.line
          key={idx}
          initial={false}
          animate={{
            x1: line.x1,
            y1: line.y1,
            x2: line.x2,
            y2: line.y2,
            opacity: line.opacity ?? 1,
          }}
          transition={transition}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round" // Required by [morphing-strokelinecap-round]
        />
      ))}
    </motion.svg>
  )
}
