# AI Agency — Master Control

## Owner
Sean Trinh (@kimchiwrice) — Sacramento, CA
Multi-venture operator: boba shop, digital marketing, trading, web dev, AI tools

## What This Repo Is
This is an AI-powered website agency. You (Claude) are the lead operator. When Sean drops a brief, you coordinate parallel agents to build, style, animate, and deploy websites.

## How It Works

### Workflow
1. Sean creates a brief in `briefs/` (or describes what he wants verbally)
2. Read the brief and the relevant agent configs in `agents/`
3. Spin up parallel sub-agents, each handling their domain
4. Output goes to `output/{project-name}/`
5. Deploy to Vercel when ready

### Agent Roles (see `agents/` for full configs)
- **Architect** — HTML structure, semantic markup, responsive layout
- **Designer** — CSS styling, color themes, typography, visual polish
- **Animator** — Three.js, CSS animations, scroll effects, 3D heroes
- **Content** — Copywriting, SEO meta tags, microcopy
- **Deployer** — Vercel deployment, domain config, CI/CD

### Parallel Execution Rules
- Architect goes FIRST (others need structure to work with)
- Designer + Animator + Content run IN PARALLEL after structure exists
- Deployer goes LAST after all agents merge their work
- Each agent writes to their designated section — no conflicts

## Sean's Preferences (NON-NEGOTIABLE)
- **Visual style**: Premium, cinematic, modern. NOT wireframes, NOT particles, NOT morphing blobs
- **Target aesthetic**: Kling AI 4D depth effects — living photographs, smooth parallax
- **Color direction**: Dark forest green + copper/brown + cream (unless brief says otherwise)
- **Architecture**: Single-file HTML preferred. All CSS/JS inline.
- **Communication**: Direct, execution-focused. Show results, iterate fast.
- **Quality bar**: Think luxury brand website, not tech demo

## File Structure
```
ai-agency/
├── .github/workflows/    # GitHub Actions CI/CD
├── agents/               # Agent role definitions
├── briefs/               # Project briefs (input)
│   └── completed/        # Finished briefs archive
├── output/               # Generated websites
├── templates/            # Starter HTML templates
├── scripts/              # Build & deploy utilities
├── CLAUDE.md             # This file (master instructions)
└── README.md             # Repo overview
```

## Deployment Architecture

### Two-Repo Setup (CRITICAL — read before deploying)
This agency uses TWO separate repos for deployment:

| Site | URL | Repo | Deploy Method |
|------|-----|------|---------------|
| Trinh Media | `trinh-media-site.vercel.app` | `github.com/kimchiwrice/trinh-media-site` | Git push → Vercel auto-deploy |
| Paws & Co | `paws-and-co-eta.vercel.app` | N/A (CLI deploy) | `vercel --prod --yes` from output dir |

### Trinh Media (Agency Portfolio Site)
- **Vercel has Git Integration** connected to `kimchiwrice/trinh-media-site`
- **CLI deploys are BLOCKED** — Vercel rejects `vercel --prod` when Git Integration is active
- **To deploy**: Clone `trinh-media-site` repo → copy updated `index.html` from `output/trinh-media/` → git push → Vercel auto-deploys
- Source of truth for the site content: `output/trinh-media/index.html` in THIS repo
- Deployment repo location (local): `C:\Users\Sean T\trinh-media-site`

### Paws & Co (Client Site)
- **No Git Integration** — deploys via Vercel CLI
- **To deploy**: `cd output/paws-and-co && vercel --prod --yes`
- Vercel org: `kimchiwrices-projects`

### Windows Deployment Workarounds
PowerShell PATH issues can prevent `vercel` and `git` from running directly. Use these patterns:

**Node.js script pattern (for Vercel CLI):**
```javascript
// Save as deploy.js, run with: C:\PROGRA~1\nodejs\node.exe deploy.js
const { execSync } = require('child_process');
process.chdir('C:\\Users\\Sean T\\ai-agency\\output\\{project}');
execSync('vercel --prod --yes', { stdio: 'inherit', env: { ...process.env, PATH: process.env.PATH } });
```

**Git push pattern (for trinh-media-site):**
```javascript
const { execSync } = require('child_process');
const git = 'C:\\Program Files\\Git\\bin\\git.exe';
const repo = 'C:\\Users\\Sean T\\trinh-media-site';
execSync(`"${git}" -C "${repo}" add -A`, { stdio: 'inherit' });
execSync(`"${git}" -C "${repo}" commit -m "Update site"`, { stdio: 'inherit' });
execSync(`"${git}" -C "${repo}" push`, { stdio: 'inherit' });
```

**Key paths on this machine:**
- Node.js: `C:\PROGRA~1\nodejs\node.exe`
- Git: `C:\Program Files\Git\bin\git.exe`
- ai-agency repo: `C:\Users\Sean T\ai-agency`
- trinh-media-site repo: `C:\Users\Sean T\trinh-media-site`

## Housekeeping Rules
- Do NOT leave temp files (serve.js, deploy.js, .bat scripts) in the repo or C:\ root
- `.vercel/` directories are gitignored — never commit them
- Keep output folders clean: only `index.html` (and assets if needed) per project
- Always test images before committing (Unsplash IDs can go stale)
