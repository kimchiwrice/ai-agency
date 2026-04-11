#!/bin/bash
# AI Agency — Local Build Script
# Usage: bash scripts/build-local.sh briefs/my-site.md
# Builds a site locally using Claude Code without GitHub Actions

set -e

BRIEF="$1"
if [ -z "$BRIEF" ]; then
  echo "Usage: bash scripts/build-local.sh <brief-file>"
  echo "Example: bash scripts/build-local.sh briefs/new-client.md"
  exit 1
fi

if [ ! -f "$BRIEF" ]; then
  echo "Error: Brief file '$BRIEF' not found."
  exit 1
fi

# Extract project name from brief
PROJECT=$(grep -A1 "## Project Name" "$BRIEF" | tail -1 | tr -d '[:space:]')
if [ -z "$PROJECT" ]; then
  PROJECT=$(basename "$BRIEF" .md)
fi

echo "=== AI Agency — Local Build ==="
echo "Brief:   $BRIEF"
echo "Project: $PROJECT"
echo "Output:  output/$PROJECT/"
echo ""
# Create output directory
mkdir -p "output/$PROJECT"

# Copy starter template if no index.html exists yet
if [ ! -f "output/$PROJECT/index.html" ]; then
  cp templates/starter.html "output/$PROJECT/index.html"
  echo "Created output/$PROJECT/index.html from template"
fi

# Run Claude Code with the full agent pipeline prompt
echo "Launching Claude Code build..."
claude --print "
You are the AI Agency lead operator. Read these files in order:
1. CLAUDE.md (master instructions)
2. $BRIEF (project brief)
3. agents/architect.md, agents/designer.md, agents/animator.md, agents/content.md

Execute the full build pipeline:
Step 1: ARCHITECT — Build HTML structure in output/$PROJECT/index.html
Step 2: DESIGNER + ANIMATOR + CONTENT — Run in parallel, inject into the HTML
Step 3: Validate — Ensure no placeholders remain, all sections complete

Output the final site to output/$PROJECT/index.html as a single self-contained HTML file.
Do NOT leave any {{PLACEHOLDER}} text. Replace all with real content from the brief.
"

echo ""
echo "=== Build Complete ==="
echo "Output: output/$PROJECT/index.html"
echo "Preview: open output/$PROJECT/index.html in browser"
echo "Deploy:  cd output/$PROJECT && vercel --prod --yes"