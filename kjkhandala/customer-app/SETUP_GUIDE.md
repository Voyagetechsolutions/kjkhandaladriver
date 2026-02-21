# Customer App Setup Guide

## Error: "runtime not ready: TypeError: cannot convert undefined value to object"

This error occurs when environment variables are not configured. Follow these steps to fix it:

---

## 1. Create `.env` File

Create a `.env` file in the `customer-app` directory:

```bash
# Copy the example file
cp .env.example .env
```

Or create it manually with this content:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# API Configuration (optional)
EXPO_PUBLIC_API_URL=http://localhost:5000/api

# Google Maps API Key (for live tracking)
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

---

## 2. Get Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

---

## 3. Update `.env` File

Replace the placeholder values with your actual Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 4. Restart the Development Server

After creating/updating the `.env` file:

```bash
# Stop the current server (Ctrl+C)

# Clear cache and restart
npx expo start -c
```

---

## 5. Run Database Migrations

Before using the app, run the database migrations:

1. Open Supabase SQL Editor
2. Run these migrations in order:
   - `supabase/migrations/10_customer_app_features.sql`
   - `supabase/migrations/11_trip_ratings.sql`

---

## 6. Verify Setup

After restarting, check the console for:
- ✅ No warnings about missing Supabase configuration
- ✅ App loads without errors
- ✅ Login/signup screens appear

---

## Common Issues

### Issue: "Invalid API key"
**Solution:** Double-check your `EXPO_PUBLIC_SUPABASE_ANON_KEY` is correct

### Issue: "Network request failed"
**Solution:** Verify your `EXPO_PUBLIC_SUPABASE_URL` is correct and accessible

### Issue: Changes not reflecting
**Solution:** Clear cache with `npx expo start -c`

### Issue: AsyncStorage errors
**Solution:** Install AsyncStorage:
```bash
npx expo install @react-native-async-storage/async-storage
```

---

## Additional Configuration (Optional)

### Google Maps API Key (for Live Tracking)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Maps SDK for Android** and **Maps SDK for iOS**
3. Create an API key
4. Add to `.env`:
   ```env
   EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

---

## Testing the App

Once configured, test these features:

1. **Authentication**
   - Sign up with email/password
   - Login
   - Sign out

2. **Trip Search**
   - Search for trips
   - View results
   - Select seats

3. **Booking**
   - Complete a booking
   - View in My Trips

4. **Profile Settings**
   - Edit personal information
   - Add saved passengers
   - Add payment methods
   - Save favorite routes

5. **Trip Management**
   - Check-in online
   - Track bus
   - Rate completed trips
   - Cancel booking

---

## Need Help?

If you're still experiencing issues:

1. Check the console for specific error messages
2. Verify all environment variables are set correctly
3. Ensure database migrations have been run
4. Try clearing cache: `npx expo start -c`
5. Reinstall dependencies: `npm install` or `yarn install`

---

## Production Deployment

Before deploying to production:

1. ✅ Set up production Supabase project
2. ✅ Update `.env` with production credentials
3. ✅ Run all database migrations
4. ✅ Test all features thoroughly
5. ✅ Configure payment gateways
6. ✅ Set up push notifications
7. ✅ Build APK/IPA files

---

**Last Updated:** November 2025
