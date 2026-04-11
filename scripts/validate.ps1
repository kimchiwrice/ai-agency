# AI Agency — Site Validator (Windows/PowerShell)
# Usage: .\scripts\validate.ps1 output\project-name\index.html

param([string]$File)

if (-not $File) {
    Write-Host "Usage: .\scripts\validate.ps1 <html-file>"
    exit 1
}
if (-not (Test-Path $File)) {
    Write-Host "Error: File '$File' not found." -ForegroundColor Red
    exit 1
}

Write-Host "=== AI Agency — Validation ===" -ForegroundColor Cyan
Write-Host "File: $File"
Write-Host ""

$content = Get-Content $File -Raw
$errors = 0
$warnings = 0

# Check for remaining placeholders
$placeholders = ([regex]::Matches($content, '\{\{')).Count
if ($placeholders -gt 0) {
    Write-Host "[ERROR] Found $placeholders unresolved {{PLACEHOLDER}} tags" -ForegroundColor Red
    $errors++
}
# Check for lorem ipsum
if ($content -match "lorem ipsum") {
    Write-Host "[ERROR] Found lorem ipsum placeholder text" -ForegroundColor Red
    $errors++
}

# Check required elements
$required = @("<title>", '<meta name="viewport"', '<meta name="description"', "<nav", "<footer")
foreach ($tag in $required) {
    if ($content -notmatch [regex]::Escape($tag)) {
        Write-Host "[WARNING] Missing: $tag" -ForegroundColor Yellow
        $warnings++
    }
}

# Check for unfilled agent injection points
$unfilled = ([regex]::Matches($content, '<!-- .* fills these -->')).Count
if ($unfilled -gt 0) {
    Write-Host "[WARNING] Found $unfilled unfilled agent injection points" -ForegroundColor Yellow
    $warnings++
}

# Check for empty sections (no content between tags)
$emptySections = ([regex]::Matches($content, '<section[^>]*>\s*<div[^>]*>\s*<h2>[^<]*</h2>\s*</div>\s*</section>')).Count
if ($emptySections -gt 0) {
    Write-Host "[WARNING] Found $emptySections empty sections" -ForegroundColor Yellow
    $warnings++
}
Write-Host ""
Write-Host "Results: $errors errors, $warnings warnings"
if ($errors -gt 0) {
    Write-Host "STATUS: FAIL — fix errors before deploying" -ForegroundColor Red
    exit 1
} else {
    Write-Host "STATUS: PASS — ready to deploy" -ForegroundColor Green
}