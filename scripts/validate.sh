#!/bin/bash
# AI Agency — Site Validator
# Usage: bash scripts/validate.sh output/project-name/index.html
# Checks for common issues before deployment

set -e

FILE="$1"
if [ -z "$FILE" ]; then
  echo "Usage: bash scripts/validate.sh <html-file>"
  exit 1
fi

if [ ! -f "$FILE" ]; then
  echo "Error: File '$FILE' not found."
  exit 1
fi

echo "=== AI Agency — Validation ==="
echo "File: $FILE"
echo ""
ERRORS=0
WARNINGS=0

# Check for remaining placeholders
PLACEHOLDERS=$(grep -c '{{' "$FILE" 2>/dev/null || true)
if [ "$PLACEHOLDERS" -gt 0 ]; then
  echo "[ERROR] Found $PLACEHOLDERS unresolved {{PLACEHOLDER}} tags"
  grep -n '{{' "$FILE"
  ERRORS=$((ERRORS + 1))
fi
# Check for lorem ipsum
LOREM=$(grep -ci 'lorem ipsum' "$FILE" 2>/dev/null || true)
if [ "$LOREM" -gt 0 ]; then
  echo "[ERROR] Found lorem ipsum placeholder text"
  ERRORS=$((ERRORS + 1))
fi

# Check for unclosed tags
OPEN_DIV=$(grep -co '<div' "$FILE" 2>/dev/null || true)
CLOSE_DIV=$(grep -co '</div>' "$FILE" 2>/dev/null || true)
if [ "$OPEN_DIV" != "$CLOSE_DIV" ]; then
  echo "[WARNING] Mismatched div tags: $OPEN_DIV open, $CLOSE_DIV close"
  WARNINGS=$((WARNINGS + 1))
fi

# Check required elements
for TAG in "<title>" "<meta name=\"viewport\"" "<meta name=\"description\"" "<nav" "<footer"; do
  if ! grep -q "$TAG" "$FILE"; then
    echo "[WARNING] Missing: $TAG"
    WARNINGS=$((WARNINGS + 1))
  fi
done

# Check for empty sections
EMPTY=$(grep -c '<!-- .* fills these -->' "$FILE" 2>/dev/null || true)
if [ "$EMPTY" -gt 0 ]; then
  echo "[WARNING] Found $EMPTY unfilled agent injection points"
  WARNINGS=$((WARNINGS + 1))
fi

echo ""
echo "Results: $ERRORS errors, $WARNINGS warnings"
if [ "$ERRORS" -gt 0 ]; then
  echo "STATUS: FAIL — fix errors before deploying"
  exit 1
else
  echo "STATUS: PASS — ready to deploy"
fi