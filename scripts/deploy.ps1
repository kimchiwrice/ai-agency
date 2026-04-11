# AI Agency — Deploy to Vercel (Windows/PowerShell)
# Usage: .\scripts\deploy.ps1 project-name

param([string]$Project)

if (-not $Project) {
    Write-Host "Usage: .\scripts\deploy.ps1 <project-name>"
    Write-Host "Example: .\scripts\deploy.ps1 trinh-media"
    exit 1
}

$outputDir = "output\$Project"
$indexPath = "$outputDir\index.html"

if (-not (Test-Path $indexPath)) {
    Write-Host "Error: No built site at $indexPath" -ForegroundColor Red
    Write-Host "Run build first: .\scripts\build-local.ps1 briefs\$Project.md"
    exit 1
}

# Validate first
Write-Host "Running validation..." -ForegroundColor Yellow
& .\scripts\validate.ps1 $indexPath
if ($LASTEXITCODE -ne 0) {
    Write-Host "Validation failed. Fix errors before deploying." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Deploying $Project to Vercel..." -ForegroundColor Cyan
Push-Location $outputDir
try {
    vercel --prod --yes
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "=== Deploy Complete ===" -ForegroundColor Green
        Write-Host "Project $Project is live!"
    } else {
        Write-Host "Deploy failed. Check Vercel output above." -ForegroundColor Red
    }
} finally {
    Pop-Location
}

# Git commit the output
Write-Host ""
Write-Host "Committing output to git..." -ForegroundColor Yellow
git add "output/$Project/"
git commit -m "Build: $Project — deployed to Vercel"
git push
Write-Host "Pushed to GitHub." -ForegroundColor Green