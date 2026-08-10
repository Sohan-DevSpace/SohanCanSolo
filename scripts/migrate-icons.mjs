import fs from 'fs'
import path from 'path'
import { globSync } from 'glob'

const ICONS_DIR = 'd:/Projects/Alpona/lineicons-5.1-free/free-svg-files'
const OUTPUT_FILE = 'd:/Projects/Alpona/components/shared/PremiumIcons.tsx'

// Define keywords for fuzzy search if exact map isn't known
const iconMapping = {
  IconTruck: ['truck', 'delivery', 'shipped'],
  IconRefresh: ['reload', 'refresh', 'sync'],
  IconMapPin: ['map-marker', 'pin', 'location'],
  IconShieldLock: ['shield-2-check', 'shield-check', 'shield'],
  IconMessage: ['envelope', 'mail', 'message'],
  IconStar: ['star-fat', 'star-sharp', 'star'],
  IconBadgeCheck: ['badge-check', 'certificate', 'award'],
  IconLeaf: ['leaf', 'plant', 'nature'],
  IconCart: ['cart', 'shopping-cart', 'bag'],
  IconSparkles: ['sparkle', 'magic', 'stars'],
  IconSearch: ['search-1', 'search', 'magnifier'],
  IconUser: ['user-4', 'user', 'profile'],
  IconMenu: ['menu', 'hamburger', 'list'],
  IconArrowRight: ['arrow-right', 'arrow-forward'],
  IconPencil: ['pencil', 'edit', 'pen'],
  IconChevronDown: ['chevron-down', 'arrow-down'],
  IconShipped: ['box', 'package', 'shipping'],
  IconLock: ['locked-1', 'lock', 'secure'],
  IconChevronRight: ['chevron-right', 'arrow-right'],
  IconChevronLeft: ['chevron-left', 'arrow-left'],
  IconTshirt: ['t-shirt', 'shirt', 'clothes'],
  IconToteBag: ['basket-shopping', 'bag', 'tote'],
  IconKids: ['emoji-smile', 'child', 'kid'],
  IconHoodie: ['shirt-1', 'hoodie', 'jacket'],
  IconGift: ['gift', 'present', 'box'],
  IconFlame: ['fire', 'flame', 'hot'],
  IconCheck: ['check', 'tick', 'done'],
  IconHeart: ['heart', 'love', 'favorite'],
  IconHome: ['home', 'house', 'building'],
  IconGrid: ['grid', 'layout', 'apps'],
  IconTag: ['tag', 'label', 'price'],
  IconSliders: ['equalizer', 'sliders', 'settings'],
  IconUpload: ['upload', 'cloud-upload', 'arrow-up'],
  IconBox: ['box', 'package', 'cube'],
  IconCalendar: ['calendar', 'date', 'schedule'],
  IconAward: ['cup', 'award', 'trophy'],
  IconCopy: ['copy', 'duplicate', 'clone'],
  IconShare: ['share', 'network', 'send'],
  IconHelp: ['help', 'question-mark', 'support'],
  IconAlert: ['warning', 'alert', 'error', 'bell'],
  IconScissors: ['cut', 'scissors', 'shear'],
  IconClose: ['close', 'xmark', 'cross'],
  IconFileText: ['document', 'file-text', 'paper'],
  IconTrash: ['trash', 'delete', 'remove'],
  IconInstagram: ['instagram', 'insta', 'social'],
  IconFacebook: ['facebook', 'fb', 'social'],
  IconYoutube: ['youtube', 'yt', 'video'],
  IconArrowUp: ['arrow-up', 'arrow-top'],
  IconPalette: ['palette', 'color', 'art'],
  IconLayers: ['layers', 'stack', 'cards'],
  IconExternalLink: ['share-2', 'external-link', 'open'],
  IconMail: ['envelope-2', 'mail', 'email'],
  IconPhone: ['phone', 'call', 'mobile'],
  IconSend: ['paper-plane', 'send', 'message'],
  IconClock: ['timer', 'clock', 'time'],
  IconBookmark: ['bookmark-1', 'bookmark', 'save'],
  IconPercent: ['percent', 'discount', 'sale'],
  IconDollar: ['dollar', 'money', 'cash'],
  IconSave: ['save', 'floppy-disk', 'disk'],
  IconImage: ['image', 'picture', 'photo'],
  IconAlignCenter: ['align-text-center', 'center', 'align'],
  IconSparkle: ['sparkle', 'magic', 'star'],
  IconInfo: ['question-mark', 'information', 'info'],
  IconLoader: ['spinner', 'loader', 'refresh'],
  IconEye: ['eye', 'view', 'watch'],
  IconEyeOff: ['eye-off', 'hide', 'eye'],
  IconKey: ['key-1', 'key', 'password'],
  IconBell: ['bell-1', 'bell', 'notification'],
  IconShieldAlert: ['shield-2', 'shield-alert', 'security'],
  IconLogOut: ['exit', 'logout', 'sign-out'],
  IconRecycle: ['recycle', 'refresh', 'eco'],
  IconShieldCheck: ['shield-2-check', 'shield-check', 'secure'],
  IconPackage: ['package', 'box', 'shipment'],
  IconDownload: ['download-1', 'download', 'arrow-down'],
  IconCompass: ['compass', 'direction', 'map'],
  IconAlertCircle: ['bell-1', 'warning', 'alert'],
  IconUserCircle: ['user', 'profile', 'account'],
  IconSettings: ['cog', 'settings', 'gear'],
  IconFileImage: ['image', 'picture', 'file'],
  IconPenTool: ['pen', 'pencil', 'tool'],
  IconArrowLeft: ['arrow-left', 'arrow-back'],
  IconPlus: ['plus', 'add', 'create'],
  IconFilter: ['filter', 'funnel', 'sort'],
  IconFileQuestion: ['question-mark', 'help', 'file'],
  IconGlobe: ['globe', 'world', 'earth'],
  IconApple: ['apple', 'brand', 'mac'],
  IconPlayStore: ['play', 'store', 'android']
}

