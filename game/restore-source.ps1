# Restore source index.html after deployment
# This ensures future builds will work correctly

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$gameDir = Join-Path $scriptDir "..\game"
$sourceIndexPath = Join-Path $gameDir "index.html"
$backupPath = Join-Path $gameDir "index.html.source"

if (Test-Path $backupPath) {
    Copy-Item $backupPath $sourceIndexPath -Force
    Write-Host "Source index.html restored from backup!" -ForegroundColor Green
    Write-Host "You can now run 'npm run build' successfully." -ForegroundColor Cyan
} else {
    # Create source index.html manually
    $sourceContent = @"
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/icon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <title>Beer Pong Heardle - UWTBOG</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
"@
    Set-Content -Path $sourceIndexPath -Value $sourceContent
    Write-Host "Source index.html created!" -ForegroundColor Green
}


