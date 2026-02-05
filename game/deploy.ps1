# Deployment script for production
# This script copies built files from dist/ to the game/ directory for deployment
# NOTE: Source index.html must reference /src/main.jsx for builds to work!

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir
$deployPath = $scriptDir
$distPath = Join-Path $scriptDir "dist"

Write-Host "Copying built files to deployment directory..." -ForegroundColor Cyan
Write-Host "From: $distPath" -ForegroundColor Gray
Write-Host "To:   $deployPath" -ForegroundColor Gray
Write-Host ""

# Ensure source index.html is restored for next build (postbuild does this, but be safe)
$sourceIndexPath = Join-Path $deployPath "index.html"
$backupPath = Join-Path $deployPath "index.html.source"
if (Test-Path $backupPath) {
    $content = Get-Content $sourceIndexPath -Raw -ErrorAction SilentlyContinue
    if ($content -and $content -match "/src/main.jsx") {
        Copy-Item $sourceIndexPath $backupPath -Force -ErrorAction SilentlyContinue
        Write-Host "Backed up source index.html" -ForegroundColor Gray
    }
}

# Remove old built files (but keep source files like src/, public/, etc.)
if (Test-Path (Join-Path $deployPath "assets")) {
    Remove-Item (Join-Path $deployPath "assets") -Recurse -Force
    Write-Host "Removed old assets/" -ForegroundColor Gray
}
if (Test-Path (Join-Path $deployPath "songs")) {
    Remove-Item (Join-Path $deployPath "songs") -Recurse -Force
    Write-Host "Removed old songs/" -ForegroundColor Gray
}
if (Test-Path (Join-Path $deployPath "icon.png")) {
    Remove-Item (Join-Path $deployPath "icon.png") -Force
    Write-Host "Removed old icon.png" -ForegroundColor Gray
}

# Copy new built files
Write-Host ""
Write-Host "Copying built files..." -ForegroundColor Cyan
Copy-Item (Join-Path $distPath "assets") -Destination $deployPath -Recurse -Force
Write-Host "  Copied assets/" -ForegroundColor Green

if (Test-Path (Join-Path $distPath "songs")) {
    Copy-Item (Join-Path $distPath "songs") -Destination $deployPath -Recurse -Force
    Write-Host "  Copied songs/" -ForegroundColor Green
}

if (Test-Path (Join-Path $distPath "icon.png")) {
    Copy-Item (Join-Path $distPath "icon.png") -Destination $deployPath -Force
    Write-Host "  Copied icon.png" -ForegroundColor Green
}

# Copy built index.html (this is the production version with /game/assets/ references)
Copy-Item (Join-Path $distPath "index.html") -Destination $sourceIndexPath -Force
Write-Host "  Copied built index.html" -ForegroundColor Green

Write-Host ""
Write-Host "Deployment files ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  cd .." -ForegroundColor White
Write-Host "  git add game/" -ForegroundColor White
Write-Host "  git commit -m 'Deploy game updates'" -ForegroundColor White
Write-Host "  git push" -ForegroundColor White
Write-Host ""
Write-Host "NOTE: After deployment, restore source index.html for future builds!" -ForegroundColor Yellow
Write-Host "      The built index.html will be overwritten on next build." -ForegroundColor Yellow
