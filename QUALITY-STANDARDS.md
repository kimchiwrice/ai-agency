# Quality Standards — $5K-$15K+ Tier

## The Gap We're Closing
A $500 website gives pages. A $10K+ website gives PURPOSE.
Every section must answer a specific question the visitor has before they convert.
This document defines the minimum bar for every site this agency ships.

## Scoring System (Awwwards-Inspired)
Rate every build on 4 dimensions, 1-10 scale. Minimum to ship: 7.0 average.

| Category | Weight | What It Measures |
|----------|--------|-----------------|
| Design | 40% | Visual polish, typography, spacing, color harmony, premium feel |
| Usability | 30% | Navigation, mobile responsiveness, load speed, accessibility, clarity |
| Creativity | 20% | Unique interactions, animations, memorable moments, "wow factor" |
| Content | 10% | Copy quality, SEO foundations, clear value proposition, no filler |

### Score Thresholds
- 8.5+ = Awwwards-submittable. Elite tier.
- 7.5-8.4 = $10K-$15K quality. Strong agency work.
- 7.0-7.4 = $5K-$10K quality. Solid, professional.
- Below 7.0 = DO NOT SHIP. Needs revision.

## Pre-Deploy Checklist (MUST PASS ALL)

### Design (40%)
- [ ] Custom color palette with CSS variables — no default/template colors
- [ ] Consistent spacing system (8px grid baseline)
- [ ] Typography hierarchy: max 2 font families, clear size/weight scale
- [ ] No default browser styling visible anywhere
- [ ] Custom scrollbar, selection colors, focus states
- [ ] Hover states on every interactive element (buttons, links, cards)
- [ ] Smooth transitions (0.3s ease minimum on all state changes)
- [ ] Hero section is cinematic — video background, parallax, or 3D element
- [ ] Visual rhythm: alternating section layouts, not repetitive blocks
- [ ] Dark/moody premium aesthetic (unless brief specifies otherwise)

### Usability (30%)
- [ ] Mobile-first responsive: looks perfect at 375px, 768px, 1024px, 1440px
- [ ] Navigation works on mobile (hamburger menu or equivalent)
- [ ] All images have alt text
- [ ] All images load (tested with Image() constructor — no 0x0 dimensions)
- [ ] No horizontal scroll at any viewport
- [ ] Tap targets minimum 44x44px on mobile
- [ ] Page loads under 3 seconds on simulated 3G
- [ ] Semantic HTML5 elements throughout (header, nav, main, section, footer)
- [ ] Proper heading hierarchy (h1 → h2 → h3, no skips)
- [ ] Skip-to-content link for accessibility

### Creativity (20%)
- [ ] At least ONE unique interaction (scroll-triggered animation, parallax, 3D element)
- [ ] Scroll-reveal animations on content sections (staggered, not all at once)
- [ ] Custom cursor or micro-interaction (subtle, not gimmicky)
- [ ] Loading state or entrance animation
- [ ] Something the visitor hasn't seen on a template site before

### Content (10%)
- [ ] Clear value proposition above the fold (visitor knows what this business does in 3 seconds)
- [ ] SEO: title tag, meta description, Open Graph tags all set
- [ ] No placeholder/lorem ipsum text
- [ ] CTA (call-to-action) visible without scrolling
- [ ] Footer with business info, links, copyright
- [ ] Schema markup for local business (if applicable)

### Technical (Pass/Fail — blocks deploy)
- [ ] Valid HTML (no unclosed tags, no duplicate IDs)
- [ ] All CSS/JS inline (single-file architecture)
- [ ] No console errors
- [ ] No mixed content warnings (all resources HTTPS)
- [ ] Responsive meta viewport tag present
- [ ] Favicon set (or placeholder)

## $5K vs $15K — Feature Ladder

### $5K Tier (Minimum — every site must hit this)
- Custom design (not a template reskin)
- Responsive across all devices
- Basic SEO (meta tags, semantic HTML, fast load)
- Scroll animations and hover states
- Professional copywriting
- Deployed on Vercel with SSL

### $10K Tier (Target — where most builds should land)
- Everything in $5K tier PLUS:
- Video hero or 3D interactive element
- Advanced scroll-triggered animations (parallax, reveal sequences)
- Strategic layout (every section drives toward conversion)
- Accessibility basics (alt text, keyboard nav, proper contrast)
- Performance optimized (lazy loading, optimized images)
- Schema markup for SEO

### $15K+ Tier (Stretch — for premium clients)
- Everything in $10K tier PLUS:
- Three.js or WebGL interactive elements
- Custom cursor interactions
- Page transitions or route animations
- Advanced accessibility (WCAG 2.1 AA compliance)
- Analytics integration ready
- CMS or content management hooks
- Multi-page with consistent design system

## Competitive Benchmarks (Study These)

### Awwwards Scoring Reference
- 15,000+ sites submitted per year, fewer than 365 earn Site of the Day
- Scoring: Design (40%), Usability (30%), Creativity (20%), Content (10%)
- 6.5+ from jury = Honorable Mention
- Our target: consistently score 7.5+ on our own rubric

### Agencies to Study and Beat
- **Ueno** — branding + personality + world-class design
- **Immersive Garden** — immersive digital experiences, multiple Awwwards
- **Octave & Octave** — minimalist luxury, premium UX/UI
- **Digidop** — Webflow agency, heavy social proof, impressive portfolio
- **Active Theory** — WebGL/Three.js interactive experiences
- **Locomotive** — smooth scroll, creative animations, clean code

### What Makes Them $15K+ Worth
1. Strategy-first: layout is reverse-engineered from business goals
2. Custom everything: no template DNA visible anywhere
3. Performance: fast despite complex animations
4. Memorable: visitor remembers the site hours later
5. Conversion-focused: every section moves toward a CTA

## Self-Review Process

### After Every Build (MANDATORY)
1. Score the site on all 4 dimensions (1-10 each)
2. Calculate weighted average
3. If below 7.0 — identify weakest dimension and fix before deploy
4. If 7.0-7.4 — note improvement opportunities in post-build review
5. If 7.5+ — ship it, add to portfolio

### Post-Build Review Template
```
## Post-Build Review: {Project Name}
Date: {date}
Scores: Design {x}/10 | Usability {x}/10 | Creativity {x}/10 | Content {x}/10
Weighted Average: {x.x}
Tier: $5K / $10K / $15K+

### What Worked
- 

### What to Improve Next Time
- 

### New Pattern/Technique Learned
- 

### Update CLAUDE.md? (yes/no, what to add)
- 
```

Save each review to `briefs/completed/{project-name}-review.md`
If "Update CLAUDE.md" is yes — append the lesson to CLAUDE.md's Lessons Learned section.
This is how the system gets smarter over time.
