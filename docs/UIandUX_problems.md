Fix 10 issues flagged by a design audit (DesignMeter) on alpona.vercel.app. 
Address each issue site-wide, not just on one page — these are structural 
patterns that repeat across the whole site.

═══════════════════════════════════════════════════════
UI METRICS FIXES
═══════════════════════════════════════════════════════

---

ISSUE 1 — Visual Hierarchy (Needs Work, High Risk)
"The main call to action is not visually distinct, so visitors may 
overlook it, leading to fewer sign-ups."

Fix across the entire site:
- Audit every page for primary CTA buttons (Shop Now, Add to Cart, 
  Subscribe, Sign Up, Checkout, Pay Now)
- Every primary CTA must have:
  - Highest contrast against its background (amber #C87533 fill on 
    light backgrounds, white fill on dark backgrounds — never a 
    muted/outlined style for the MAIN action on any page)
  - Larger size than secondary actions on the same screen (min height 
    48px, min padding px-7 py-3.5)
  - Never compete visually with more than one other button of equal 
    weight in the same viewport — there must be ONE dominant action 
    per screen, everything else is visually secondary (outlined or text-only)
- Specifically check: Hero section (Shop Now vs Create Your Own — 
  Shop Now must read as clearly primary), Product page (Add to Cart 
  vs Buy Now — pick one as primary, demote the other to outline), 
  Newsletter signup (Subscribe button must stand out from the input field)

---

ISSUE 2 — Typography (Critical, Severe Risk)
"Some text is too light against the background, making it hard to 
read, which can lead to visitors missing important information."

Fix across the entire site:
- Audit every instance of muted/secondary text color usage
- Minimum contrast ratio: 4.5:1 for body text, 3:1 for large text 
  (WCAG AA standard) — check this for every text color against 
  every background it appears on, in BOTH light and dark mode
- Common problem areas to check specifically:
  - Product descriptions using text-gray-400 or lighter on white bg
  - Muted captions/subtitles (text-[11px] text-gray-400 patterns)
  - Placeholder text in inputs
  - Footer links on dark background
  - Any text using opacity below 60% for body copy
- Fix rule: replace any text color darker/lighter than the WCAG 
  threshold with the next appropriate shade:
  Light mode: minimum text-gray-600 for secondary text (not text-gray-400)
  Dark mode: minimum text-white/70 for secondary text (not text-white/40)
- Keep text-gray-400 / text-white/30 ONLY for genuinely decorative 
  or non-essential microcopy (like "No spam, unsubscribe anytime")

---

ISSUE 3 — CTA Button Blending (High Risk)
"The call to action button blends into the background, so visitors 
can't easily find it, resulting in lost sales."

This compounds Issue 1. Fix specifically:
- Every CTA button needs either:
  a) A solid fill color with strong contrast against its section background, OR
  b) A 2px border with a color that has strong contrast if outlined style is used
- Audit dark sections specifically (Create Banner, Newsletter) — 
  white buttons on dark backgrounds are fine, but check that any 
  amber-on-dark-amber-adjacent combos aren't happening
- Add a subtle hover state that increases contrast further 
  (darken fill on hover, or add a 1px glow/shadow) so the button 
  visibly responds to interaction — this signals interactivity 
  even before hover

---

ISSUE 4 — Consistency (Stable, but flagged)
"Buttons have varying styles, which can confuse users and decrease 
their trust in the site."

Fix — create and enforce a single button system:
- Define exactly 3 button variants in a shared component 
  (components/ui/Button.tsx) and use ONLY these across the entire site:
  
  1. Primary: solid amber/black fill, white text, rounded-full, 
     px-7 py-3.5, font-semibold text-[15px]
  2. Secondary: outlined, 2px border, transparent bg, rounded-full, 
     same padding as primary
  3. Text/Ghost: no border, no bg, amber text, underline on hover, 
     used for tertiary actions only ("View All →", "Learn More")

- Audit every button on every page and replace one-off custom button 
  styles with imports from this shared component
- No page should invent a new button style — if a new use case comes 
  up, it must use one of the 3 variants, not a 4th style

---

ISSUE 5 — Responsiveness (Critical, Severe Risk)
"On mobile, elements are too close together, making it hard for 
users to tap accurately, which can lead to frustration and lower 
retention."

