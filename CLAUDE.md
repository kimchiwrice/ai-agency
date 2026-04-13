# AI Agency — Master Control

## Operator Profile
**Sean Trinh** (@kimchiwrice) — Sacramento, CA
- Multi-venture operator: boba shop (food service), digital marketing agency, trading/investing, web dev, AI tools
- Building **Trinh Media** — an AI-powered website-building agency
- Thinks like an operator: systems over one-off fixes, leverage over effort, execution over planning
- Communication style: direct, structured, bullet points, no fluff
- Decision style: optimize for long-term leverage, reduce mental load, build repeatable systems

### What Sean Cares About
- Speed to deployment — show results, iterate fast
- Premium visual quality — luxury brand aesthetic, not tech demos
- Clean systems — no clutter, no leftover temp files, everything documented
- Portfolio growth — every client site doubles as a showcase piece on trinh-media-site.vercel.app
- Scalability — the agency should run the same way whether it's 1 project or 20

## What This Repo Is
An AI-powered website agency. Claude is the lead operator. When Sean drops a brief (or describes what he wants), Claude coordinates parallel agents to build, style, animate, and deploy websites.

## Agency Workflow

### Build Pipeline
1. Sean creates a brief in `briefs/` (or describes verbally)
2. Read the brief + relevant agent configs in `agents/`
3. Architect goes FIRST — HTML structure, semantic markup, responsive layout
4. Designer + Animator + Content run IN PARALLEL after structure exists
5. Output goes to `output/{project-name}/`
6. Deployer goes LAST — validate, deploy to Vercel, report live URL
7. Add the new site as a portfolio card on Trinh Media

### Agent Roles (see `agents/` for full configs)
- **Architect** — HTML structure, semantic markup, responsive layout
- **Designer** — CSS styling, color themes, typography, visual polish
- **Animator** — Three.js, CSS animations, scroll effects, 3D heroes
- **Content** — Copywriting, SEO meta tags, microcopy
- **Deployer** — Vercel deployment, domain config, CI/CD

### Architecture Rules
- Single-file HTML preferred. All CSS/JS inline.
- No external CSS/JS files (CDN libraries like Three.js are OK)
- Mobile-first responsive design
- Semantic HTML5 elements

