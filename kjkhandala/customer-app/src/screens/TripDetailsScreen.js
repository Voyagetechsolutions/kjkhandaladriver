import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import { bookingService } from '../services/bookingService';
import { COLORS } from '../config/constants';
import { format } from 'date-fns';

export default function TripDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { bookingId, action } = route.params;

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    loadBookingDetails();
    
    // Handle specific actions
    if (action === 'view_ticket') {
      setShowQR(true);
    }
  }, [bookingId]);

  const loadBookingDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await bookingService.getBookingDetails(bookingId);
      
      if (error) throw error;
      setBooking(data);
    } catch (error) {
      console.error('Error loading booking:', error);
      Alert.alert('Error', 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    Alert.alert(
      'Check In',
      'Are you ready to check in for this trip?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Check In',
          onPress: async () => {
            const { error } = await bookingService.checkIn(bookingId);
            if (error) {
              Alert.alert('Error', 'Failed to check in');
            } else {
              Alert.alert('Success', 'You have been checked in!');
              loadBookingDetails();
            }
          },
        },
      ]
    );
  };

  const handleCancelBooking = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? You may be eligible for a refund.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => navigation.navigate('CancelBooking', { bookingId }),
        },
      ]
    );
  };

  const handleRequestRefund = () => {
    navigation.navigate('RefundRequest', { bookingId });
  };

  const handleReschedule = () => {
    navigation.navigate('RescheduleBooking', { bookingId });
  };

  const handleShareTicket = async () => {
    try {
      await Share.share({
        message: `My Voyage Onboard Ticket\n\nBooking Reference: ${booking.booking_reference}\nRoute: ${booking.trip.route.origin.name} → ${booking.trip.route.destination.name}\nDate: ${format(new Date(booking.trip.departure_time), 'PPP')}\nSeats: ${booking.seat_numbers.join(', ')}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDownloadTicket = () => {
    Alert.alert('Download', 'Ticket download feature coming soon!');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Booking not found</Text>
      </View>
    );
  }

  const trip = booking.trip;
  const route_data = trip.route;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trip Details</Text>
        <TouchableOpacity onPress={handleShareTicket}>
          <Text style={styles.shareBtn}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* QR Code Section */}
        {showQR && (
          <View style={styles.qrSection}>
            <Text style={styles.qrTitle}>Your Boarding Pass</Text>
            <View style={styles.qrContainer}>
              <QRCode
                value={JSON.stringify({
                  bookingId: booking.id,
                  reference: booking.booking_reference,
                  seats: booking.seat_numbers,
                })}
                size={200}
                backgroundColor={COLORS.white}
                color={COLORS.dark}
              />
            </View>
            <Text style={styles.qrSubtitle}>
              Show this QR code at check-in
            </Text>
            <Text style={styles.bookingRef}>{booking.booking_reference}</Text>
          </View>
        )}

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={[styles.statusBadge, { 
            backgroundColor: booking.status === 'confirmed' ? COLORS.success : COLORS.warning 
          }]}>
            <Text style={styles.statusText}>
              {booking.status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Trip Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Trip Information</Text>
          
          <View style={styles.routeContainer}>
            <View style={styles.locationBlock}>
              <Text style={styles.locationIcon}>📍</Text>
              <View>
                <Text style={styles.locationName}>{route_data.origin.name}</Text>
                <Text style={styles.locationTime}>
                  {format(new Date(trip.departure_time), 'hh:mm a')}
                </Text>
              </View>
            </View>

            <View style={styles.routeLine}>
              <View style={styles.routeDot} />
              <View style={styles.routeDash} />
              <View style={styles.routeDot} />
            </View>

            <View style={styles.locationBlock}>
              <Text style={styles.locationIcon}>📍</Text>
              <View>
                <Text style={styles.locationName}>{route_data.destination.name}</Text>
                <Text style={styles.locationTime}>
                  {format(new Date(trip.arrival_time), 'hh:mm a')}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>
              {format(new Date(trip.departure_time), 'EEEE, MMMM dd, yyyy')}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Duration</Text>
            <Text style={styles.infoValue}>{route_data.duration}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Distance</Text>
            <Text style={styles.infoValue}>{route_data.distance} km</Text>
          </View>
        </View>

        {/* Passenger Info */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Passenger Details</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{booking.passenger_name}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{booking.passenger_phone}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID Number</Text>
            <Text style={styles.infoValue}>{booking.passenger_id_number}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Seat Numbers</Text>
            <Text style={styles.infoValue}>
              {booking.seat_numbers.join(', ')}
            </Text>
          </View>

          {booking.luggage_count > 0 && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Luggage</Text>
              <Text style={styles.infoValue}>
                {booking.luggage_count} bag{booking.luggage_count > 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>

        {/* Bus Info */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Bus Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Bus Number</Text>
            <Text style={styles.infoValue}>{trip.bus.registration_number}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Bus Type</Text>
            <Text style={styles.infoValue}>{trip.bus.bus_type}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Driver</Text>
            <Text style={styles.infoValue}>{trip.driver.full_name}</Text>
          </View>
        </View>

        {/* Payment Info */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Payment Details</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Base Fare</Text>
            <Text style={styles.infoValue}>BWP {trip.fare}</Text>
          </View>

          {booking.luggage_fee > 0 && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Luggage Fee</Text>
              <Text style={styles.infoValue}>BWP {booking.luggage_fee}</Text>
            </View>
          )}

          {booking.discount_amount > 0 && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: COLORS.success }]}>
                Discount
              </Text>
              <Text style={[styles.infoValue, { color: COLORS.success }]}>
                -BWP {booking.discount_amount}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalValue}>BWP {booking.total_amount}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment Status</Text>
            <Text style={[styles.infoValue, { 
              color: booking.payment_status === 'completed' ? COLORS.success : COLORS.warning 
            }]}>
              {booking.payment_status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsCard}>
          {booking.status === 'confirmed' && (
            <>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setShowQR(!showQR)}
              >
                <Text style={styles.actionButtonText}>
                  {showQR ? 'Hide' : 'Show'} QR Code
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleCheckIn}
              >
                <Text style={styles.actionButtonText}>Check In</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('LiveTracking', { 
                  tripId: trip.id,
                  bookingId: booking.id,
                })}
              >
                <Text style={styles.actionButtonText}>Track Bus</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleDownloadTicket}
              >
                <Text style={styles.actionButtonText}>Download Ticket</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleReschedule}
              >
                <Text style={styles.actionButtonText}>Reschedule</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonDanger]}
                onPress={handleCancelBooking}
              >
                <Text style={[styles.actionButtonText, styles.actionButtonTextDanger]}>
                  Cancel Booking
                </Text>
              </TouchableOpacity>
            </>
          )}

          {booking.status === 'cancelled' && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleRequestRefund}
            >
              <Text style={styles.actionButtonText}>Request Refund</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Help Section */}
        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>Need Help?</Text>
          <Text style={styles.helpText}>
            Contact our support team for any assistance
          </Text>
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => navigation.navigate('Support')}
          >
            <Text style={styles.helpButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: COLORS.danger,
  },
  header: {
    backgroundColor: COLORS.white,
    padding: 15,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  backBtn: {
    fontSize: 16,
    color: COLORS.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  shareBtn: {
    fontSize: 16,
    color: COLORS.primary,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  qrSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 20,
  },
  qrContainer: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  qrSubtitle: {
    fontSize: 14,
    color: COLORS.gray[600],
    marginTop: 20,
  },
  bookingRef: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 10,
  },
  statusCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 15,
  },
  routeContainer: {
    marginBottom: 15,
  },
  locationBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  locationIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  locationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  locationTime: {
    fontSize: 14,
    color: COLORS.gray[600],
    marginTop: 2,
  },
  routeLine: {
    marginLeft: 12,
    alignItems: 'center',
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  routeDash: {
    width: 2,
    height: 30,
    backgroundColor: COLORS.gray[300],
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.gray[600],
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray[300],
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  actionsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  actionButton: {
    backgroundColor: COLORS.gray[100],
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtonDanger: {
    backgroundColor: COLORS.danger + '20',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
  },
  actionButtonTextDanger: {
    color: COLORS.danger,
  },
  helpCard: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: COLORS.gray[600],
    textAlign: 'center',
    marginBottom: 15,
  },
  helpButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  helpButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
