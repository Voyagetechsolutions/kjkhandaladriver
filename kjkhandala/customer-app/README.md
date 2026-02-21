# 🚍 Voyage Onboard - Customer App

A comprehensive, production-ready customer mobile application for bus booking and travel management. Built with React Native & Expo for Android, iOS, and Web.

## ✨ Complete Feature List

### 🏠 1. Home Screen
- **Quick Trip Search** - Origin, destination, date, and passenger selection
- **Recently Searched Routes** - Quick access to previous searches
- **My Trips Button** - Fast navigation to bookings
- **Promotions Banner** - Active discounts and offers
- **Announcements** - Delays, road closures, weather alerts
- **Emergency Contacts** - Quick access to support
- **Popular Routes** - Frequently traveled routes with pricing

### 🔍 2. Trip Search & Results
- **Advanced Search**
  - Select origin and destination cities
  - Choose travel date (with return date option)
  - Number of passengers (1-10)
  - Apply promo codes
  
- **Search Results Display**
  - Bus company logo
  - Departure/arrival times with duration
  - Bus type (luxury, semi-luxury, sprinter)
  - Seat configuration (2x2, 2x1)
  - Real-time pricing
  - Available seats count
  - Trip ratings (⭐)
  - Amenities icons (WiFi, charging, AC, movies, tracking)
  
- **Sort & Filter**
  - Sort by time, price, or rating
  - Filter by bus type
  - Filter by amenities

### 💺 3. Seat Selection
- **Interactive Seat Map**
  - Real bus seat layout from database
  - Color-coded seats:
    - 🟢 Available seats
    - 🔵 Selected seats
    - ⚫ Booked seats
    - 🟡 VIP seats (premium pricing)
  - Seat numbers displayed
  - Aisle spacing
  - Driver and toilet sections shown
  
- **Smart Selection**
  - Multi-seat selection for groups
  - VIP seat premium (+BWP 50)
  - Real-time availability updates
  - Seat selection validation

### 👥 4. Passenger Details
- **Per-Seat Information**
  - Full name
  - Phone number
  - ID/Passport number
  - Gender selection
  - Next of kin (optional)
  
- **Additional Options**
  - Luggage selection with pricing
  - Infant addition (free or small fee)
  - Special requirements notes
  - Saved passenger profiles (frequent travelers)

### 💳 5. Multi-Payment Integration

#### Botswana Payment Methods
- **Orange Money** - Mobile money integration
- **Mascom MyZaka** - Mobile wallet
- **Smega Wallet** - Digital wallet
- **Bank Transfer** - Direct bank payment
- **Visa/Mastercard** - Card payments
- **Cash at Station** - Generate reservation code

#### South Africa Payment Methods
- **Capitec Pay** - Instant bank payment
- **Ozow** - EFT payment gateway
- **EFT** - Electronic funds transfer
- **Card Payment** - Visa/Mastercard
- **Cash at Station** - Pay on arrival

#### Payment Features
- **Secure Payment Processing**
- **10-Minute Timer** - Complete payment within time limit
- **Fare Breakdown Display**
  - Base fare
  - Luggage fees
  - VIP seat charges
  - Discount/voucher deductions
  - Total payable
- **Payment Confirmation**
- **Transaction Reference**
- **Receipt Generation**

### 📋 6. Booking Summary
- **Ticket Information**
  - Unique ticket number
  - Booking reference code
  - Passenger names and seats
  - Complete trip details
  - QR code for each passenger
  
- **Actions**
  - Download ticket as PDF
  - Add to Google/Apple Calendar
  - Share ticket via WhatsApp, Email, SMS
  - Print ticket

### 🎫 7. My Trips Management
- **Upcoming Trips**
  - Trip countdown timer
  - Departure reminders
  - Check-in status
  - Live tracking button
  
- **Past Trips**
  - Trip history
  - Rate completed trips
  - Download receipts
  
- **Trip Actions**
  - Cancel booking
  - Request refund
  - Reschedule trip
  - Download ticket
  - Track bus live
  - Online check-in
  - View seat number
  - Add luggage
  - Contact driver

### 📍 8. Live Bus Tracking
- **Real-Time GPS Tracking**
  - Live bus location on map
  - Current speed
  - ETA at pickup point
  - Distance remaining
  - Next station info
  
- **Trip Status**
  - On-time/Delayed indicator
  - Driver name and photo
  - Bus registration number
  - Current location address
  
- **Notifications**
  - Bus approaching pickup point
  - Departure alerts
  - Delay notifications

