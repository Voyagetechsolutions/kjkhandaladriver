# Quick Fix: "runtime not ready: TypeError: cannot convert undefined value to object"

## Problem
The app is trying to access environment variables that don't exist yet.

## Solution (3 Steps)

### Step 1: Create `.env` file
Create a file named `.env` in the `customer-app` folder with this content:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 2: Get Your Supabase Credentials

1. Go to https://supabase.com/dashboard
2. Click on your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### Step 3: Update `.env` and Restart

1. Paste your credentials into `.env`
2. Stop the dev server (Ctrl+C)
3. Restart with cache clear:
   ```bash
   npx expo start -c
   ```

## Example `.env` File

```env
EXPO_PUBLIC_SUPABASE_URL=https://abcdefghij.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWoiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMDAwMDAwMCwiZXhwIjoxOTQ1NTc2MDAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Still Not Working?

Make sure:
- ✅ File is named exactly `.env` (not `.env.txt`)
- ✅ File is in the `customer-app` folder (not root)
- ✅ No spaces around the `=` sign
- ✅ No quotes around the values
- ✅ Server was restarted with `-c` flag

## Need the Database?

Also run these SQL scripts in Supabase SQL Editor:
1. `supabase/migrations/10_customer_app_features.sql`
2. `supabase/migrations/11_trip_ratings.sql`

---

**That's it!** The app should now work without errors.
