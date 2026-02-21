# Driver App Environment Setup Script

Write-Host "🚗 Setting up Driver App Environment..." -ForegroundColor Cyan

# Create .env file with correct credentials
$envContent = @"
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://dglzvzdyfnakfxymgnea.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnbHp2emR5Zm5ha2Z4eW1nbmVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNzczNzAsImV4cCI6MjA3ODY1MzM3MH0.-LJB1n1dZAnIuDMwX2a9D7jCC7F_IN_FxRKbbSmMBls

# Google Maps API Key (for navigation)
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyDiz14fs8GUZVcDrF9er96ZAwrFKDXlobQ
"@

# Write .env file
$envContent | Out-File -FilePath ".env" -Encoding UTF8 -NoNewline

Write-Host "✅ .env file created successfully!" -ForegroundColor Green

# Check if node_modules exists
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host "✅ Dependencies installed!" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies already installed!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Driver App environment is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run: npm start" -ForegroundColor White
Write-Host "2. Press 'a' for Android or 'i' for iOS" -ForegroundColor White
Write-Host "3. Or scan the QR code with Expo Go app" -ForegroundColor White
Write-Host ""
