import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { bookingService } from '../services/bookingService';
import { supabase } from '../config/supabase';
import { COLORS } from '../config/constants';
import { format, differenceInHours } from 'date-fns';

export default function MyTripsScreen() {
  const navigation = useNavigation();
  const auth = useAuth();
  const user = auth?.user;
  
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ratingModal, setRatingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user, activeTab]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const { data, error } = await bookingService.getUserBookings(user.id);
      
      if (error) throw error;
      
      const filtered = (data || []).filter(booking => {
        if (!booking.trip?.scheduled_departure) return false;
        
        try {
          const departureTime = new Date(booking.trip.scheduled_departure);
          if (isNaN(departureTime.getTime())) return false;
          
          const now = new Date();
          const isUpcoming = departureTime > now;
          return activeTab === 'upcoming' ? isUpcoming : !isUpcoming;
        } catch (error) {
          return false;
        }
      });
      
      setBookings(filtered);
    } catch (error) {
      console.error('Error loading bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: COLORS.success,
      checked_in: COLORS.primary,
      boarded: COLORS.primary,
      completed: COLORS.gray[500],
      cancelled: COLORS.danger,
      refund_requested: COLORS.warning,
    };
    return colors[status] || COLORS.gray[500];
  };

  const getCountdown = (departureTime) => {
    const hours = differenceInHours(new Date(departureTime), new Date());
    if (hours < 0) return 'Departed';
    if (hours < 1) return 'Departing soon!';
    if (hours < 24) return `${hours} hours left`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} left`;
  };

  const handleCancelBooking = (booking) => {
    const hoursUntilDeparture = differenceInHours(
      new Date(booking.trip.scheduled_departure),
      new Date()
    );

    let refundAmount = 0;
    let refundMessage = '';

    if (hoursUntilDeparture >= 72) {
      refundAmount = booking.total_amount;
      refundMessage = 'Full refund (100%)';
    } else if (hoursUntilDeparture >= 24) {
      refundAmount = booking.total_amount * 0.5;
      refundMessage = '50% refund';
    } else {
      refundMessage = 'No refund available';
    }

    Alert.alert(
      'Cancel Booking',
      `Are you sure you want to cancel this booking?\n\nRefund: ${refundMessage}${refundAmount > 0 ? `\nAmount: BWP ${refundAmount.toFixed(2)}` : ''}`,
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Cancel Booking',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('bookings')
                .update({
                  booking_status: 'cancelled',
                  refund_amount: refundAmount,
                  refund_status: refundAmount > 0 ? 'pending' : 'not_applicable',
                  cancelled_at: new Date().toISOString(),
                })
                .eq('id', booking.id);

              if (error) throw error;

              Alert.alert(
                'Booking Cancelled',
                refundAmount > 0
                  ? `Your booking has been cancelled. A refund of BWP ${refundAmount.toFixed(2)} will be processed within 5-7 business days.`
                  : 'Your booking has been cancelled.'
              );
              loadBookings();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel booking. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleReschedule = (booking) => {
    Alert.alert(
      'Reschedule Trip',
      'Contact support to reschedule your trip. Rescheduling is subject to availability and may incur additional charges.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Contact Support', onPress: () => navigation.navigate('Support') },
      ]
    );
  };

  const handleAddLuggage = (booking) => {
    Alert.alert(
      'Add Luggage',
      'Would you like to add extra luggage to your booking? Additional charges may apply (BWP 50).',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add Luggage',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('bookings')
                .update({
                  extra_luggage: true,
                  extra_luggage_fee: 50,
                })
                .eq('id', booking.id);

              if (error) throw error;
              Alert.alert('Success', 'Extra luggage added. You will be charged BWP 50 at check-in.');
              loadBookings();
            } catch (error) {
              Alert.alert('Error', 'Failed to add luggage.');
            }
          },
        },
      ]
    );
  };

  const handleCheckIn = async (booking) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          booking_status: 'checked_in',
          checked_in_at: new Date().toISOString(),
        })
        .eq('id', booking.id);

      if (error) throw error;

      Alert.alert(
        'Check-In Successful',
        'You have successfully checked in for your trip. Please proceed to the boarding gate.'
      );
      loadBookings();
    } catch (error) {
      Alert.alert('Error', 'Failed to check in. Please try again.');
    }
  };

  const handleDownloadTicket = (booking) => {
    Alert.alert(
      'Download Ticket',
      'Your ticket has been saved. You can view it in the Trip Details.',
      [{ text: 'OK', onPress: () => navigation.navigate('TripDetails', { bookingId: booking.id }) }]
    );
  };

  const openRatingModal = (booking) => {
    setSelectedBooking(booking);
    setRating(0);
    setReview('');
    setRatingModal(true);
  };

  const submitRating = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    try {
      const { error } = await supabase.from('trip_ratings').insert([
        {
          booking_id: selectedBooking.id,
          trip_id: selectedBooking.trip.id,
          user_id: user.id,
          rating: rating,
          review: review,
        },
      ]);

      if (error) throw error;

      Alert.alert('Thank You!', 'Your rating has been submitted successfully.');
      setRatingModal(false);
      loadBookings();
    } catch (error) {
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
    }
  };

  const renderBookingCard = (booking) => {
    const trip = booking.trip;
    
    if (!trip?.scheduled_departure) return null;
    
    const departureTime = new Date(trip.scheduled_departure);
    if (isNaN(departureTime.getTime())) return null;
    
    const isUpcoming = departureTime > new Date();
    const canCheckIn = differenceInHours(departureTime, new Date()) <= 24 && differenceInHours(departureTime, new Date()) > 0;

    return (
      <TouchableOpacity
        key={booking.id}
        style={styles.bookingCard}
        onPress={() => navigation.navigate('TripDetails', { bookingId: booking.id })}
      >
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.booking_status) }]}>
          <Text style={styles.statusText}>{booking.booking_status.replace('_', ' ').toUpperCase()}</Text>
        </View>

        <View style={styles.routeContainer}>
          <Text style={styles.routeText}>
            {trip.routes?.origin || 'N/A'} → {trip.routes?.destination || 'N/A'}
          </Text>
          {isUpcoming && (
            <Text style={styles.countdown}>{getCountdown(trip.scheduled_departure)}</Text>
          )}
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📅 Date</Text>
            <Text style={styles.detailValue}>{format(departureTime, 'EEE, MMM dd, yyyy')}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>🕐 Time</Text>
            <Text style={styles.detailValue}>{format(departureTime, 'hh:mm a')}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>💺 Seat</Text>
            <Text style={styles.detailValue}>{booking.seat_number || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>🎫 Booking Ref</Text>
            <Text style={styles.detailValue}>{booking.booking_reference}</Text>
          </View>
        </View>

        {isUpcoming && booking.booking_status === 'confirmed' && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleDownloadTicket(booking)}>
              <Text style={styles.actionBtnText}>📥 Ticket</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('LiveTracking', { tripId: trip.id })}>
              <Text style={styles.actionBtnText}>📍 Track</Text>
            </TouchableOpacity>
            
            {canCheckIn && (
              <TouchableOpacity style={[styles.actionBtn, styles.actionBtnPrimary]} onPress={() => handleCheckIn(booking)}>
                <Text style={[styles.actionBtnText, styles.actionBtnTextPrimary]}>✓ Check In</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleAddLuggage(booking)}>
              <Text style={styles.actionBtnText}>🧳 Luggage</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleReschedule(booking)}>
              <Text style={styles.actionBtnText}>🔄 Reschedule</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDanger]} onPress={() => handleCancelBooking(booking)}>
              <Text style={[styles.actionBtnText, styles.actionBtnTextDanger]}>✕ Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isUpcoming && booking.booking_status === 'completed' && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleDownloadTicket(booking)}>
              <Text style={styles.actionBtnText}>📥 Receipt</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionBtn, styles.actionBtnPrimary]} onPress={() => openRatingModal(booking)}>
              <Text style={[styles.actionBtnText, styles.actionBtnTextPrimary]}>⭐ Rate Trip</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Total Paid</Text>
          <Text style={styles.amountValue}>BWP {booking.total_amount}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Trips</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <Text style={styles.notificationIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.tabActive]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>
            Past Trips
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {bookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>{activeTab === 'upcoming' ? '🎫' : '📋'}</Text>
            <Text style={styles.emptyTitle}>
              {activeTab === 'upcoming' ? 'No Upcoming Trips' : 'No Past Trips'}
            </Text>
            <Text style={styles.emptyText}>
              {activeTab === 'upcoming' 
                ? 'Book your next trip and it will appear here'
                : 'Your completed trips will appear here'}
            </Text>
            {activeTab === 'upcoming' && (
              <TouchableOpacity style={styles.bookNowBtn} onPress={() => navigation.navigate('Home')}>
                <Text style={styles.bookNowBtnText}>Book a Trip</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          bookings.map(renderBookingCard)
        )}
      </ScrollView>

      <Modal visible={ratingModal} animationType="slide" transparent={true} onRequestClose={() => setRatingModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rate Your Trip</Text>
            
            {selectedBooking && (
              <Text style={styles.modalSubtitle}>
                {selectedBooking.trip?.routes?.origin} → {selectedBooking.trip?.routes?.destination}
              </Text>
            )}

            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)} style={styles.starButton}>
                  <Text style={styles.star}>{star <= rating ? '⭐' : '☆'}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.reviewInput}
              placeholder="Share your experience (optional)"
              placeholderTextColor={COLORS.gray[400]}
              value={review}
              onChangeText={setReview}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setRatingModal(false)}>
                <Text style={styles.modalBtnTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSubmit]} onPress={submitRating}>
                <Text style={styles.modalBtnTextSubmit}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.light },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.dark },
  notificationIcon: { fontSize: 24 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: COLORS.primary },
  tabText: { fontSize: 16, color: COLORS.gray[600] },
  tabTextActive: { color: COLORS.primary, fontWeight: 'bold' },
  content: { flex: 1, padding: 15 },
  bookingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },
  routeContainer: { marginBottom: 15, paddingRight: 100 },
  routeText: { fontSize: 18, fontWeight: 'bold', color: COLORS.dark, marginBottom: 4 },
  countdown: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  detailsContainer: { marginBottom: 15 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  detailLabel: { fontSize: 14, color: COLORS.gray[600] },
  detailValue: { fontSize: 14, fontWeight: '600', color: COLORS.dark },
  actionsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 },
  actionBtn: { backgroundColor: COLORS.gray[100], paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  actionBtnPrimary: { backgroundColor: COLORS.primary },
  actionBtnDanger: { backgroundColor: COLORS.danger },
  actionBtnText: { fontSize: 14, color: COLORS.dark, fontWeight: '600' },
  actionBtnTextPrimary: { color: COLORS.white },
  actionBtnTextDanger: { color: COLORS.white },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  amountLabel: { fontSize: 14, color: COLORS.gray[600] },
  amountValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 64, marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.dark, marginBottom: 8 },
  emptyText: { fontSize: 16, color: COLORS.gray[600], textAlign: 'center', marginBottom: 20 },
  bookNowBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 8 },
  bookNowBtnText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: COLORS.white, borderRadius: 20, padding: 24, width: '90%', maxWidth: 400 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.dark, marginBottom: 8, textAlign: 'center' },
  modalSubtitle: { fontSize: 16, color: COLORS.gray[600], marginBottom: 24, textAlign: 'center' },
  starsContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24, gap: 8 },
  starButton: { padding: 4 },
  star: { fontSize: 40 },
  reviewInput: {
    backgroundColor: COLORS.gray[100],
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: COLORS.dark,
    marginBottom: 24,
    minHeight: 100,
  },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: COLORS.gray[200] },
  modalBtnTextCancel: { color: COLORS.dark, fontSize: 16, fontWeight: 'bold' },
  modalBtnSubmit: { backgroundColor: COLORS.primary },
  modalBtnTextSubmit: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});
