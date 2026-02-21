# Nuclear Fix - Complete Clean Reinstall
Write-Host "🧹 Starting complete clean reinstall..." -ForegroundColor Yellow

# Stop all Metro processes
Write-Host "Stopping Metro bundler..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Delete all cache directories
Write-Host "Deleting cache directories..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force android\.gradle -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force android\app\build -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
Remove-Item -Force yarn.lock -ErrorAction SilentlyContinue

# Clear npm cache
Write-Host "Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force

# Reinstall dependencies
Write-Host "Reinstalling dependencies..." -ForegroundColor Yellow
npm install

# Clear watchman (if installed)
Write-Host "Clearing watchman..." -ForegroundColor Yellow
watchman watch-del-all 2>$null

Write-Host "✅ Clean reinstall complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Now run: npx expo start --clear" -ForegroundColor Cyan
