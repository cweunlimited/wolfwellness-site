# CLAUDE.md - Wolf Wellness Website

> **Repository Documentation for AI Assistants**
> Last Updated: 2026-01-02
> Website: https://wolfwellness.life/

## Project Overview

**Wolf Wellness** is an elite executive fitness and wellness coaching platform targeting high-performing professionals. The site combines content marketing, lead generation, and digital product sales with sophisticated conversion tracking and email automation.

### Key Facts
- **Tech Stack**: Static HTML/CSS/JS frontend + Vercel serverless functions
- **Architecture**: JAMstack with serverless backend
- **Deployment**: Vercel (auto-deploy from GitHub)
- **Repository**: https://github.com/cweunlimited/wolfwellness-site.git
- **Lines of Code**: ~6,130 lines across HTML, CSS, and JavaScript

---

## W.O.L.F. Methodology

The business is built around the **W.O.L.F.** framework:
- **W**orkouts (tailored training)
- **O**ptimization (recovery, sleep, mobility)
- **L**ifestyle (nutrition, stress, habits)
- **F**ocus (mindset, clarity, resilience)

---

## Project Structure

```
wolfwellness-site/
├── api/                                    # Vercel serverless functions
│   ├── create-checkout-session.js          # Stripe checkout initialization
│   ├── stripe-webhook.js                   # Webhook handler + email automation
│   ├── session-status.js                   # Payment verification endpoint
│   └── download.js                         # Protected download verification
│
├── *.html                                  # All HTML pages (root directory)
├── *.css                                   # Stylesheets (root directory)
├── *.png, *.jpg                            # Image assets (root directory)
├── sitemap.xml                             # SEO sitemap (12 URLs)
├── robots.txt                              # Allows AI crawlers
└── package.json                            # Dependencies (stripe, resend)
```

### Pages Inventory (12 HTML files)

| File | Purpose | Meta Tracking |
|------|---------|---------------|
| `index.html` | Main landing page with all sections | PageView |
| `reset.html` | Digital product sales page ($49) | InitiateCheckout |
| `success.html` | Post-purchase download page | Purchase (deduplicated) |
| `apply.html` | Coaching program application form | - |
| `thank-you.html` | Application confirmation | Lead |
| `foundation.html` | Foundation program landing page | PageView |
| `insights-*.html` (6 files) | SEO-optimized blog articles | PageView |

---

## Core Features

### 1. Main Landing Page (index.html)
- **Hero Section**: Animated logo, tagline, CTA to apply
- **About Section**: W.O.L.F. methodology explanation
- **Founder Profile**: Circular gold-glowing image with bio
- **Service Tiers**:
  - Foundation Program: $99/month (app-based)
  - Virtual 1:1 Coaching: $250/month (2x 30-min sessions/week)
  - Premium Executive: $800/month (comprehensive transformation)
- **Insights Library**: 6 articles on executive wellness topics
- **Testimonial Carousel**: 5 client reviews, auto-rotating every 10 seconds
- **Contact Form**: Formspree integration (form ID: `xblpzrkq`)

### 2. Digital Product: "7-Day Executive Reset"
**Files**: [reset.html](reset.html), [success.html](success.html)

**Purchase Flow**:
1. User lands on `reset.html` ($49 offer page)
2. Clicks "Get Instant Access" → fires `InitiateCheckout` event
3. Redirects to Stripe Checkout (via `/api/create-checkout-session`)
4. After payment, Stripe redirects to `success.html?session_id={id}`
5. Success page calls `/api/session-status` to verify payment
6. Displays download link (Google Drive) + fires `Purchase` event
7. Webhook fires Meta CAPI `Purchase` event + sends email via Resend

**Deduplication Strategy**:
- Uses Stripe `session_id` as both Meta Pixel `eventID` and CAPI `event_id`
- LocalStorage lock prevents duplicate browser events on refresh
- CAPI event sent server-side from webhook

