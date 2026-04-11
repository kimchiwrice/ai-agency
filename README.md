# AI Agency

Private AI-powered website factory. Drop a brief, agents build the site.

## How to Use

### Option 1: Terminal (Claude Code)
```bash
cd ai-agency
# Open Claude Code and describe what you want
# Claude reads CLAUDE.md + agent configs and executes
```

### Option 2: GitHub (Push a Brief)
```bash
# Copy the template
cp briefs/_template.md briefs/my-new-site.md
# Fill it out, then push
git add briefs/my-new-site.md
git commit -m "Brief: my-new-site"
git push
# GitHub Actions triggers the build automatically
```

### Option 3: Manual Trigger
Go to Actions tab → "AI Agency — Build Site" → Run workflow → Enter brief filename

## Agents
| Agent | Role | Runs |
|-------|------|------|
| Architect | HTML structure & layout | First |
| Designer | CSS, themes, visual polish | After Architect |
| Animator | Three.js, animations, interactions | After Architect |
| Content | Copy, SEO, microcopy | After Architect |
| Deployer | Vercel deployment | Last |

## Setup
1. Add `ANTHROPIC_API_KEY` to repo secrets (for GitHub Actions)
2. Vercel CLI installed locally for manual deploys

---
*Built by Sean Trinh — Sacramento, CA*
