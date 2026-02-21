# 🚀 Customer App Implementation Guide

## Overview
This guide provides step-by-step instructions for implementing and deploying the Voyage Onboard Customer App.

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Database Setup](#database-setup)
4. [Backend Integration](#backend-integration)
5. [Payment Integration](#payment-integration)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Post-Launch](#post-launch)

---

## 1. Prerequisites

### Required Software
- **Node.js** 16.x or higher
- **npm** 8.x or higher
- **Expo CLI** `npm install -g expo-cli`
- **Git** for version control
- **Android Studio** (for Android development)
- **Xcode** (for iOS development - Mac only)

### Required Accounts
- **Expo Account** - https://expo.dev
- **Supabase Account** - https://supabase.com
- **Google Cloud Console** (for maps)
- **Firebase** (for notifications)
- **Payment Gateway Accounts**:
  - Orange Money Developer Account
  - Mascom MyZaka API Access
  - Capitec Pay Integration
  - Ozow Merchant Account

---

## 2. Project Setup

### Step 1: Clone and Install

```bash
# Navigate to project directory
cd customer-app

# Install dependencies
npm install

# Install additional dependencies
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install @supabase/supabase-js
npm install expo-location expo-notifications expo-barcode-scanner
npm install react-native-maps react-native-qrcode-svg
npm install date-fns axios react-query
```

### Step 2: Environment Configuration

Create `.env` file in the root directory:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Backend API
EXPO_PUBLIC_API_URL=https://your-backend-api.com/api

# Google Maps API
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key

# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your-firebase-key
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id

# Payment Gateway URLs
EXPO_PUBLIC_ORANGE_MONEY_API=https://api.orange.co.bw
EXPO_PUBLIC_MASCOM_API=https://api.mascom.bw
EXPO_PUBLIC_CAPITEC_API=https://api.capitecbank.co.za
EXPO_PUBLIC_OZOW_API=https://api.ozow.com

# App Configuration
EXPO_PUBLIC_APP_NAME=Voyage Onboard
EXPO_PUBLIC_APP_VERSION=1.0.0
```

### Step 3: Update app.json

```json
{
  "expo": {
    "name": "Voyage Onboard",
    "slug": "voyage-onboard",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#1e40af"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.voyagetech.onboard",
      "buildNumber": "1.0.0"
    },
    "android": {
      "package": "com.voyagetech.onboard",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#1e40af"
      },
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "CAMERA",
        "READ_CALENDAR",
        "WRITE_CALENDAR"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

---

## 3. Database Setup

### Step 1: Run Supabase Migrations

Execute these SQL scripts in your Supabase SQL Editor:

1. **Core Tables** - Run `COMPLETE_01_core_tables.sql`
2. **Operations** - Run `COMPLETE_02_operations_tables.sql`
3. **Finance** - Run `COMPLETE_03_finance_tables.sql`
4. **HR** - Run `COMPLETE_04_hr_tables.sql`
5. **Maintenance** - Run `COMPLETE_05_maintenance_tables.sql`
6. **RLS Policies** - Run `COMPLETE_06_rls_policies.sql`
7. **Functions & Views** - Run `COMPLETE_07_functions_views.sql`
8. **Triggers** - Run `COMPLETE_08_triggers.sql`
9. **Ticketing** - Run `COMPLETE_09_ticketing_dashboard.sql`

### Step 2: Create Customer-Specific Tables

```sql
-- Promotions table
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

-- Refunds table
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

-- Saved passengers
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
CREATE POLICY "Promotions are viewable by everyone"
  ON promotions FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can view their own refunds"
  ON refunds FOR SELECT
  USING (booking_id IN (
    SELECT id FROM bookings WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their saved passengers"
  ON saved_passengers FOR ALL
  USING (user_id = auth.uid());
```

### Step 3: Seed Sample Data

```sql
-- Insert sample cities
INSERT INTO cities (name, country, timezone) VALUES
  ('Gaborone', 'Botswana', 'Africa/Gaborone'),
  ('Francistown', 'Botswana', 'Africa/Gaborone'),
  ('Maun', 'Botswana', 'Africa/Gaborone'),
  ('Johannesburg', 'South Africa', 'Africa/Johannesburg'),
  ('Cape Town', 'South Africa', 'Africa/Johannesburg');

-- Insert sample promotion
INSERT INTO promotions (code, description, discount_type, discount_value, max_discount, valid_from, valid_until, status)
VALUES ('WELCOME10', 'Welcome discount - 10% off', 'percentage', 10, 100, NOW(), NOW() + INTERVAL '30 days', 'active');
```

---

## 4. Backend Integration

### Step 1: Payment Gateway Setup

#### Orange Money Integration

Create `backend/src/services/payments/orangeMoney.js`:

```javascript
const axios = require('axios');

class OrangeMoneyService {
  constructor() {
    this.apiUrl = process.env.ORANGE_MONEY_API;
    this.merchantId = process.env.ORANGE_MERCHANT_ID;
    this.apiKey = process.env.ORANGE_API_KEY;
  }

  async initiatePayment(phoneNumber, amount, reference) {
    try {
      const response = await axios.post(`${this.apiUrl}/payment/init`, {
        merchant_id: this.merchantId,
        phone_number: phoneNumber,
        amount: amount,
        reference: reference,
        callback_url: `${process.env.API_URL}/payments/orange-callback`,
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return {
        success: true,
        transactionId: response.data.transaction_id,
        status: response.data.status,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async verifyPayment(transactionId) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/payment/status/${transactionId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      return {
        success: true,
        status: response.data.status,
        amount: response.data.amount,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new OrangeMoneyService();
```

#### Create Payment Routes

Create `backend/src/routes/payments.js`:

```javascript
const express = require('express');
const router = express.Router();
const orangeMoney = require('../services/payments/orangeMoney');
const mascomMyZaka = require('../services/payments/mascomMyZaka');
const capitecPay = require('../services/payments/capitecPay');
const ozow = require('../services/payments/ozow');
const { supabase } = require('../config/supabase');

// Orange Money
router.post('/orange-money', async (req, res) => {
  try {
    const { paymentId, phoneNumber, amount } = req.body;

    const result = await orangeMoney.initiatePayment(
      phoneNumber,
      amount,
      paymentId
    );

    if (result.success) {
      // Update payment record
      await supabase
        .from('payments')
        .update({
          status: 'processing',
          transaction_reference: result.transactionId,
        })
        .eq('id', paymentId);

      res.json({
        success: true,
        transactionId: result.transactionId,
        message: 'Payment initiated. Please check your phone.',
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Orange Money Callback
router.post('/orange-callback', async (req, res) => {
  try {
    const { transaction_id, status, amount } = req.body;

    // Find payment by transaction reference
    const { data: payment } = await supabase
      .from('payments')
      .select('*, booking:bookings(*)')
      .eq('transaction_reference', transaction_id)
      .single();

    if (status === 'SUCCESS') {
      // Update payment
      await supabase
        .from('payments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', payment.id);

      // Update booking
      await supabase
        .from('bookings')
        .update({
          status: 'confirmed',
          payment_status: 'completed',
        })
        .eq('id', payment.booking_id);

      // Send confirmation notification
      await supabase
        .from('notifications')
        .insert({
          user_id: payment.booking.user_id,
          title: 'Payment Successful',
          message: 'Your booking has been confirmed!',
          type: 'payment_success',
        });
    } else {
      // Update payment as failed
      await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('id', payment.id);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Similar routes for other payment methods...

module.exports = router;
```

### Step 2: Add Routes to Server

Update `backend/src/server.js`:

```javascript
const paymentRoutes = require('./routes/payments');
app.use('/api/payments', paymentRoutes);
```

---

## 5. Payment Integration

### Botswana Payment Providers

#### 1. Orange Money
- **Website**: https://www.orange.co.bw/en/orange-money
- **API Docs**: Contact Orange Business Services
- **Test Credentials**: Request from Orange
- **Integration Time**: 2-3 weeks

#### 2. Mascom MyZaka
- **Website**: https://www.mascom.bw/myzaka
- **API Access**: Contact Mascom Business
- **Integration Time**: 2-3 weeks

#### 3. Smega Wallet
- **Website**: https://smega.bw
- **API Access**: Contact Smega support
- **Integration Time**: 1-2 weeks

### South Africa Payment Providers

#### 1. Capitec Pay
- **Website**: https://www.capitecbank.co.za/business/transact/capitec-pay
- **API Docs**: https://developer.capitecbank.co.za
- **Integration Time**: 2-4 weeks

#### 2. Ozow
- **Website**: https://ozow.com
- **API Docs**: https://docs.ozow.com
- **Sandbox**: Available
- **Integration Time**: 1-2 weeks

#### 3. Card Payments (Visa/Mastercard)
- Use **PayGate** or **Peach Payments**
- PCI-DSS compliance required
- Integration Time: 3-4 weeks

---

## 6. Testing

### Unit Tests

```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react-native

# Run tests
npm test
```

### Integration Tests

```bash
# Install Detox for E2E testing
npm install --save-dev detox

# Run E2E tests
detox test
```

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Trip search and filtering
- [ ] Seat selection (all scenarios)
- [ ] Passenger details form validation
- [ ] Payment flow (all methods)
- [ ] Booking confirmation
- [ ] My Trips view
- [ ] Live tracking
- [ ] QR code generation and scanning
- [ ] Refund request
- [ ] Reschedule booking
- [ ] Notifications
- [ ] Profile management
- [ ] Support chat

---

## 7. Deployment

### Step 1: Build for Production

#### Android APK

```bash
# Build APK
expo build:android -t apk

# Build AAB (for Play Store)
expo build:android -t app-bundle
```

#### iOS IPA

```bash
# Build for App Store
expo build:ios -t archive

# Build for testing
expo build:ios -t simulator
```

### Step 2: App Store Submission

#### Google Play Store

1. Create developer account ($25 one-time fee)
2. Create app listing
3. Upload APK/AAB
4. Fill in store listing details
5. Set pricing and distribution
6. Submit for review

#### Apple App Store

1. Create Apple Developer account ($99/year)
2. Create app in App Store Connect
3. Upload IPA via Xcode or Transporter
4. Fill in app information
5. Submit for review

### Step 3: Web Deployment

```bash
# Build for web
expo build:web

# Deploy to hosting (e.g., Netlify, Vercel)
npm run deploy
```

---

## 8. Post-Launch

### Monitoring

1. **Analytics**
   - Install Google Analytics or Mixpanel
   - Track user flows
   - Monitor conversion rates

2. **Crash Reporting**
   - Integrate Sentry or Bugsnag
   - Monitor error rates
   - Set up alerts

3. **Performance Monitoring**
   - Use Firebase Performance
   - Track app startup time
   - Monitor API response times

### Maintenance

1. **Regular Updates**
   - Weekly bug fixes
   - Monthly feature updates
   - Quarterly major releases

2. **User Feedback**
   - In-app feedback form
   - App store reviews monitoring
   - Support ticket system

3. **Security**
   - Regular dependency updates
   - Security audits
   - Penetration testing

### Marketing

1. **Launch Campaign**
   - Social media promotion
   - Email marketing
   - In-station advertising

2. **User Acquisition**
   - Referral program
   - First-time user discounts
   - Partnership promotions

3. **Retention**
   - Push notifications
   - Loyalty program
   - Regular promotions

---

## 📞 Support

For implementation support:
- **Email**: dev@voyagetech.com
- **Slack**: #customer-app-dev
- **Documentation**: https://docs.voyagetech.com

---

## 🎯 Success Metrics

Track these KPIs:
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Booking conversion rate
- Average booking value
- User retention rate
- App crash rate
- API response time
- Payment success rate
- Customer satisfaction score

---

**Last Updated**: November 2024
**Version**: 1.0.0