### 📱 9. QR Code Check-In
- **Digital Ticket**
  - Unique QR code per passenger
  - Ticket validation
  - Boarding pass display
  
- **Check-In Methods**
  - Scan at station terminal
  - Scan on bus (driver device)
  - Manual check-in by staff
  
- **System Updates**
  - Real-time manifest update
  - "Boarded" status
  - Seat confirmation
  - Notification to passenger

### 💰 10. Refund & Reschedule

#### Refund System
- **Request Process**
  - Select booking
  - Choose refund reason
  - Provide bank details
  
- **Refund Policy**
  - 48+ hours: 90% refund
  - 24-48 hours: 70% refund
  - 12-24 hours: 50% refund
  - 6-12 hours: 30% refund
  - <6 hours: No refund
  
- **Approval Workflow**
  - Finance team review
  - Status notifications
  - Refund processing (3-5 days)

#### Reschedule System
- **Change Options**
  - Change trip date
  - Change trip time
  - Change route (optional)
  
- **Fare Adjustment**
  - Calculate fare difference
  - Pay additional amount if higher
  - Receive credit if lower
  - No-fee rescheduling (24+ hours)

### 👤 11. Customer Profile
- **Personal Information**
  - Full name
  - Phone & email
  - ID/Passport number
  - Profile photo
  
- **Saved Data**
  - Frequent passengers list
  - Saved payment methods
  - Favorite routes
  - Recent searches
  
- **Preferences**
  - Language selection (English, Setswana, Afrikaans)
  - Notification settings
  - Currency preference (BWP/ZAR/USD)
  - Seat preferences

### 🔔 12. Notifications System

#### Push Notifications
- Booking confirmation
- Payment success/failure
- Refund status updates
- Trip reminders (3 hrs, 1 hr before)
- Departure changes/cancellations
- Bus arrival at pickup point
- Promotional discounts
- Lost & found alerts
- Delays or emergencies

#### In-App Notifications
- Real-time updates
- Notification history
- Mark as read/unread
- Notification preferences

### 🎁 13. Promotions & Discounts
- **Active Promotions**
  - Discount codes
  - Seasonal sales
  - First-time user offers
  - Referral rewards
  
- **Loyalty Program**
  - Points per trip
  - Tier-based benefits
  - Birthday discounts
  - Milestone rewards
  
- **Vouchers**
  - Gift vouchers
  - Corporate vouchers
  - Promo code validation
  - Auto-apply best discount

### 💬 14. Support & Help Centre
- **Contact Options**
  - WhatsApp support (instant chat)
  - Call center button
  - Email support
  - In-app chat
  
- **Help Resources**
  - Frequently Asked Questions
  - Terms & Conditions
  - Travel rules & regulations
  - Refund policy
  - Luggage rules
  - Safety guidelines
  - How-to videos
  
- **Feedback**
  - Rate your experience
  - Submit complaints
  - Suggestions box
  - Lost & found reporting

### 🎬 15. Onboard Entertainment
- **Local Media Server**
  - Auto-detect bus WiFi
  - No data charges
  - Offline streaming
  
- **Content Library**
  - Movies collection
  - Music playlist
  - Podcasts
  - Audiobooks
  
- **Trip Information**
  - Real-time trip progress
  - Next stop announcements
  - Estimated arrival time
  - Points of interest

## 🌟 Premium Features

### ⭐ Real-Time Chat
- Live chat with support team
- Chatbot for common queries
- File sharing (tickets, receipts)
- Chat history

### ⭐ Multi-Currency Support
- Botswana Pula (BWP)
- South African Rand (ZAR)
- US Dollar (USD)
- Auto currency conversion
- Display prices in preferred currency

### ⭐ In-App Wallet
- Store credit/vouchers
- Quick payments
- Transaction history
- Top-up options
- Wallet balance

### ⭐ Loyalty Program
- Points per trip
- Tier levels (Bronze, Silver, Gold, Platinum)
- Exclusive benefits
- Priority boarding
- Lounge access

### ⭐ Family/Group Profiles
- Add family members
- Group booking discounts
- Shared payment methods
- Group trip management

### ⭐ Interactive Pickup Map
- Map view of pickup points
- Directions to station
- Nearby amenities
- Parking information
- Station photos

### ⭐ Price Calendar
- View prices across dates
- Find cheapest days
- Peak/off-peak pricing
- Advance booking discounts

## 🛠 Technical Stack

### Frontend
- **React Native** - Cross-platform mobile framework
- **Expo** - Development and build platform
- **React Navigation** - Navigation library
- **React Query** - Data fetching and caching
- **Axios** - HTTP client