Fix across the entire site:
- Minimum tap target size: 44x44px for ALL interactive elements on 
  mobile (buttons, icons, links, form inputs, checkboxes)
- Minimum spacing between adjacent tappable elements: 8px gap minimum, 
  12px preferred
- Audit these specific areas known to be tight:
  - Navbar icon row (search, wishlist, cart, theme toggle) — increase 
    gap-2 to gap-3 minimum on mobile, ensure each icon has adequate 
    padding around it (not just the icon glyph itself)
  - Product card action buttons (wishlist heart, add to cart) — 
    ensure minimum 44px touch target even if visual icon is smaller
  - Size/color selector pills on product page — increase padding 
    and gap between pills on mobile specifically
  - Footer links — increase line-height and vertical spacing between 
    stacked links on mobile
  - Mobile bottom nav items — verify each of the 4 items has generous 
    tap area, not just centered on a small icon
- Test at 375px width (iPhone SE) as the baseline — if it's tappable 
  there, it's tappable everywhere

═══════════════════════════════════════════════════════
UX METRICS FIXES
═══════════════════════════════════════════════════════

---

ISSUE 6 — Task Clarity (Average, Conversion Risk)
"Navigation options are not immediately clear, so visitors may 
struggle to find what they need, increasing the likelihood of them 
leaving."

Fix:
- Navbar labels must be unambiguous — audit current labels:
  "Shop" and "Collections" as separate nav items may be confusing 
  since they likely overlap in purpose. Clarify the distinction:
  - "Shop" → all products, flat browsing
  - "Collections" → curated/categorized browsing
  If these aren't clearly different in function, merge them into 
  one clear "Shop" dropdown with Collections as a sub-option
- Add a visible search bar (not just a search icon) in the navbar 
  on desktop — icon-only search increases the clicks needed to find 
  products, which is a task clarity problem
- Ensure every page has a clear, visible page title / H1 immediately 
  on load so users always know where they are
- Add breadcrumbs to every page below the homepage (Shop, Collections, 
  Product Detail, Account pages) if not already present consistently

---

ISSUE 7 — Navigation Depth (Average, Conversion Risk)
"Some important content requires multiple clicks to access, which 
can frustrate users and lead to drop-offs."

Fix:
- Audit the click-depth to reach key actions from homepage:
  - Homepage → Product Detail should be maximum 2 clicks 
    (Homepage → Category/Product card → Product Detail)
  - Homepage → Checkout should be maximum 4 clicks 
    (Homepage → Product → Add to Cart → Cart → Checkout)
  - Homepage → Track Order should be 1 click (already in navbar — verify)
  - Homepage → Design Studio should be 1 click (already in navbar — verify)
