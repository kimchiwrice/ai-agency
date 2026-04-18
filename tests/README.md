# Test Harness — AI Agency

Every site Sean's agency ships has to pass the same bar. This harness validates every `output/<project>/index.html` and writes a per-project scorecard to `output/<project>/.quality.json`. When Tier-1 validators fail, the self-heal loop asks Claude for a patched file and re-runs until clean or out of budget.

## Layout

```
tests/
├── runner.mjs              # orchestrator — loads all validators, runs per-project, emits .quality.json
├── self-heal.mjs           # Claude-powered patch loop for Tier-1 failures
├── .htmlvalidate.json      # html-validate config
├── validators/
│   ├── html-validate.mjs   # Tier 1 — HTML validity (dup IDs, bad nesting)
│   ├── seo-meta.mjs        # Tier 1 — required <meta> + OG + Twitter + canonical
│   ├── assets.mjs          # Tier 1 — <img alt/width/height>, <video autoplay muted loop playsinline>
│   ├── structure.mjs       # Tier 1 — nav/footer/h1, no lorem, no unresolved placeholders
│   └── links.mjs           # Tier 2 — broken internal anchors (external opt-in)
└── .heal-backups/          # gitignored — safety copies before each heal patch
```

## Tiers

| Tier | Meaning | Effect |
|------|---------|--------|
| 1 | Ship-blocker | Any failure fails `npm test` and blocks the CI gate |
| 2 | Quality moat | Reported, does not block (yet) |
| 3 | Polish | Reported, informational |

## Local usage

```bash
npm install
npm test                                 # all projects in output/
npm run test:project paws-and-co         # single project
CHECK_EXTERNAL=1 npm test                # enable external link HTTP checks (flaky in CI)
npm run test:json > reports/quality.json # machine-readable output
```

## Self-heal

Requires `ANTHROPIC_API_KEY` in env.

```bash
npm run heal                             # heal every failing project (max 3 iters each)
npm run heal:project paws-and-co         # heal one
MAX_ITER=5 npm run heal                  # raise the iteration cap
node tests/self-heal.mjs --dry           # preview — show what would change, don't write
```

Each heal iteration:
1. Runs validators → collects Tier-1 failures
2. Sends HTML + failure list to Claude with a strict repair system prompt
3. Writes the patched file (backup kept in `tests/.heal-backups/`)
4. Re-runs validators
5. Stops when Tier-1 is clean or the iteration cap is hit

A full log of each run lands in `tests/.heal-backups/heal-run-<ts>.json`.

## CI gate

`.github/workflows/validate-output.yml` runs `npm test` on every push that touches `output/` or `tests/`. A failed Tier-1 check fails the job. Manually dispatch the workflow with `heal=true` to auto-patch and commit on a run.

## Adding a validator

1. Create `tests/validators/<name>.mjs` exporting `{ default, meta }`.
2. `meta = { name, tier, description }`.
3. `default` receives `{ projectName, htmlPath, html, dom }` and returns `{ ...meta, passed, errors, warnings, stats }`.
4. Import it and add to the `VALIDATORS` array in `runner.mjs` and `self-heal.mjs`.

Keep validators pure — no network, no disk writes. Put anything stateful behind an env flag (see `CHECK_EXTERNAL`).

## Roadmap (Tier 2 / Tier 3)

- **accessibility**: `@axe-core/playwright` — WCAG 2.1 AA, color contrast on the dark-forest palette
- **lighthouse**: perf + SEO + a11y scores per project, budget: perf ≥ 85
- **responsive**: Playwright at 375 / 768 / 1440 — no horizontal scroll, nav opens on mobile, tap targets ≥ 44px
- **visual-regression**: Playwright screenshots, diff against baselines in `tests/baselines/`
- **asset-health**: HTTP HEAD every image/video URL (catches stale Unsplash IDs)
- **performance-budget**: assert HTML ≤ 250KB inline, total page weight ≤ 1.5MB
- **post-deploy smoke**: fetch the live URL from `projects.json`, assert 200 + title

Each new validator plugs into the same pipeline; the self-heal loop already handles arbitrary Tier-1 errors, so harder diagnostics automatically become healable.
