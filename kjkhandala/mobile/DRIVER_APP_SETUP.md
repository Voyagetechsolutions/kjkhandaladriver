# 🚗 Driver App Setup Guide

## Overview
Setting up the Voyage Onboard Driver App using the existing mobile infrastructure with Expo Router.

---

## 📋 Prerequisites

- Node.js 18.x or 20.x
- Expo CLI (comes with the project)
- Android Studio (for Android) or Xcode (for iOS)
- Supabase account with the correct credentials

---

## 🔧 Step 1: Environment Setup

Create a `.env` file in the `mobile/` directory:

```bash
# Copy the example file
cp .env.example .env
```

Then update `.env` with the correct Supabase credentials:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://dglzvzdyfnakfxymgnea.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnbHp2emR5Zm5ha2Z4eW1nbmVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNzczNzAsImV4cCI6MjA3ODY1MzM3MH0.-LJB1n1dZAnIuDMwX2a9D7jCC7F_IN_FxRKbbSmMBls

# Google Maps API Key (for navigation)
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyDiz14fs8GUZVcDrF9er96ZAwrFKDXlobQ
```

---

## 📦 Step 2: Install Dependencies

```bash
cd mobile
npm install
```

---

## 🏗️ Step 3: Driver App Structure

The driver app will be built using Expo Router with the following structure:

```
mobile/
├── app/
│   ├── (driver)/          # Driver-specific routes
│   │   ├── _layout.tsx    # Driver layout with auth
│   │   ├── dashboard.tsx  # Driver dashboard
│   │   ├── trips.tsx      # Assigned trips
│   │   ├── current-trip.tsx # Active trip management
│   │   └── profile.tsx    # Driver profile
│   ├── (auth)/            # Authentication screens
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── _layout.tsx        # Root layout
├── lib/
│   ├── supabase.ts        # Supabase client
│   └── auth.tsx           # Auth context
└── .env                   # Environment variables
```

---

## 🎯 Step 4: Key Features to Implement

### 1. **Authentication**
- Driver login with email/password
- Role verification (must be 'driver')
- Session management

### 2. **Dashboard**
- Today's assigned trips
- Trip statistics
- Notifications

### 3. **Trip Management**
- View assigned trips
- Start trip
- Mark waypoints/stops
- Complete trip
- Report issues

### 4. **Live Tracking**
- Real-time location updates
- GPS tracking
- Route navigation

### 5. **Passenger Management**
- View passenger list
- Check-in passengers (QR code scan)
- Passenger count

### 6. **Trip Reports**
- Trip completion report
- Incident reporting
- Fuel/expense logging

---

## 🚀 Step 5: Run the App

### Development Mode:
```bash
npm start
```

### Android:
```bash
npm run android
```

### iOS:
```bash
npm run ios
```

---

## 📱 Step 6: Database Schema

The driver app uses these main tables:

### `drivers` table:
```sql
- id (uuid, FK to users)
- license_number (text)
- license_expiry (date)
- status (enum: active, inactive, suspended)
- rating (decimal)
```

### `trips` table:
```sql
- id (uuid)
- driver_id (uuid, FK to drivers)
- bus_id (uuid, FK to buses)
- route_id (uuid, FK to routes)
- scheduled_departure (timestamp)
- actual_departure (timestamp)
- actual_arrival (timestamp)
- status (enum: scheduled, in_progress, completed, cancelled)
```

### `trip_tracking` table (new):
```sql
- id (uuid)
- trip_id (uuid, FK to trips)
- latitude (decimal)
- longitude (decimal)
- speed (decimal)
- timestamp (timestamp)
```

### `trip_incidents` table (new):
```sql
- id (uuid)
- trip_id (uuid, FK to trips)
- driver_id (uuid, FK to drivers)
- incident_type (text)
- description (text)
- timestamp (timestamp)
```

---

## 🔐 Step 7: Required Permissions

Add to `app.json`:

```json
{
  "expo": {
    "android": {
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "CAMERA",
        "FOREGROUND_SERVICE"
      ]
    },
    "ios": {
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "We need your location to track the bus during trips.",
        "NSLocationAlwaysUsageDescription": "We need your location to track the bus even when the app is in the background.",
        "NSCameraUsageDescription": "We need camera access to scan passenger QR codes."
      }
    }
  }
}
```

---

## 📊 Step 8: Key APIs/Services

### Location Tracking Service:
```typescript
// lib/location-service.ts
import * as Location from 'expo-location';

export const startLocationTracking = async (tripId: string) => {
  // Request permissions
  // Start background location updates
  // Send updates to Supabase
};
```

### Trip Service:
```typescript
// lib/trip-service.ts
export const getAssignedTrips = async (driverId: string) => {
  // Fetch trips from Supabase
};

export const startTrip = async (tripId: string) => {
  // Update trip status to 'in_progress'
  // Record actual_departure time
};

export const completeTrip = async (tripId: string) => {
  // Update trip status to 'completed'
  // Record actual_arrival time
};
```

---

## 🎨 Step 9: UI Components

### Reusable Components:
- `TripCard` - Display trip information
- `PassengerList` - List of passengers
- `QRScanner` - Scan passenger tickets
- `MapView` - Show route and current location
- `StatusBadge` - Trip status indicator

---

## ✅ Step 10: Testing Checklist

- [ ] Driver can log in
- [ ] Dashboard shows assigned trips
- [ ] Driver can start a trip
- [ ] Location tracking works
- [ ] Driver can check in passengers
- [ ] Driver can complete a trip
- [ ] Trip reports are saved
- [ ] Offline mode works (cached data)

---

## 🔄 Next Steps

1. Create the basic app structure
2. Implement authentication
3. Build the dashboard
4. Add trip management
5. Implement location tracking
6. Add QR code scanning
7. Test on real devices
8. Deploy to app stores

---

## 📞 Support

For issues or questions:
- Check the main project README
- Review Supabase documentation
- Check Expo documentation

---

**Ready to build the driver app!** 🚀
