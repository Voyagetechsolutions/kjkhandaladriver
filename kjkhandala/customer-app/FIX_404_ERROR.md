# Fix: Development Server 404 Error

## Error Message
```
The development server returned response error code: 404
Unable to resolve module ./node_modules/expo/AppEntry
```

## Root Cause
Metro bundler cache corruption or node_modules inconsistency.

---

## ✅ SOLUTION: Complete Clean Reinstall

### Step 1: Delete Everything
```powershell
# Stop Metro
# Press Ctrl+C in the terminal

# Delete cache and modules
Remove-Item -Recurse -Force .expo
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# Clear npm cache
npm cache clean --force
```

### Step 2: Reinstall
```powershell
npm install
```

### Step 3: Start Fresh
```powershell
npx expo start --clear
```

---

## 🚀 Quick Fix Script

Run this PowerShell script:

```powershell
.\NUCLEAR_FIX.ps1
```

Or manually:

```powershell
# One-liner
Remove-Item -Recurse -Force .expo,node_modules,package-lock.json; npm cache clean --force; npm install; npx expo start --clear
```

---

## ⚠️ If Still Not Working

### Option 1: Check Expo Version
```powershell
npx expo-doctor
```

### Option 2: Reinstall Expo CLI
```powershell
npm install -g expo-cli
npx expo start --clear
```

### Option 3: Check Node Version
```powershell
node --version  # Should be 18.x or 20.x
```

If using wrong Node version:
- Install Node 20.x from https://nodejs.org
- Restart terminal
- Run `npm install` again

---

## 🔍 Why This Happens

1. **Metro Cache Corruption** - Metro bundler cached wrong paths
2. **node_modules Inconsistency** - Packages updated but cache not cleared
3. **Package Version Mismatch** - Expo packages out of sync

---

## ✅ Prevention

Always use `--clear` flag when:
- Updating packages
- Changing environment variables
- After git pull
- When seeing weird errors

```powershell
npx expo start --clear
```

---

## 📱 After Fix

The app should start and you'll see:
```
Starting Metro Bundler
Android Bundled ✓
```

Then press:
- **`a`** - Android
- **`i`** - iOS
- **`w`** - Web

---

**This fix resolves 99% of Metro bundler issues!** 🎯
