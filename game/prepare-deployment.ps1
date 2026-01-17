# Prepare deployment: Build and prepare files for commit to main branch
# This script builds, saves built files, and restores source for future builds

Write-Host "Building game..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Build successful!" -ForegroundColor Green
Write-Host ""

# Save built index.html with a different name for commit
Copy-Item "dist\index.html" "index.html.built" -Force
Write-Host "Saved built index.html as index.html.built" -ForegroundColor Green

# Restore source index.html so future builds work
Copy-Item "index.html.source" "index.html" -Force
Write-Host "Restored source index.html for future builds" -ForegroundColor Green

Write-Host ""
Write-Host "Ready for commit! Built files to commit:" -ForegroundColor Cyan
Write-Host "  - game/assets/ (built JS and CSS)" -ForegroundColor White
Write-Host "  - game/songs/ (if exists)" -ForegroundColor White
Write-Host "  - game/icon.png (if exists)" -ForegroundColor White
Write-Host "  - game/index.html.built (rename to index.html after commit)" -ForegroundColor White
Write-Host ""
Write-Host "After committing index.html.built, you'll need to:" -ForegroundColor Yellow
Write-Host "  1. Commit index.html.built" -ForegroundColor White
Write-Host "  2. After push, rename it to index.html in GitHub web UI or next commit" -ForegroundColor White
Write-Host "  OR: git mv game/index.html.built game/index.html && git commit -m 'Use built index.html'" -ForegroundColor White


