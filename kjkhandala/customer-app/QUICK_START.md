# 🚀 Customer App - Quick Start Guide

Get your Voyage Onboard Customer App up and running in minutes!

## 📋 Prerequisites

Before you begin, ensure you have:
- ✅ Node.js 16+ installed
- ✅ npm or yarn package manager
- ✅ Expo CLI (`npm install -g expo-cli`)
- ✅ Supabase project created
- ✅ Android Studio (for Android) or Xcode (for iOS)

## ⚡ Quick Setup (5 Minutes)

### Step 1: Install Dependencies

```bash
cd customer-app
npm install
```

### Step 2: Configure Environment

Create `.env` file in the root:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

### Step 3: Run the App

```bash
# Start Expo development server
npm start

# Or run directly on platform
npm run android  # For Android
npm run ios      # For iOS (Mac only)
npm run web      # For Web browser
```

### Step 4: Scan QR Code

- Open **Expo Go** app on your phone
- Scan the QR code from terminal
- App will load on your device!

## 📱 Testing on Physical Device

### Android
1. Install **Expo Go** from Play Store
2. Ensure phone and computer are on same WiFi
3. Scan QR code from Expo Dev Tools

### iOS
1. Install **Expo Go** from App Store
2. Ensure phone and computer are on same WiFi
3. Scan QR code from Camera app

## 🗄️ Database Setup (Required)

### Run SQL Scripts in Supabase

Execute these in order in your Supabase SQL Editor:

```sql
-- 1. Core tables (users, trips, bookings)
-- Run: supabase/COMPLETE_01_core_tables.sql

-- 2. Customer-specific tables
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2),
  max_discount DECIMAL(10, 2),
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id),
  amount DECIMAL(10, 2),
  reason TEXT,
  bank_details JSONB,
  status VARCHAR(20) DEFAULT 'pending',
  requested_at TIMESTAMP,
  approved_at TIMESTAMP,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE saved_passengers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  full_name VARCHAR(255),
  phone VARCHAR(20),
  id_number VARCHAR(50),
  gender VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_passengers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Promotions viewable by all"
  ON promotions FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users view own refunds"
  ON refunds FOR SELECT
  USING (booking_id IN (
    SELECT id FROM bookings WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users manage own passengers"
  ON saved_passengers FOR ALL
  USING (user_id = auth.uid());
```

### Seed Sample Data

```sql
-- Insert sample cities
INSERT INTO cities (name, country, timezone, latitude, longitude) VALUES
  ('Gaborone', 'Botswana', 'Africa/Gaborone', -24.6282, 25.9231),
  ('Francistown', 'Botswana', 'Africa/Gaborone', -21.1699, 27.5084),
  ('Maun', 'Botswana', 'Africa/Gaborone', -19.9833, 23.4167),
  ('Johannesburg', 'South Africa', 'Africa/Johannesburg', -26.2041, 28.0473),
  ('Cape Town', 'South Africa', 'Africa/Johannesburg', -33.9249, 18.4241);

-- Insert sample promotion
INSERT INTO promotions (code, description, discount_type, discount_value, max_discount, valid_from, valid_until, status)
VALUES ('WELCOME10', 'Welcome discount - 10% off first booking', 'percentage', 10, 100, NOW(), NOW() + INTERVAL '30 days', 'active');
```

## 🎨 Customization

### Update Branding

1. **App Icon**: Replace `assets/icon.png` (1024x1024px)
2. **Splash Screen**: Replace `assets/splash.png` (1242x2436px)
3. **Colors**: Edit `src/config/constants.js`

```javascript
export const COLORS = {
  primary: '#1e40af',      // Your brand color
  secondary: '#3b82f6',    // Secondary color
  // ... other colors
};
```

### Update App Name

Edit `app.json`:

```json
{
  "expo": {
    "name": "Your Company Name",
    "slug": "your-app-slug"
  }
}
```

## 🧪 Test Features

### 1. User Registration
- Open app → Sign Up
- Enter: name, email, phone, password
- Verify email (check Supabase Auth)

### 2. Trip Search
- Home → Search trips
- Select: Gaborone → Francistown
- Choose date and passengers
- View results

### 3. Booking Flow
- Select trip → Choose seats
- Fill passenger details
- Select payment method
- Complete booking

### 4. My Trips
- View upcoming/past trips
- Check-in online
- Track bus live
- Download ticket

## 🔧 Troubleshooting

### App Won't Start
```bash
# Clear cache
expo start -c

# Reinstall dependencies
rm -rf node_modules
npm install
```

### Can't Connect to Backend
- Check `.env` file has correct URLs
- Ensure backend server is running
- Verify Supabase project is active

### QR Code Not Scanning
- Ensure Expo Go is updated
- Check WiFi connection
- Try manual connection in Expo Go

### Map Not Loading
- Add Google Maps API key
- Enable Maps SDK in Google Cloud Console
- Update `app.json` with API key

## 📚 Key Files to Know

```
customer-app/
├── App.js                          # App entry point
├── src/
│   ├── screens/
│   │   ├── HomeScreen.js          # Main home screen
│   │   ├── SearchResultsScreen.js # Trip search results
│   │   ├── SeatSelectionScreen.js # Seat picker
│   │   ├── MyTripsScreen.js       # User bookings
│   │   └── LiveTrackingScreen.js  # GPS tracking
│   ├── services/
│   │   ├── tripService.js         # Trip API calls
│   │   ├── bookingService.js      # Booking operations
│   │   └── paymentService.js      # Payment processing
│   ├── contexts/
│   │   └── AuthContext.js         # Authentication
│   └── config/
│       ├── supabase.js            # Supabase client
│       └── constants.js           # App constants
```

## 🎯 Next Steps

### For Development
1. ✅ Complete database setup
2. ✅ Test all features
3. ✅ Customize branding
4. ✅ Configure payment gateways
5. ✅ Set up push notifications

### For Production
1. 📱 Build APK/IPA
2. 🏪 Submit to app stores
3. 📊 Set up analytics
4. 🔔 Configure notifications
5. 💳 Enable live payments

## 🆘 Need Help?

### Documentation
- 📖 Full README: `README.md`
- 🛠️ Implementation Guide: `IMPLEMENTATION_GUIDE.md`
- 📋 Feature List: See README.md

### Support Channels
- 📧 Email: dev@voyagetech.com
- 💬 Slack: #customer-app-support
- 📚 Docs: https://docs.voyagetech.com

### Common Issues
- **Expo Go not connecting**: Restart Expo server
- **Database errors**: Check RLS policies
- **Payment failing**: Verify API keys
- **Maps not working**: Add Google Maps key

## 🎉 You're Ready!

Your Customer App is now set up and ready for development. Start by:

1. Testing the booking flow
2. Customizing the UI
3. Integrating payment gateways
4. Setting up notifications

**Happy coding! 🚀**

---

**Quick Commands Reference:**

```bash
npm start              # Start development server
npm run android        # Run on Android
npm run ios           # Run on iOS
npm run web           # Run in browser
npm test              # Run tests
expo build:android    # Build Android APK
expo build:ios        # Build iOS IPA
```

---

**Version**: 1.0.0  
**Last Updated**: November 2024
