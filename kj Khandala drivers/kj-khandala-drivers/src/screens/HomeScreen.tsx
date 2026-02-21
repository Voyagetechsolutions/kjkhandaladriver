import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { SyncStatusBar } from '../components/SyncStatusBar';
import { Trip, Shift, Bus } from '../types';
import { supabase } from '../config/supabase';
import { theme } from '../config/theme';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [todaysTrips, setTodaysTrips] = useState<Trip[]>([]);
  const [activeShift, setActiveShift] = useState<any>(null);
  const [assignedBus, setAssignedBus] = useState<Bus | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [tripBookings, setTripBookings] = useState<any[]>([]);
  const [showSeatsModal, setShowSeatsModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadTripSeats = async (tripId: string) => {
    try {
      const { data } = await supabase
        .from('bookings')
        .select('*')
        .eq('trip_id', tripId);
      
      setTripBookings(data || []);
    } catch (error) {
      console.error('Error loading trip seats:', error);
    }
  };

  const handleTripPress = async (trip: any) => {
    setSelectedTrip(trip);
    await loadTripSeats(trip.id);
    setShowSeatsModal(true);
  };

  const loadData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Get driver info
      const { data: driver } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!driver) return;

      // Get active shift for today
      const { data: shift } = await supabase
        .from('driver_shifts')
        .select(`
          *,
          buses:bus_id(*),
          routes:route_id(*)
        `)
        .eq('driver_id', driver.id)
        .eq('shift_date', today)
        .eq('status', 'scheduled')
        .single();

      setActiveShift(shift);

      // Get assigned bus
      if (shift?.bus_id) {
        const { data: bus } = await supabase
          .from('buses')
          .select('*')
          .eq('id', shift.bus_id)
          .single();
        setAssignedBus(bus);
      }

      // Get today's trips from driver_shifts
      const { data: shifts } = await supabase
        .from('driver_shifts')
        .select(`
          *,
          trips:trip_id(*),
          routes:route_id(*)
        `)
        .eq('driver_id', driver.id)
        .eq('shift_date', today);

      // Get trips for today
      const { data: trips } = await supabase
        .from('trips')
        .select(`
          *,
          routes:route_id(*)
        `)
        .eq('driver_id', driver.id)
        .gte('scheduled_departure', `${today}T00:00:00`)
        .lte('scheduled_departure', `${today}T23:59:59`)
        .order('scheduled_departure');

      setTodaysTrips(trips || []);

      // Get unread notifications (dispatch messages)
      const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5);

      setMessages(notifications || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const quickActions = [
    { id: 'start-trip', title: 'Start Trip', icon: '🚌', screen: 'MyTrips' },
    { id: 'inspection', title: 'Pre-Trip Inspection', icon: '✅', screen: 'PreTripInspection' },
    { id: 'fuel', title: 'Fuel Log', icon: '⛽', screen: 'FuelLog' },
    { id: 'breakdown', title: 'Report Breakdown', icon: '🔧', screen: 'BreakdownReport' },
    { id: 'checkin', title: 'Passenger Check-In', icon: '🎫', screen: 'PassengerCheckIn' },
    { id: 'shifts', title: 'My Shifts', icon: '📅', screen: 'MyShifts' },
    { id: 'trips', title: 'My Trips', icon: '🗺️', screen: 'MyTrips' },
    { id: 'bus-health', title: 'Bus Health', icon: '🏥', screen: 'BusHealth' },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#F44336';
      case 'high': return '#FF9800';
      case 'medium': return '#2196F3';
      default: return '#4CAF50';
    }
  };

  return (
    <View style={styles.container}>
      {/* Sync Status Bar */}
      <SyncStatusBar />
      
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.driverName}>{user?.name}</Text>
          </View>
          <TouchableOpacity
            style={[styles.profileButton, { backgroundColor: theme.colors.secondary }]}
            onPress={() => navigation.navigate('DriverProfile')}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>

      {/* Active Shift */}
      {activeShift && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Current Shift</Text>
            <View style={[styles.badge, { backgroundColor: theme.colors.success }]}>
              <Text style={styles.badgeText}>ACTIVE</Text>
            </View>
          </View>
          <Text style={styles.shiftTime}>
            {activeShift.shift_start_time ? new Date(activeShift.shift_start_time).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' }) : 'N/A'} - 
            {activeShift.shift_end_time ? new Date(activeShift.shift_end_time).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
          </Text>
          {activeShift.routes && (
            <Text style={styles.shiftTerminal}>📍 {activeShift.routes.origin} → {activeShift.routes.destination}</Text>
          )}
        </View>
      )}

      {/* Assigned Bus */}
      {assignedBus && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Assigned Bus</Text>
          <Text style={styles.busReg}>{assignedBus.number_plate}</Text>
          <Text style={styles.busModel}>{assignedBus.model || 'N/A'}</Text>
        </View>
      )}

      {/* Today's Trips */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today's Trips ({todaysTrips.length})</Text>
        {todaysTrips.length === 0 ? (
          <Text style={styles.emptyText}>No trips scheduled for today</Text>
        ) : (
          todaysTrips.map(trip => (
            <TouchableOpacity
              key={trip.id}
              style={styles.tripItem}
              onPress={() => handleTripPress(trip)}
            >
              <View style={styles.tripInfo}>
                <Text style={styles.tripRoute}>{trip.routes?.origin} → {trip.routes?.destination}</Text>
                <Text style={styles.tripTime}>
                  {new Date(trip.scheduled_departure).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <View style={[styles.tripStatus, { backgroundColor: trip.status === 'in-progress' ? theme.colors.warning : theme.colors.info }]}>
                <Text style={styles.tripStatusText}>{trip.status?.toUpperCase() || 'SCHEDULED'}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Dispatch Messages */}
      {messages.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Messages from Dispatch ({messages.length})</Text>
          {messages.map(msg => (
            <View key={msg.id} style={styles.messageItem}>
              <View style={[styles.priorityIndicator, { backgroundColor: msg.type === 'urgent' ? theme.colors.error : theme.colors.info }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.messageTitle}>{msg.title}</Text>
                <Text style={styles.messageText}>{msg.message}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map(action => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionButton}
              onPress={() => navigation.navigate(action.screen)}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={styles.actionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      </ScrollView>

      {/* Bus Seats Modal */}
      <Modal
        visible={showSeatsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSeatsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bus Seats - {selectedTrip?.routes?.origin} → {selectedTrip?.routes?.destination}</Text>
              <TouchableOpacity onPress={() => setShowSeatsModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.seatsStats}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{tripBookings.filter(b => b.checked_in).length}</Text>
                <Text style={styles.statLabel}>Boarded</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{tripBookings.filter(b => !b.checked_in).length}</Text>
                <Text style={styles.statLabel}>Booked</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>
                  {(assignedBus?.seating_capacity || 50) - tripBookings.length}
                </Text>
                <Text style={styles.statLabel}>Empty</Text>
              </View>
            </View>

            <ScrollView style={styles.seatsList}>
              <View style={styles.seatsLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendBox, { backgroundColor: '#4CAF50' }]} />
                  <Text style={styles.legendText}>Boarded</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendBox, { backgroundColor: '#FF9800' }]} />
                  <Text style={styles.legendText}>Booked</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendBox, { backgroundColor: '#E0E0E0' }]} />
                  <Text style={styles.legendText}>Empty</Text>
                </View>
              </View>

              <View style={styles.seatsGrid}>
                {Array.from({ length: assignedBus?.seating_capacity || 50 }, (_, i) => {
                  const seatNumber = i + 1;
                  const booking = tripBookings.find(b => b.seat_number === seatNumber.toString());
                  const isBoarded = booking?.checked_in;
                  const isBooked = booking && !booking.checked_in;
                  
                  return (
                    <View
                      key={seatNumber}
                      style={[
                        styles.seatBox,
                        {
                          backgroundColor: isBoarded
                            ? '#4CAF50'
                            : isBooked
                            ? '#FF9800'
                            : '#E0E0E0',
                        },
                      ]}
                    >
                      <Text style={[styles.seatNumber, { color: booking ? '#fff' : '#666' }]}>
                        {seatNumber}
                      </Text>
                      {booking && (
                        <Text style={styles.seatPassenger} numberOfLines={1}>
                          {booking.passenger_name}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowSeatsModal(false);
                navigation.navigate('PassengerCheckIn', { tripId: selectedTrip?.id });
              }}
            >
              <Text style={styles.modalButtonText}>Go to Check-In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  greeting: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  driverName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 24,
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  shiftTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  shiftTerminal: {
    fontSize: 14,
    color: '#666',
  },
  busReg: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  busModel: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  tripItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tripInfo: {
    flex: 1,
  },
  tripRoute: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  tripTime: {
    fontSize: 14,
    color: '#666',
  },
  tripStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tripStatusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  alertItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  alertIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  alertDesc: {
    fontSize: 12,
    color: '#666',
  },
  messageItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  priorityIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  messageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 13,
    color: '#666',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  actionButton: {
    width: '25%',
    padding: 8,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  modalClose: {
    fontSize: 24,
    color: '#666',
    padding: 5,
  },
  seatsStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  seatsList: {
    maxHeight: 400,
  },
  seatsLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  seatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  seatBox: {
    width: '18%',
    aspectRatio: 1,
    margin: '1%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  seatNumber: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  seatPassenger: {
    fontSize: 8,
    marginTop: 2,
    color: '#fff',
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