### 3. Lead Generation Funnel
**Files**: [apply.html](apply.html), [thank-you.html](thank-you.html)

- Application form for coaching programs (Formspree)
- Thank-you page fires Meta Pixel `Lead` event
- Both pages have `noindex` to prevent indexing conversion pages

### 4. Content Marketing
**6 Insight Articles** (SEO-optimized, Schema.org markup):
1. The High-Performer's Paradox
2. Virtual Coaching for Executives
3. The Executive Traveler's Guide
4. Training as You Age
5. Precision Recovery
6. The Science of Resilience

Each article has:
- Structured data (Article schema)
- Unsplash hero images
- Open Graph/Twitter Card metadata
- Back link to main site

---

## API Functions (Serverless)

All functions are in the `/api` directory and run as Vercel serverless functions.

### `/api/create-checkout-session.js` (716 bytes)
**Purpose**: Creates Stripe Checkout session and redirects to payment page

**Environment Variables**:
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID`
- `SITE_URL`

**Flow**:
```
POST /api/create-checkout-session
→ Creates Stripe session
→ Returns JSON with session URL
→ Frontend redirects to Stripe Checkout
```

### `/api/stripe-webhook.js` (5,959 bytes)
**Purpose**: Handles `checkout.session.completed` events, sends email, fires Meta CAPI

**Environment Variables**:
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `META_PIXEL_ID` (e.g., "1542150893596407")
- `META_CAPI_ACCESS_TOKEN`
- `DOWNLOAD_URL`
- `META_TEST_EVENT_CODE` (optional, for testing)

**Key Operations**:
1. Verifies Stripe webhook signature
2. Sends HTML email via Resend with download link
3. Fires Meta Conversions API `Purchase` event
4. Uses SHA-256 hashed email for improved match quality
5. Includes deduplication with `event_id` = `session.id`

**Email Template**:
- From: `support@wolfwellness.life`
- Subject: "Your 7-Day Executive Reset — Download Now"
- Includes troubleshooting instructions
- Download link expires (Google Drive link)

### `/api/session-status.js` (856 bytes)
**Purpose**: Returns payment status and customer details

**Flow**:
```
GET /api/session-status?session_id=cs_xxx
→ Retrieves Stripe session
→ Returns {status, customer_email, amount_total, currency}
```

Used by `success.html` to verify payment before showing download.

### `/api/download.js` (682 bytes)
**Purpose**: Protected download endpoint (verifies payment before redirect)

**Environment Variables**:
- `STRIPE_SECRET_KEY`
- `DRIVE_DIRECT_URL`

**Flow**:
```
GET /api/download?session_id=cs_xxx
→ Verifies payment_status === "paid"
→ Redirects to Google Drive file
```

---

## Environment Variables Required

Configure these in Vercel dashboard:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_...           # Stripe API secret key
STRIPE_PRICE_ID=price_...               # Product price ID for $49 guide
STRIPE_WEBHOOK_SECRET=whsec_...         # Webhook signing secret

# Site URLs
SITE_URL=https://wolfwellness.life      # Base URL for redirects
DOWNLOAD_URL=https://drive.google.com/... # Download link for email
DRIVE_DIRECT_URL=https://drive.google.com/... # Direct download URL

# Email (Resend)
RESEND_API_KEY=re_...                   # Resend API key

# Meta Conversions API
META_PIXEL_ID=1542150893596407          # Facebook Pixel ID
META_CAPI_ACCESS_TOKEN=...              # Conversions API access token
META_TEST_EVENT_CODE=...                # (Optional) For testing events
```

---

## Third-Party Integrations

### Stripe
- **Product**: "7-Day Executive Reset" guide
- **Price**: $49.00 (configurable via `STRIPE_PRICE_ID`)
- **Webhook**: Configured to hit `/api/stripe-webhook`
- **Events**: `checkout.session.completed`

