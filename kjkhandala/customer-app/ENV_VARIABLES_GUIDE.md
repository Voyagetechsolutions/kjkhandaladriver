# Environment Variables Guide

## ⚠️ IMPORTANT: Expo Requires EXPO_PUBLIC_ Prefix

For the **customer app** (React Native/Expo), all environment variables must start with `EXPO_PUBLIC_`.

---

## ✅ Correct Format for Customer App

Your `.env` or `.env.local` file should look like this:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://dglzvzdyfnakfxymgnea.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnbHp2emR5Zm5ha2Z4eW1nbmVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNzczNzAsImV4cCI6MjA3ODY1MzM3MH0.-LJB1n1dZAnIuDMwX2a9D7jCC7F_IN_FxRKbbSmMBls

# Google Maps API Key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyDiz14fs8GUZVcDrF9er96ZAwrFKDXlobQ
```

---

## ❌ Wrong Format (Backend Style)

These will NOT work in the customer app:

```env
# ❌ Missing EXPO_PUBLIC_ prefix
SUPABASE_URL=https://dglzvzdyfnakfxymgnea.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE=eyJhbGci...
```

---

## 📁 File Priority

Expo loads environment variables in this order:

1. `.env.local` (highest priority - use this for local development)
2. `.env` (fallback)

**Recommendation:** Use `.env.local` for your actual credentials and keep `.env.example` as a template.

---

## 🔄 How to Fix

### Option 1: Update .env.local (Recommended)

Edit your `.env.local` file to use the correct format:

```env
EXPO_PUBLIC_SUPABASE_URL=https://dglzvzdyfnakfxymgnea.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnbHp2emR5Zm5ha2Z4eW1nbmVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNzczNzAsImV4cCI6MjA3ODY1MzM3MH0.-LJB1n1dZAnIuDMwX2a9D7jCC7F_IN_FxRKbbSmMBls
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyDiz14fs8GUZVcDrF9er96ZAwrFKDXlobQ
```

### Option 2: Delete .env.local and use .env

The `.env` file already has the correct format. Just delete `.env.local`:

```bash
rm .env.local
```

---

## 🚀 After Fixing

1. **Restart the server:**
   ```bash
   npx expo start -c
   ```

2. **Verify it's working:**
   - No warnings about missing Supabase config
   - App loads without errors
   - Login/signup screens work

---

## 🔍 How to Check Current Variables

In your app code, you can check what's loaded:

```javascript
console.log('Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log('Has Anon Key:', !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
```

---

## 📝 Different Environments

### Customer App (React Native/Expo)
- Prefix: `EXPO_PUBLIC_`
- File: `customer-app/.env.local` or `customer-app/.env`

### Frontend (React/Vite)
- Prefix: `VITE_`
- File: `frontend/.env` or `frontend/.env.local`

### Backend (Node.js)
- No prefix needed
- File: `backend/.env`

---

## ✅ Quick Fix Command

Run this in PowerShell from the `customer-app` directory:

```powershell
# Delete .env.local if it has wrong format
Remove-Item .env.local -ErrorAction SilentlyContinue

# Restart with cache clear
npx expo start -c
```

The `.env` file already has the correct format, so this will work immediately!