### Backend Integration
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication
  - Storage
  - Row Level Security (RLS)

### Maps & Location
- **React Native Maps** - Map display
- **Expo Location** - GPS tracking
- **Geolocation API** - Location services

### Notifications
- **Expo Notifications** - Push notifications
- **Firebase Cloud Messaging** - Message delivery

### Payments
- **Payment Gateway Integration**
  - Orange Money API
  - Mascom MyZaka API
  - Capitec Pay API
  - Ozow API
  - Card payment processors

### QR Code
- **React Native QR Code SVG** - QR generation
- **Expo Barcode Scanner** - QR scanning

### Other Libraries
- **Date-fns** - Date manipulation
- **React Native SVG** - Vector graphics
- **Async Storage** - Local data storage
- **React Native WebView** - In-app browser

## 📱 Platform Support

- ✅ **Android** - Android 5.0+ (API 21+)
- ✅ **iOS** - iOS 13.0+
- ✅ **Web** - Modern browsers (PWA support)

## 🚀 Getting Started

### Prerequisites
```bash
node >= 16.x
npm >= 8.x
expo-cli
```

### Installation

1. **Install Dependencies**
```bash
cd customer-app
npm install
```

2. **Configure Environment**
Create `.env` file:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_API_URL=your_backend_api_url
```

3. **Start Development Server**
```bash
# Start Expo
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

### Build for Production

#### Android APK
```bash
expo build:android
```

#### iOS IPA
```bash
expo build:ios
```

#### Web Build
```bash
expo build:web
```

## 📂 Project Structure

```
customer-app/
├── src/
│   ├── components/          # Reusable components
│   │   ├── common/         # Buttons, inputs, cards
│   │   ├── booking/        # Booking-related components
│   │   └── trip/           # Trip-related components
│   ├── screens/            # App screens
│   │   ├── auth/           # Login, signup
│   │   ├── booking/        # Booking flow screens
│   │   ├── trip/           # Trip management screens
│   │   └── profile/        # Profile screens
│   ├── services/           # API services
│   │   ├── tripService.js
│   │   ├── bookingService.js
│   │   ├── paymentService.js
│   │   └── notificationService.js
│   ├── contexts/           # React contexts
│   │   └── AuthContext.js
│   ├── config/             # Configuration
│   │   ├── supabase.js
│   │   └── constants.js
│   ├── utils/              # Utility functions
│   └── assets/             # Images, fonts, icons
├── App.js                  # App entry point
├── app.json               # Expo configuration
├── package.json           # Dependencies
└── README.md              # This file
```

## 🔐 Security Features

- **Secure Authentication** - Supabase Auth with JWT
- **Encrypted Storage** - Sensitive data encryption
- **HTTPS Only** - Secure API communication
- **Row Level Security** - Database-level security
- **Payment Security** - PCI-DSS compliant
- **Session Management** - Auto logout on inactivity
- **Biometric Auth** - Fingerprint/Face ID support

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

## 📊 Analytics & Monitoring

- **User Analytics** - Track user behavior
- **Crash Reporting** - Monitor app stability
- **Performance Monitoring** - Track app performance
- **A/B Testing** - Test feature variations

## 🌍 Localization

Supported Languages:
- 🇬🇧 English
- 🇧🇼 Setswana
- 🇿🇦 Afrikaans

## 📞 Support

- **Email**: support@voyagetech.com
- **WhatsApp**: +267 1234 5678
- **Website**: https://voyagetech.com
- **Help Center**: https://help.voyagetech.com

## 📄 License

Proprietary - Voyage Tech Solutions © 2024

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Core booking flow
- ✅ Payment integration
- ✅ Live tracking
- ✅ QR check-in

### Phase 2 (Q1 2025)
- 🔄 Onboard entertainment
- 🔄 Loyalty program
- 🔄 In-app wallet
- 🔄 Group bookings

### Phase 3 (Q2 2025)
- 📅 Multi-language support
- 📅 Offline mode
- 📅 Apple Pay / Google Pay
- 📅 Biometric authentication

### Phase 4 (Q3 2025)
- 📅 AI chatbot
- 📅 Voice booking
- 📅 AR seat preview
- 📅 Social features

## 🤝 Contributing

This is a proprietary project. For contribution guidelines, contact the development team.

## 📝 Changelog

### Version 1.0.0 (Current)
- Initial release
- Complete booking flow
- Payment integration
- Live tracking
- QR check-in
- Profile management
- Notifications
- Support system

---

**Built with ❤️ by Voyage Tech Solutions**