### Resend (Email Delivery)
- **Domain**: `wolfwellness.life` (must be verified)
- **From Address**: `support@wolfwellness.life`
- **Template**: HTML email with download link

### Meta Pixel & Conversions API
- **Pixel ID**: `1542150893596407`
- **Events Tracked**:
  - `PageView` (all pages)
  - `InitiateCheckout` (reset.html)
  - `Purchase` (success.html + webhook)
  - `Lead` (thank-you.html)
- **CAPI**: Server-side Purchase events from webhook
- **Deduplication**: Uses Stripe session ID as `event_id`

### Formspree
- **Form ID**: `xblpzrkq`
- **Used On**: Contact form (index.html), application form (apply.html)

### Google Fonts
- **Playfair Display** (serif, weights 500/700) - Headings
- **Open Sans** (sans-serif) - Body text
- **Great Vibes** (script) - Founder signature

### Google Drive
- Hosts downloadable PDF: "7-Day Executive Reset"
- Direct download link provided via `DRIVE_DIRECT_URL`

---

## Design System

### Color Palette
```css
--primary: #24513A          /* Dark forest green */
--accent: #d4af37           /* Luxury gold */
--text: #f5f0e1             /* Soft off-white */
--overlay: rgba(0,0,0,0.28-0.45)
```

### Typography
- **Headings**: Playfair Display (serif, elegant)
- **Body**: Open Sans (clean, readable)
- **Signature**: Great Vibes (script, personal touch)

### Spacing & Layout
- **Border Radius**: 12-18px (modern, soft corners)
- **Grid**: CSS Grid for services section
- **Flexbox**: Testimonials, article cards
- **Max Width**: 1200px for content areas

### Animations
1. **Fade-in on Scroll**: IntersectionObserver triggers
2. **Gold Pulse Glow**: Founder image (12s infinite)
3. **Testimonial Carousel**: Auto-rotation every 10 seconds
4. **Shimmer Effect**: Testimonials every 11 seconds
5. **Hero Re-trigger**: Animations replay on scroll into view

---

## SEO & Performance

### SEO Optimizations
- **Schema.org Markup**: Organization, LocalBusiness, Article, ItemList
- **Open Graph Tags**: All pages have OG metadata
- **Twitter Cards**: Summary with large image
- **Sitemap**: [sitemap.xml](sitemap.xml) with 12 URLs, priorities, change frequencies
- **Robots.txt**: Allows AI crawlers (GPTBot, ClaudeBot, PerplexityBot)
- **Canonical URLs**: All pages specify canonical links
- **Semantic HTML**: Proper use of `<header>`, `<nav>`, `<section>`, `<article>`, `<footer>`

### Performance Optimizations
- **CSS Transforms**: GPU acceleration with `translateZ(0)`
- **Backface Visibility**: Hidden for smoother animations
- **Lazy Loading**: IntersectionObserver for scroll-triggered elements
- **Minimal Dependencies**: No frontend frameworks (Vanilla JS)
- **Direct Downloads**: Google Drive links (no server bandwidth)

### Mobile Optimization
- Viewport meta tags with proper scaling
- Responsive CSS Grid/Flexbox layouts
- Touch-friendly button sizes (min 44x44px)
- Adaptive animation delays

---

## Security Considerations

1. **Webhook Verification**: Stripe signature verification in webhook handler
2. **Environment Variables**: Secrets never committed to repository
3. **HTTPS Only**: Enforced by Vercel
4. **Raw Body Parsing**: Required for Stripe webhook signature validation
5. **NoIndex on Conversion Pages**: `apply.html`, `thank-you.html` not indexed

---

## Deployment

### Current Setup
- **Platform**: Vercel
- **Branch**: `main` (auto-deploy on push)
- **Build Command**: None (static files)
- **Output Directory**: Root directory
- **Node Version**: 18.x (for serverless functions)

