# Alpona Website Sitemap & Route Directory

This document details all accessible pages, routes, and API endpoints within the Alpona ecommerce application, mapped according to the Next.js App Router structure.

---

## 1. Shop & Customer-Facing Pages

These routes are publicly accessible to site visitors for purchasing, custom designing, and general information.

| Route | Description | Accessibility |
| :--- | :--- | :--- |
| `/` | **Homepage**: Hero slider, featured products, categories, trust rows, and social feeds. | Public |
| `/shop` | **Product Catalog Grid**: Product listing with sidebar category, color, and size filters. | Public |
| `/shop/[slug]` | **Product Details Page**: Dynamic variant selectors, size grids, and Razorpay CTAs. | Public |
| `/design-studio` | **Premium Customizer**: 5-step Guided Customizer wizard (Team WhatsApp vs Design Tool). | Public |
| `/cart` | **Shopping Cart**: Breakdown of added items, sizing, quantities, and pricing summaries. | Public |
| `/checkout` | **Checkout Page**: Razorpay sandbox gateway checkout, address inputs, and order submission. | Public |
| `/wishlist` | **Wishlist page**: Dedicated customer wishlist catalog list. | Public |
| `/blog` | **Blog Catalog**: Minimalist editorial columns. | Public |
| `/blog/[slug]` | **Individual Blog Post**: Rich-text blog layout and category suggestions. | Public |
| `/order/track` | **Order Tracker**: Real-time status lookup utilizing tracking numbers. | Public |
| `/order/success` | **Order Confirmation**: Landing page shown post-checkout. | Public |
| `/contact` | **Contact Form**: Customer support inquiry portal. | Public |
| `/faq` | **Frequently Asked Questions**: Accordion-based help docs. | Public |

---

## 2. Customer Account Gates

These routes require authentication. Access is protected by Next.js `middleware.ts`.

| Route | Description | Auth Requirement |
| :--- | :--- | :--- |
| `/account` | **Customer Dashboard**: Overview of orders, active addresses, and shortcuts. | Logged In |
| `/account/saved-designs` | **Saved Designs Library**: Saved templates and custom uploaded graphics. | Logged In |
| `/account/orders` | **Order History**: Fulfillment stages, tracking info, and receipts. | Logged In |
| `/account/addresses` | **Address Manager**: Custom edit/addition forms for billing/shipping. | Logged In |
| `/account/settings` | **Profile Settings**: Profile details, contact, and email sync. | Logged In |
| `/account/password` | **Security settings**: Reset user account password inputs. | Logged In |

---

## 3. Authentication Routes

| Route | Description |
| :--- | :--- |
| `/auth/login` | Email credentials login form & simulated OAuth (Google/GitHub) options. |
| `/auth/signup` | Customer registration form with email validation prompts. |
| `/auth/forgot-password` | Form triggering password reset link delivery via Supabase. |
| `/auth/callback` | Redirect handler exchanging auth codes for user sessions. |
| `/auth/signout` | Clean session sign-out handler. |

---

## 4. Administrative Dashboard Panel

Dashboard gates reserved strictly for administrative accounts (`role === 'admin'`).

| Route | Description | Admin Role |
| :--- | :--- | :--- |
| `/admin` | **Admin Dashboard Overview**: Financial metrics, order counters, and task shortcuts. | Admin Only |
| `/admin/products` | **Catalog Manager**: Add, edit, or toggle products and specific variant inventory. | Admin Only |
| `/admin/orders` | **Order Manager**: Set order states, review payments, and push status changes. | Admin Only |
| `/admin/customers` | **Customer Database**: Customer lists, roles, and profiles. | Admin Only |
| `/admin/designs` | **Studio Uploads Monitor**: Log database of all user custom uploaded graphics. | Admin Only |
| `/admin/categories` | **Category Manager**: Add or edit shop product categories. | Admin Only |
| `/admin/collections` | **Collection Manager**: Set up group collections. | Admin Only |
| `/admin/coupons` | **Coupon Manager**: Create, list, or revoke promotional discount codes. | Admin Only |
| `/admin/content` | **CMS Manager**: Publish and configure blog content files. | Admin Only |
| `/admin/qikink` | **Qikink Integration Settings**: Sandbox credentials and sync logs. | Admin Only |
| `/admin/reviews` | **Review Manager**: Moderation board for customer comments. | Admin Only |
| `/admin/team` | **Team Settings**: Staff credentials and administration role settings. | Admin Only |
| `/admin/settings` | **System Preferences**: System-wide dashboard toggles. | Admin Only |
| `/admin/support` | **Support Desk**: Manage customer contact inquiry tickets. | Admin Only |
| `/admin/analytics` | **Advanced Charts**: Detailed visitor retention logs. | Admin Only |
| `/admin/finance` | **Financial Metrics**: Tax records, revenue, and gross profit tallies. | Admin Only |

---

## 5. Marketing & Partner Portals

| Route | Description |
| :--- | :--- |
| `/referral` | Customer referral program showing active rewards and invite counters. |
| `/affiliate` | Partner portal page with signup steps. |

---

## 6. Policy & Informational Pages

| Route | Description |
| :--- | :--- |
| `/shipping` | Shipping methods, costs, delivery estimates, and custom order rules. |
| `/returns` | Policy outlining design checks, returns, and cancellation terms. |
| `/privacy` | Privacy Policy complying with standard data collection. |
| `/terms` | Standard Terms of Service. |
| `/robots.txt` | Crawler policy configs. |
| `/sitemap.xml` | XML sitemap crawler indices. |

---

## 7. App Router Directory Structure

```
app/
├── (shop)/
│   ├── about/
│   ├── account/
│   │   ├── addresses/
│   │   ├── orders/
│   │   ├── password/
│   │   ├── saved-designs/
│   │   ├── settings/
│   │   └── wishlist/
│   ├── affiliate/
│   ├── auth/
│   │   ├── callback/
│   │   ├── forgot-password/
│   │   ├── login/
│   │   ├── signout/
│   │   └── signup/
│   ├── blog/
│   │   └── [slug]/
│   ├── cart/
│   ├── checkout/
│   ├── contact/
│   ├── design-studio/       <-- Premium Custom Design Workshop
│   ├── faq/
│   ├── order/
│   │   ├── success/
│   │   └── track/
│   ├── privacy/
│   ├── referral/
│   ├── returns/
│   ├── shipping/
│   ├── shop/
│   │   └── [slug]/
│   └── terms/
├── admin/
│   ├── analytics/
│   ├── categories/
│   ├── collections/
│   ├── content/
│   ├── coupons/
│   ├── customers/
│   ├── designs/
│   ├── finance/
│   ├── marketing/
│   ├── orders/
│   ├── products/
│   ├── qikink/
│   ├── reviews/
│   ├── settings/
│   ├── support/
│   └── team/
├── api/
│   ├── qikink/
│   │   ├── create-order/
│   │   └── webhook/
│   └── razorpay/
│       ├── create-order/
│       └── verify/
└── middleware.ts
```
