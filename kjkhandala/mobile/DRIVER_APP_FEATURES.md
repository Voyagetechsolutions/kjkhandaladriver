# 🚍 Driver App - Complete Feature List

## ✅ Core Features (Must Have)

### 1. Driver Home Screen
- Today's assigned trip
- Next trip preview
- Bus allocated
- Time to departure countdown
- Route overview
- Check-in progress (0/48 passengers)
- Alerts (breakdown, maintenance, fuel due)
- "Start Trip" button

### 2. Trip Assignments
- All assigned trips list
- Trip cards with:
  - Trip number
  - Route (Origin → Destination)
  - Date & departure time
  - Bus registration number
  - Total passengers
  - Trip status
  - Conductor assigned
- Actions: Accept, Reject, View Details, Start, Complete

### 3. Passenger Manifest
- Full passenger list per trip
- Seat number, Name, Phone, Ticket #
- Payment status
- Luggage status
- Check-in status
- Actions: Scan QR, Manual check-in, Mark no-show

### 4. QR Code Check-In
- Camera scanner
- Auto passenger check-in
- Seat number display
- Vibration + sound confirmation
- Real-time manifest update

### 5. Pre-Trip Inspection (Mandatory)
- Exterior checks (tyres, lights, mirrors, body, windows)
- Engine & fluids (temperature, oil, coolant, battery)
- Interior (seats, belts, AC, cleanliness)
- Safety (extinguisher, first aid, emergency exit)
- Photo upload for defects
- Critical failure blocks trip start

### 6. Post-Trip Inspection
- Issue reporting
- Bus condition rating
- Passenger behavior notes
- Fuel consumption
- Maintenance request submission

### 7. Fuel Logs
- Fuel station
- Litres, Price, Total cost
- Odometer reading
- Receipt photo upload
- Payment method
- Finance approval workflow

### 8. Breakdown / Incident Reporting
- Incident types: Breakdown, Accident, Delays, Medical, etc.
- GPS location
- Description, Severity
- Photos/Videos
- Auto-alerts to Dispatch, Maintenance, Management

### 9. Live GPS Tracking
- Real-time location to Supabase
- Route progress
- ETA calculation
- Speed monitoring
- Distance remaining

### 10. Messaging & Announcements
- Receive dispatch messages
- Reply to messages
- Company announcements
- Trip updates
- Schedule changes

### 11. Trip Timeline Updates
- Depart depot
- Arrived at pickup
- Departed pickup
- Arrived destination
- Trip completed
- Updates customer app & admin dashboard

### 12. Driver Wallet & Allowances
- Daily allowances
- Fuel allowance
- Trip earnings
- Pending payments
- Bonuses
- Transaction history
- Payslip download

### 13. Profile & Settings
- Profile picture
- Contact details
- License info & expiry
- Emergency contact
- Password change
- Dark mode
- Language options
- Help & support

---

## ⭐ Premium Features (Phase 2)

- Offline mode (check-in without internet)
- In-app navigation with road warnings
- Driver performance score
- Speed monitoring alerts
- Onboard camera integration
- Digital logbook
- Audio announcements (auto-play next stop)

---

## 📊 Technical Stack

- **Framework**: Expo SDK 54 + React Native
- **Navigation**: Expo Router
- **Backend**: Supabase (PostgreSQL + Real-time)
- **Maps**: Google Maps API
- **Camera**: expo-camera
- **Location**: expo-location
- **Storage**: expo-secure-store
- **Notifications**: expo-notifications

---

## 🗂️ Database Tables Needed

### New Tables:
1. `trip_inspections` - Pre/post trip inspections
2. `fuel_logs` - Fuel entries
3. `incidents` - Breakdown/incident reports
4. `trip_timeline` - Trip event updates
5. `driver_messages` - In-app messaging
6. `driver_wallet` - Allowances & earnings
7. `passenger_checkins` - QR check-in records

### Existing Tables to Use:
- `drivers`
- `trips`
- `bookings`
- `buses`
- `routes`

---

**Ready to implement!** 🚀