### Deployment Process
1. Push to GitHub `main` branch
2. Vercel auto-deploys
3. Functions in `/api` become serverless endpoints
4. Environment variables set in Vercel dashboard

### External Setup Checklist
- [ ] Stripe product & webhook configured
- [ ] Resend domain verified
- [ ] Meta Pixel installed on all pages
- [ ] Meta CAPI configured in Events Manager
- [ ] Formspree forms created
- [ ] Google Drive file uploaded with public link
- [ ] All environment variables set in Vercel

---

## Conversion Tracking Architecture

### Client-Side (Browser)
```
Meta Pixel → PageView, InitiateCheckout, Purchase, Lead
└── Uses localStorage for deduplication lock
└── Includes eventID = Stripe session_id
```

### Server-Side (Webhook)
```
Stripe Webhook → Meta CAPI Purchase Event
└── Uses event_id = session.id (matches Pixel eventID)
└── SHA-256 hashed email for match quality
└── Includes IP, user agent, fbp/fbc cookies
```

### Deduplication Flow
1. User completes purchase → Stripe redirects to `success.html?session_id=cs_xxx`
2. Browser fires Pixel Purchase with `eventID: 'cs_xxx'`
3. Webhook fires CAPI Purchase with `event_id: 'cs_xxx'`
4. Meta deduplicates based on matching event IDs
5. LocalStorage prevents duplicate browser fires on page refresh

---

## Content Strategy

### Target Audience
- C-suite executives
- High-performing professionals
- Business owners aged 35-55
- Frequent travelers with demanding schedules

### Content Themes
1. **Performance Optimization**: Peak physical/mental state
2. **Time Efficiency**: Results in minimal time commitment
3. **Executive-Specific**: Travel, stress, recovery
4. **Longevity**: Sustainable health over decades
5. **Holistic Approach**: Mind, body, lifestyle integration

### Insights Library Topics
- High-performer health paradox
- Virtual coaching efficiency
- Travel wellness strategies
- Age-appropriate training
- Recovery science
- Resilience building

---

## Service Offerings

### Foundation Program ($99/month)
- **Delivery**: Mobile app-based
- **Duration**: 4-week structured program
- **Target**: DIY professionals wanting guidance
- **Landing Page**: [foundation.html](foundation.html)

### Virtual 1:1 Coaching ($250/month)
- **Format**: 2x 30-minute video sessions per week
- **Includes**: Custom training, nutrition, accountability
- **Target**: Busy professionals needing flexibility

### Premium Executive Program ($800/month)
- **Format**: Comprehensive lifestyle transformation
- **Includes**: All aspects of W.O.L.F. methodology
- **Target**: High-level executives, elite performers

### Digital Product: "7-Day Executive Reset" ($49)
- **Format**: Downloadable PDF guide
- **Delivery**: Email + download page
- **Funnel**: [reset.html](reset.html) → Stripe → [success.html](success.html)

---

## Developer Notes

### Working with this Codebase

**File Organization**:
- All HTML pages are in the root directory (no `/pages` folder)
- Stylesheets also in root (consider organizing into `/css` in future)
- Images in root (consider `/assets` or `/images` folder)
- Only `/api` is in a subdirectory

**Making Changes**:
1. **Edit HTML**: Files are in root, named descriptively
2. **Edit Styles**: Multiple CSS files (style.css, apply.css, insights.css, foundation.css)
3. **Edit API Logic**: Functions in `/api` directory
4. **Test Locally**: Use Vercel CLI (`vercel dev`) to test functions locally
5. **Deploy**: Push to `main` branch

**Common Tasks**:
- **Update pricing**: Change `STRIPE_PRICE_ID` env var + update HTML text
- **Add article**: Create new `insights-{slug}.html` + update sitemap.xml
- **Modify email**: Edit template in [api/stripe-webhook.js](api/stripe-webhook.js)
- **Change download link**: Update `DOWNLOAD_URL` and `DRIVE_DIRECT_URL` env vars

