# Restart Expo with Clean Cache
Write-Host "🧹 Cleaning up..." -ForegroundColor Yellow

# Kill any running Metro bundler processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*expo*" } | Stop-Process -Force -ErrorAction SilentlyContinue

# Clear Expo cache
Write-Host "🗑️  Clearing Expo cache..." -ForegroundColor Yellow
npx expo start -c --clear

Write-Host "✅ Done! App should start without errors." -ForegroundColor Green