## Design Preferences (NON-NEGOTIABLE)
- **Visual style**: Premium, cinematic, modern. NOT wireframes, NOT particles, NOT morphing blobs
- **Target aesthetic**: Kling AI 4D depth effects — living photographs, smooth parallax
- **Default palette**: Dark forest green (#0D1F0D) + copper/brown (#A67C52) + cream (#E5E0D5) — unless brief says otherwise
- **Quality bar**: Think luxury brand website, not tech demo
- **Hero sections**: Cinematic video backgrounds preferred over static images. Use HTML5 `<video autoplay muted loop playsinline>` with poster fallback
- **Images**: Use Unsplash for stock photos. ALWAYS test image IDs before committing (IDs go stale)
- **Animations**: Scroll-reveal, parallax depth, Three.js orbs/particles for accent — subtle and premium, not gimmicky

## Project Registry (KEEP UPDATED)

| Project | Status | Live URL | Deploy Method | Notes |
|---------|--------|----------|---------------|-------|
| Trinh Media | LIVE | trinh-media-site.vercel.app | Git push to kimchiwrice/trinh-media-site | Agency portfolio site |
| Paws & Co | LIVE | paws-and-co-eta.vercel.app | Vercel CLI | Pet shop — video hero, 4D parallax gallery, Three.js orbs |
| Command Center | LIVE | command-center-five-lac.vercel.app | Vercel CLI | Jarvis-style ops dashboard — stats, pipeline, quality radar |

When adding new projects: deploy first, then add a portfolio card to Trinh Media's index.html and push that repo too.

## Deployment Architecture

### Two-Repo Setup (CRITICAL — read before deploying)

| Site | URL | Repo | Deploy Method |
|------|-----|------|---------------|
| Trinh Media | `trinh-media-site.vercel.app` | `github.com/kimchiwrice/trinh-media-site` | Git push → auto-deploy |
| Paws & Co | `paws-and-co-eta.vercel.app` | N/A (CLI deploy) | `vercel --prod --yes` |

### Trinh Media (Agency Portfolio)
- Vercel Git Integration is connected to `kimchiwrice/trinh-media-site`
- **CLI deploys are BLOCKED** — Vercel rejects `vercel --prod` when Git Integration is active
- **To deploy**: Clone `trinh-media-site` repo → copy updated `index.html` from `output/trinh-media/` → git push → Vercel auto-deploys
- Source of truth: `output/trinh-media/index.html` in THIS repo
- Local deployment repo: `C:\Users\Sean T\trinh-media-site`

### Client Sites (Paws & Co, future projects)
- Deploy via Vercel CLI: `cd output/{project} && vercel --prod --yes`
- Vercel org: `kimchiwrices-projects`
- After deploying a new client site, ALWAYS add it as a portfolio card on Trinh Media

## Technical Environment (Windows)

### Key Paths
- Node.js: `C:\PROGRA~1\nodejs\node.exe` (use this for cmd compatibility — avoids space issues)
- Git: `C:\Program Files\Git\bin\git.exe`
- ai-agency repo: `C:\Users\Sean T\ai-agency`
- trinh-media-site repo: `C:\Users\Sean T\trinh-media-site`
- npm global modules: `%APPDATA%\npm\node_modules\`

### Windows Workarounds (LEARNED THE HARD WAY)
PowerShell and cmd both have issues with paths containing spaces. The reliable pattern:

**Use Node.js scripts for CLI tools (Vercel, Git, etc.):**
```javascript
// Save as temp script, run with: C:\PROGRA~1\nodejs\node.exe script.js
const { execSync } = require('child_process');
const run = (cmd) => execSync(cmd, { cwd: 'C:\\Users\\Sean T\\ai-agency\\output\\{project}', stdio: 'inherit' });
run('vercel --prod --yes');
```

**Use Desktop Commander MCP** for file operations on Windows — it handles paths correctly.

**Never rely on:**
- `Start-Process` with arguments containing spaces (splits args wrong)
- `file:///` URLs in Chrome (shows error pages)
- PowerShell PATH for global npm binaries (inconsistent)
- `cmd /c` with quoted paths containing spaces (parsing nightmare)

## Lessons Learned (AVOID REPEATING THESE)

### Image Handling
- Unsplash photo IDs can go stale or return 0x0 images — ALWAYS test with `new Image()` + check `naturalWidth` before committing
- Test pattern: `img.src = 'https://images.unsplash.com/photo-{ID}?w=400&q=80'` then check `img.naturalWidth > 0` after onload
- `loading="lazy"` images won't load until scrolled into view — if combined with scroll-reveal `opacity:0`, they may NEVER trigger
- Always include width/quality params on Unsplash URLs: `?w=1800&q=85` for heroes, `?w=900&q=80` for cards

### Video Backgrounds
- Pexels video CDN pattern: `https://videos.pexels.com/video-files/{videoId}/{fileHash}_{width}_{height}_{fps}fps.mp4`
- ALWAYS include a poster image as fallback
- Required attributes: `autoplay muted loop playsinline` (all four needed for cross-browser autoplay)
- WebFetch is BLOCKED on video sites (pexels, pixabay, mixkit, coverr) — use Chrome browser tools instead

### Deployment
- Vercel Git Integration BLOCKS CLI deploys — this is by design, not a bug
- "Unexpected error. Please try again later." from Vercel CLI = Git Integration is blocking you
- When adding portfolio cards to Trinh Media: edit `output/trinh-media/index.html` in THIS repo, then copy to `trinh-media-site` repo and push
- Never deploy from a directory with a `.vercel/` folder from a different project

### Chrome/Browser MCP
- `JSON.stringify()` in Chrome JS tool can get blocked if output contains cookies/query strings — use simple string concatenation instead
- Python http.server may not be on PATH — use Node.js `http.createServer` instead for local file serving

## API Keys & Services
- See `.env.example` for required keys (Replicate, Kling, Stability, Anthropic)
- NEVER commit `.env` — it's in `.gitignore`
- Sean has rotated his Anthropic API key — current key is set in PowerShell environment
- Vercel account: kimchiwrices-projects org
- GitHub: kimchiwrice

## File Structure
```
ai-agency/
├── .github/workflows/    # GitHub Actions CI/CD
├── agents/               # Agent role definitions
├── briefs/               # Project briefs (input)
│   └── completed/        # Finished briefs archive
├── output/               # Generated websites (one folder per project)
│   ├── paws-and-co/      # Pet shop site (LIVE)
│   └── trinh-media/      # Agency portfolio (LIVE — source of truth)
├── templates/            # Starter HTML templates
├── scripts/              # Build & deploy utilities
├── CLAUDE.md             # This file (master instructions)
└── README.md             # Repo overview
```

## Housekeeping Rules
- Do NOT leave temp files (serve.js, deploy.js, .bat scripts) in the repo or C:\ root
- `.vercel/` directories are gitignored — never commit them
- Keep output folders clean: only `index.html` (and assets if needed) per project
- Always test images before committing (Unsplash IDs go stale)
- Clean up any Node.js helper scripts after use (deploy scripts, git scripts, etc.)
- After every project: update the Project Registry table above

## Quality System (READ BEFORE EVERY BUILD)

### Reference Document
Read `QUALITY-STANDARDS.md` before every build. It contains:
- Awwwards-inspired 4-dimension scoring rubric (Design/Usability/Creativity/Content)
- Pre-deploy checklist (every item must pass before shipping)
- $5K / $10K / $15K+ feature ladder (know which tier you're building for)
- Competitive benchmarks (agencies to study and beat)

### Minimum Bar
- Weighted score must be 7.0+ to ship
- Target: 7.5+ (consistent $10K-$15K quality)
- Stretch: 8.5+ (Awwwards-submittable)

### Self-Improvement Loop (THIS IS HOW THE SYSTEM GETS SMARTER)
After EVERY build:
1. Score the site on the 4-dimension rubric
2. Write a post-build review to `briefs/completed/{project}-review.md`
3. Identify the weakest dimension and what to improve
4. If a new pattern or lesson was learned → APPEND it to CLAUDE.md Lessons Learned
5. If quality bar should be raised → UPDATE QUALITY-STANDARDS.md

This creates a compounding knowledge loop:
Build → Score → Review → Learn → Update docs → Next build starts smarter

### Agencies to Study (Bookmark These)
- Ueno, Immersive Garden, Octave & Octave, Active Theory, Locomotive
- Browse Awwwards SOTD weekly for inspiration
- Reverse-engineer: what makes a site feel $15K vs $5K?