### Code Conventions
- **ES6 Modules**: Used in most API functions (`import`/`export`)
- **CommonJS**: Used in `stripe-webhook.js` (required for raw body parsing)
- **Async/Await**: All API calls use async/await
- **Event Delegation**: Form submissions use event listeners
- **Vanilla JS**: No jQuery or frontend frameworks

### Testing Checklist
- [ ] Purchase flow: reset.html → Stripe → success.html
- [ ] Download link works after payment
- [ ] Email arrives via Resend
- [ ] Meta Pixel events fire correctly
- [ ] CAPI Purchase event appears in Events Manager
- [ ] Contact form submits to Formspree
- [ ] Application form submits and redirects

---

## Maintenance & Updates

### Regular Tasks
- Update `lastmod` in [sitemap.xml](sitemap.xml) when content changes
- Review Meta Pixel events in Events Manager
- Monitor Stripe webhook logs for errors
- Check Resend email delivery rates
- Update testimonials periodically

### Performance Monitoring
- Google PageSpeed Insights
- Lighthouse scores (aim for 90+ on all metrics)
- Core Web Vitals (LCP, FID, CLS)
- Stripe dashboard for conversion rates

### Content Updates
- Add new insight articles quarterly
- Update service pricing as needed
- Refresh testimonials with recent client feedback
- Update founder bio/images as appropriate

---

## Troubleshooting

### Common Issues

**Stripe webhook not firing**:
- Check webhook URL in Stripe dashboard: `https://wolfwellness.life/api/stripe-webhook`
- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- Check Vercel function logs for errors

**Email not sending**:
- Verify Resend domain is verified
- Check `RESEND_API_KEY` is correct
- Review Resend dashboard for bounces/failures

**Meta events not tracking**:
- Open browser console, check for Pixel errors
- Verify Pixel ID matches in both code and env vars
- Use Meta Pixel Helper Chrome extension
- Check Events Manager for test events

**Download link not working**:
- Verify Google Drive file has public access
- Check `DRIVE_DIRECT_URL` is correct format
- Ensure Stripe session shows `payment_status: "paid"`

---

## Future Enhancements

### Potential Improvements
1. **File Organization**: Move CSS to `/css`, images to `/assets`
2. **Build Process**: Add minification for CSS/JS (currently none)
3. **CMS Integration**: Consider headless CMS for blog articles
4. **A/B Testing**: Test different pricing, copy, CTAs
5. **Analytics**: Add Google Analytics 4 or Plausible
6. **Live Chat**: Consider Intercom or Drift for high-intent visitors
7. **Video Testimonials**: Embed video testimonials on homepage
8. **Member Portal**: Protected area for active clients
9. **Automated Sequences**: Email drip campaigns for leads
10. **Webinar Funnel**: Host live events for higher-ticket programs

---

## Resources & Links

### Live URLs
- **Production**: https://wolfwellness.life/
- **Repository**: https://github.com/cweunlimited/wolfwellness-site.git

### External Services
- **Stripe Dashboard**: https://dashboard.stripe.com/
- **Resend Dashboard**: https://resend.com/
- **Formspree Dashboard**: https://formspree.io/
- **Meta Events Manager**: https://business.facebook.com/events_manager2/
- **Vercel Dashboard**: https://vercel.com/dashboard

### Documentation
- Stripe API: https://stripe.com/docs/api
- Resend API: https://resend.com/docs
- Meta Conversions API: https://developers.facebook.com/docs/marketing-api/conversions-api/
- Vercel Serverless Functions: https://vercel.com/docs/functions

---

## Contact & Support

For technical issues or questions about this codebase, contact the development team or repository owner.

**Business Website**: https://wolfwellness.life/
**Support Email**: support@wolfwellness.life

---

**End of CLAUDE.md**
