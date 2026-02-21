import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../config/supabase';
import { THEME } from '../config/theme';
import { Button } from '../components';

export default function SeatSelectionScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { trip, passengers } = route.params;

  const [loading, setLoading] = useState(true);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);

  useEffect(() => {
    if (trip?.id) {
      loadSeats();
    }
  }, [trip]);

  const loadSeats = async () => {
    try {
      setLoading(true);

      console.log('Loading seats for trip:', trip.id);
      
      // Fetch all bookings for this trip
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('seat_number, booking_status, payment_status')
        .eq('trip_id', trip.id);

      if (error) {
        console.error('Error fetching booked seats:', error);
        throw error;
      }

      console.log('Bookings data:', bookings);

      // Categorize seats by status
      const seatStatusMap = {};
      bookings?.forEach(b => {
        const seatNum = typeof b.seat_number === 'string' ? parseInt(b.seat_number) : b.seat_number;
        if (!isNaN(seatNum)) {
          const paymentStatus = b.payment_status?.toLowerCase();
          const bookingStatus = b.booking_status?.toLowerCase();
          
          // Reserved: payment_status = 'reserved' OR 'pending' with confirmed booking
          // Booked: payment_status = 'paid', 'completed', or 'settled'
          if (paymentStatus === 'reserved' || (paymentStatus === 'pending' && bookingStatus === 'confirmed')) {
            seatStatusMap[seatNum] = 'reserved';
          } else if (['paid', 'completed', 'settled'].includes(paymentStatus) && ['confirmed', 'checked_in', 'boarded'].includes(bookingStatus)) {
            seatStatusMap[seatNum] = 'booked';
          } else if (['confirmed', 'checked_in', 'boarded'].includes(bookingStatus)) {
            // Fallback: if no payment status or other cases, mark as booked
            seatStatusMap[seatNum] = 'booked';
          }
          console.log(`Seat ${seatNum}: booking_status=${bookingStatus}, payment_status=${paymentStatus}, final_status=${seatStatusMap[seatNum]}`);
        }
      });

      console.log('Seat status map:', seatStatusMap);

      // Create seat map (60 seats, 2x2 configuration)
      const seatMap = [];
      for (let i = 1; i <= 60; i++) {
        seatMap.push({
          number: i,
          status: seatStatusMap[i] || 'available',
          price: trip?.fare || 0,
        });
      }

      const bookedCount = seatMap.filter(s => s.status === 'booked').length;
      const reservedCount = seatMap.filter(s => s.status === 'reserved').length;
      console.log(`Created seat map: ${bookedCount} booked, ${reservedCount} reserved`);
      setSeats(seatMap);
    } catch (error) {
      console.error('Error loading seats:', error);
      Alert.alert('Error', 'Failed to load seat information');
    } finally {
      setLoading(false);
    }
  };

  const handleSeatPress = (seatNumber) => {
    const seat = seats.find(s => s.number === seatNumber);
    if (!seat) return;
    
    if (seat.status === 'booked') {
      Alert.alert('Unavailable', 'This seat is already booked');
      return;
    }
    
    if (seat.status === 'reserved') {
      Alert.alert('Reserved', 'This seat is reserved and cannot be booked');
      return;
    }

    if (selectedSeats.includes(seatNumber)) {
      // Deselect seat
      setSelectedSeats(selectedSeats.filter(s => s !== seatNumber));
    } else {
      // Select seat
      if (selectedSeats.length >= passengers) {
        Alert.alert(
          'Maximum Reached',
          `You can only select ${passengers} seat${passengers > 1 ? 's' : ''}`
        );
        return;
      }
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  const getSeatColor = (seat) => {
    if (seat.status === 'booked') {
      return THEME.colors.gray[400]; // Booked - Gray
    }
    if (seat.status === 'reserved') {
      return THEME.colors.info; // Reserved - Blue
    }
    if (selectedSeats.includes(seat.number)) {
      return THEME.colors.primary; // Selected - Red
    }
    return THEME.colors.success; // Available - Green
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seatNum) => {
      const seat = seats.find(s => s.number === seatNum);
      return total + (seat?.price || trip?.fare || 0);
    }, 0);
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      Alert.alert('No Seats Selected', 'Please select at least one seat');
      return;
    }

    if (selectedSeats.length !== passengers) {
      Alert.alert(
        'Incomplete Selection',
        `Please select ${passengers} seat${passengers > 1 ? 's' : ''}`
      );
      return;
    }

    navigation.navigate('PassengerDetails', {
      trip,
      selectedSeats: selectedSeats.sort((a, b) => a - b),
      totalAmount: calculateTotal(),
      passengers,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text style={styles.loadingText}>Loading seats...</Text>
      </View>
    );
  }

  // Create rows (15 rows, 4 seats per row = 60 seats)
  const rows = [];
  for (let i = 0; i < 15; i++) {
    const rowSeats = seats.slice(i * 4, (i + 1) * 4);
    rows.push({ row: i + 1, seats: rowSeats });
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Your Seats</Text>
        <Text style={styles.headerSubtitle}>
          Select {passengers} seat{passengers > 1 ? 's' : ''}
        </Text>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: THEME.colors.success }]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: THEME.colors.primary }]} />
          <Text style={styles.legendText}>Selected</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: THEME.colors.info }]} />
          <Text style={styles.legendText}>Reserved</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: THEME.colors.gray[400] }]} />
          <Text style={styles.legendText}>Booked</Text>
        </View>
      </View>

      {/* Bus Layout */}
      <ScrollView style={styles.busContainer}>
        <View style={styles.bus}>
          {/* Driver Section */}
          <View style={styles.driverSection}>
            <View style={styles.driverSeat}>
              <Text style={styles.driverIcon}>🚗</Text>
            </View>
            <Text style={styles.driverLabel}>Driver</Text>
          </View>

          {/* Seats - 2x2 Configuration */}
          <View style={styles.seatsContainer}>
            {rows.map((row) => (
              <View key={row.row} style={styles.row}>
                <Text style={styles.rowNumber}>{row.row}</Text>
                <View style={styles.rowSeats}>
                  {row.seats.map((seat, index) => (
                    <React.Fragment key={seat.number}>
                      <TouchableOpacity
                        style={[
                          styles.seat,
                          { backgroundColor: getSeatColor(seat) },
                          seat.status === 'booked' && styles.seatDisabled,
                        ]}
                        onPress={() => handleSeatPress(seat.number)}
                        disabled={seat.status === 'booked'}
                      >
                        <Text style={[
                          styles.seatNumber,
                          seat.status === 'booked' && styles.seatNumberDisabled,
                          selectedSeats.includes(seat.number) && styles.seatNumberSelected
                        ]}>
                          {seat.number}
                        </Text>
                      </TouchableOpacity>
                      {/* Aisle between 2nd and 3rd seat */}
                      {index === 1 && <View style={styles.aisle} />}
                    </React.Fragment>
                  ))}
                </View>
              </View>
            ))}
          </View>

          {/* Toilet */}
          <View style={styles.toiletSection}>
            <Text style={styles.toiletIcon}>🚻</Text>
            <Text style={styles.toiletLabel}>Toilet</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Selected Seats:</Text>
            <Text style={styles.summaryValue}>
              {selectedSeats.length > 0 
                ? selectedSeats.sort((a, b) => a - b).join(', ')
                : 'None'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount:</Text>
            <Text style={styles.totalAmount}>BWP {calculateTotal()}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.continueBtn,
            selectedSeats.length !== passengers && styles.continueBtnDisabled,
          ]}
          onPress={handleContinue}
          disabled={selectedSeats.length !== passengers}
        >
          <Text style={styles.continueBtnText}>
            Continue to Passenger Details →
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.light,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: THEME.colors.gray[600],
  },
  header: {
    backgroundColor: THEME.colors.white,
    padding: 15,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.gray[200],
  },
  backBtn: {
    fontSize: 16,
    color: THEME.colors.primary,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.colors.dark,
  },
  headerSubtitle: {
    fontSize: 14,
    color: THEME.colors.gray[600],
    marginTop: 4,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: THEME.colors.white,
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.gray[200],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: THEME.colors.gray[700],
  },
  busContainer: {
    flex: 1,
    padding: 20,
  },
  bus: {
    backgroundColor: THEME.colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  driverSection: {
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: THEME.colors.gray[200],
  },
  driverSeat: {
    width: 60,
    height: 60,
    backgroundColor: THEME.colors.gray[200],
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  driverIcon: {
    fontSize: 32,
  },
  driverLabel: {
    fontSize: 14,
    color: THEME.colors.gray[600],
    fontWeight: '600',
  },
  seatsContainer: {
    marginBottom: 30,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rowNumber: {
    width: 30,
    fontSize: 14,
    fontWeight: 'bold',
    color: THEME.colors.gray[600],
    textAlign: 'center',
  },
  rowSeats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seat: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  seatDisabled: {
    opacity: 0.5,
  },
  seatNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: THEME.colors.white,
  },
  seatNumberDisabled: {
    color: THEME.colors.gray[600],
  },
  seatNumberSelected: {
    color: THEME.colors.white,
  },
  aisle: {
    width: 20,
  },
  toiletSection: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: THEME.colors.gray[200],
  },
  toiletIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  toiletLabel: {
    fontSize: 14,
    color: THEME.colors.gray[600],
    fontWeight: '600',
  },
  footer: {
    backgroundColor: THEME.colors.white,
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.gray[200],
  },
  summaryContainer: {
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: THEME.colors.gray[600],
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.dark,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.colors.primary,
  },
  continueBtn: {
    backgroundColor: THEME.colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  continueBtnDisabled: {
    backgroundColor: THEME.colors.gray[400],
  },
  continueBtnText: {
    color: THEME.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