async function run() {
  console.log('Searching for SVG files...')
  
  // Find all SVGs (outlined and brands)
  const allSvgs = globSync('**/rounded/outlined/*.svg', { cwd: ICONS_DIR })
  const brandSvgs = globSync('brands-logos/**/*.svg', { cwd: ICONS_DIR })
  const combinedSvgs = [...allSvgs, ...brandSvgs]

  let code = `'use client'

/**
 * PremiumIcons.tsx
 * 
 * Auto-generated from Lineicons 5.1 Premium SVG pack.
 * Optimized for Alpona.
 */

import { motion } from 'framer-motion'
import React from 'react'

export function IconWrapper({ size, className = '', children, whileHover }: any) {
  return (
    <motion.div
      style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      className={\`shrink-0 \${className}\`}
      whileHover={whileHover}
    >
      {children}
    </motion.div>
  )
}
`

  let missing = 0

  for (const [iconName, keywords] of Object.entries(iconMapping)) {
    let svgPath = null
    
    // Fuzzy search: find the first file that contains any of our keywords in its basename
    for (const keyword of keywords) {
      const match = combinedSvgs.find(f => path.basename(f).includes(keyword))
      if (match) {
        svgPath = path.join(ICONS_DIR, match)
        break
      }
    }

    if (!svgPath) {
      console.warn(`⚠️ Missing SVG for ${iconName} (Keywords: ${keywords.join(', ')})`)
      code += `
export function ${iconName}({ size = 24, color = 'currentColor', className = '' }: any) {
  return <IconWrapper size={size} className={className}><svg viewBox="0 0 24 24" fill={color}><circle cx="12" cy="12" r="10"/></svg></IconWrapper>
}
`
      missing++
      continue
    }

    let svgContent = fs.readFileSync(svgPath, 'utf8')
    
    // Extract inner content of SVG
    const match = svgContent.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i)
    let innerSvg = match ? match[1] : ''
    
    // Convert kebab-case attributes to camelCase
    innerSvg = innerSvg.replace(/([a-z]+)-([a-z]+)=/gi, (match, p1, p2) => {
      // Don't camelcase data- or aria-
      if (p1 === 'data' || p1 === 'aria') return match
      return `${p1}${p2.charAt(0).toUpperCase() + p2.slice(1)}=`
    })

    // Remove width and height if they exist on inner tags
    innerSvg = innerSvg.replace(/ width="[^"]*"/g, '')
    innerSvg = innerSvg.replace(/ height="[^"]*"/g, '')

    // Replace hardcoded fills
    innerSvg = innerSvg.replace(/fill="#[A-Fa-f0-9]+"/gi, 'fill={color}')
    innerSvg = innerSvg.replace(/stroke="#[A-Fa-f0-9]+"/gi, 'stroke={color}')
    innerSvg = innerSvg.replace(/fill="currentColor"/gi, 'fill={color}')
    innerSvg = innerSvg.replace(/stroke="currentColor"/gi, 'stroke={color}')
    innerSvg = innerSvg.replace(/fill-rule/g, 'fillRule')
    innerSvg = innerSvg.replace(/clip-rule/g, 'clipRule')

    if (!innerSvg.includes('fill=') && !innerSvg.includes('stroke=')) {
      innerSvg = innerSvg.replace(/<path /g, '<path fill={color} ')
    }

    code += `
export function ${iconName}({ size = 24, color = 'currentColor', className = '' }: any) {
  return (
    <IconWrapper size={size} className={className}>
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        ${innerSvg.trim()}
      </svg>
    </IconWrapper>
  )
}
`
  }

  fs.writeFileSync(OUTPUT_FILE, code)
  console.log(`✅ Successfully generated PremiumIcons.tsx. Missing: ${missing}`)
}

run()