- Add direct navbar links for anything currently buried more than 
  2 clicks deep that users need frequently (e.g. if "Track Order" 
  isn't in the main nav, add it)
- On the Collections page specifically: ensure users can reach any 
  of the 120+ products in maximum 2 clicks from landing on that page 
  (Category sidebar click → Product card click)
- Reduce reliance on nested dropdown menus — flatten navigation where 
  possible so options are visible without hover/click reveals

---

ISSUE 8 — Purchase Path / Checkout Steps (High Risk)
"The conversion path has unnecessary steps, which can deter users 
from completing their purchases."

Fix the checkout flow specifically:
- Audit current flow: Product → Add to Cart → Cart Page → Checkout Page 
  → Payment. Identify and remove any unnecessary intermediate steps:
  - If there's a cart confirmation modal/page that adds friction before 
    reaching /cart, consider removing it — direct add-to-cart with a 
    toast notification is faster than a modal interruption
  - On /checkout: combine address entry and payment into the fewest 
    possible screens. If currently split into multiple steps/pages, 
    merge into a single-page checkout with clear sections (Address → 
    Summary → Pay) rather than sequential page loads
  - Add a "Buy Now" option on product pages that skips the cart 
    entirely and goes straight to checkout with just that one item — 
    this shortens the path for users who know what they want
  - Pre-fill known information: if user is logged in, auto-select 
    their default address instead of requiring re-entry every time
  - Reduce form fields on checkout to only what's truly required — 
    audit the address form for any optional fields that could be 
    removed or made collapsible

---

ISSUE 9 — Accessibility (Needs Work, High Risk)
"Some text does not meet visibility standards, making it hard for 
all users to engage with the content, which can reduce overall trust."

This overlaps with Issue 2 (Typography) but treat as accessibility 
compliance specifically:
- Run the entire site through a contrast checker (WebAIM or similar) 
  and fix every instance below WCAG AA (4.5:1 for normal text, 3:1 
  for large text 18px+/14px+bold)
- Add proper alt text to all images site-wide (product images, 
  category images, design thumbnails) — currently likely missing 
  or generic
- Ensure all interactive elements are keyboard-navigable (Tab order 
  makes sense, focus states are visible with a clear outline, not 
  just relying on hover states)
- Add aria-labels to all icon-only buttons (search icon, wishlist 
  heart, theme toggle, cart icon) since they have no visible text label
- Ensure form inputs have associated <label> elements, not just 
  placeholder text (placeholders disappear on input and aren't a 
  substitute for labels)
- Check color is never the ONLY way information is conveyed 
  (e.g. stock status shouldn't rely on red/green alone — pair with 
  text like "Out of Stock" or an icon)

---

ISSUE 10 — Conversion Clarity (Needs Work, High Risk)
"The value proposition is not immediately clear, so visitors may 
not understand the benefits, leading to lost conversions."

Fix:
- Homepage hero section: the current copy "Wear Your Imagination" 
  is emotionally appealing but doesn't explain WHAT the site does 
  or WHY someone should buy in the first 3 seconds. Strengthen the 
  subheading to be more explicit:
  Current: "Premium Print on Demand products crafted just for you. 
  Choose a design or create your own."
  This is decent but could be sharper. Consider testing: 
  "120+ ready-made designs, or upload your own. Printed and shipped 
  in 5-7 days, anywhere in India."
  — this adds concrete numbers (120+ designs, 5-7 days) which builds 
  more immediate trust than abstract language alone
- Ensure the "Why Alvora" section appears above the fold or very 
  close to it — value props shouldn't require significant scrolling 
  to discover
- Add trust signals higher on the page: if you have real review 
  counts, real "X people bought this" data, or real delivery 
  timeframes, surface these near the hero, not buried lower on the page
- On product pages: ensure price, key differentiators (premium 
  cotton, made to order, etc.), and shipping info are all visible 
  without scrolling on both mobile and desktop
- Add a one-line "how it works" strip near the top of the homepage 
  if not prominent already: "1. Pick a design → 2. Choose your 
  product → 3. We print & ship" — this answers "what is this site" 
  in 3 seconds for a first-time visitor

═══════════════════════════════════════════════════════
IMPLEMENTATION PRIORITY (fix in this order)
═══════════════════════════════════════════════════════

1. Typography contrast (Issue 2) + Accessibility (Issue 9) — these 
   overlap significantly, fix together first since they affect every 
   page and are marked Critical/Severe
2. Responsiveness tap targets (Issue 5) — marked Critical, affects 
   mobile conversion directly
3. CTA visibility (Issues 1 & 3) — directly impacts conversion, 
   relatively quick fix once button system is standardized
4. Button consistency (Issue 4) — do this alongside Issue 1/3 since 
   you're already touching every button
5. Checkout path simplification (Issue 8) — highest business impact 
   (35-50% estimated impact on Churn Rate) but requires more careful 
   testing
6. Navigation clarity + depth (Issues 6 & 7) — structural nav changes, 
   test thoroughly since this affects site-wide wayfinding
7. Conversion clarity / value prop (Issue 10) — copywriting + layout 
   adjustment, lower technical risk but needs review before shipping

═══════════════════════════════════════════════════════
VERIFICATION CHECKLIST
═══════════════════════════════════════════════════════

□ Every primary CTA on every page is visually dominant, high contrast
□ All text passes WCAG AA contrast ratio in both light and dark mode
□ All buttons site-wide use one of exactly 3 standardized variants
□ All mobile tap targets are minimum 44x44px with 8px+ spacing
□ Checkout flow reduced to minimum necessary steps, Buy Now option added
□ Navigation reaches any product in 2 clicks max from homepage
□ All images have alt text, all icon buttons have aria-labels
□ Keyboard navigation works with visible focus states throughout
□ Homepage value proposition is concrete and visible without scrolling
□ Re-run DesignMeter scan after fixes to confirm score improvement