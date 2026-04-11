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
- **Architect** → HTML structure, semantic markup, responsive layout
- **Designer** → CSS styling, color themes, typography, visual polish
- **Animator** → Three.js, CSS animations, scroll effects, 3D heroes
- **Content** → Copywriting, SEO meta tags, microcopy
- **Deployer** → Vercel deployment, domain config, CI/CD

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

## Deployment
- Default platform: Vercel
- Deploy command: `vercel --prod --yes` from project output directory
- Sean's Vercel org: kimchiwrices-projects
