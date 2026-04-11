# AI Agency — Local Build Script (Windows/PowerShell)
# Usage: .\scripts\build-local.ps1 briefs\my-site.md

param([string]$Brief)

if (-not $Brief) {
    Write-Host "Usage: .\scripts\build-local.ps1 <brief-file>"
    Write-Host "Example: .\scripts\build-local.ps1 briefs\new-client.md"
    exit 1
}

if (-not (Test-Path $Brief)) {
    Write-Host "Error: Brief file '$Brief' not found." -ForegroundColor Red
    exit 1
}

# Extract project name
$content = Get-Content $Brief -Raw
if ($content -match "## Project Name\s+(\S+)") {
    $Project = $Matches[1]
} else {
    $Project = [System.IO.Path]::GetFileNameWithoutExtension($Brief)
}

Write-Host "=== AI Agency — Local Build ===" -ForegroundColor Cyan
Write-Host "Brief:   $Brief"
Write-Host "Project: $Project"
Write-Host "Output:  output\$Project\"
Write-Host ""
# Create output directory
$outputDir = "output\$Project"
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

# Copy starter template if needed
$indexPath = "$outputDir\index.html"
if (-not (Test-Path $indexPath)) {
    Copy-Item "templates\starter.html" $indexPath
    Write-Host "Created $indexPath from template" -ForegroundColor Green
}

# Run Claude Code with full pipeline
Write-Host "Launching Claude Code build..." -ForegroundColor Yellow
$prompt = @"
You are the AI Agency lead operator. Read these files in order:
1. CLAUDE.md (master instructions)
2. $Brief (project brief)
3. agents/architect.md, agents/designer.md, agents/animator.md, agents/content.md

Execute the full build pipeline:
Step 1: ARCHITECT - Build HTML structure in $outputDir/index.html
Step 2: DESIGNER + ANIMATOR + CONTENT - Run in parallel, inject into the HTML
Step 3: Validate - Ensure no placeholders remain, all sections complete

Output the final site to $outputDir/index.html as a single self-contained HTML file.
Do NOT leave any {{PLACEHOLDER}} text. Replace all with real content from the brief.
"@
claude --print $prompt

Write-Host ""
Write-Host "=== Build Complete ===" -ForegroundColor Cyan
Write-Host "Output:  $indexPath"
Write-Host "Preview: Start-Process $indexPath"
Write-Host "Deploy:  cd $outputDir; vercel --prod --yes"