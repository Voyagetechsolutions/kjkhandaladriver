import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../config/supabase';
import { theme } from '../config/theme';

export const MyTripsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [groupedTrips, setGroupedTrips] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: driver } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!driver) return;

      const { data: trips } = await supabase
        .from('trips')
        .select(`
          *,
          routes:route_id(name, origin, destination),
          buses:bus_id(number_plate, model),
          bookings(count)
        `)
        .eq('driver_id', driver.id)
        .order('departure_time', { ascending: true });

      if (trips) {
        const grouped = groupTripsByDate(trips);
        setGroupedTrips(grouped);
      }
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const groupTripsByDate = (trips: any[]) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const groups: any = {
      today: [],
      tomorrow: [],
      upcoming: [],
    };

    trips.forEach((trip) => {
      const tripDate = new Date(trip.departure_time);
      const tripDateStr = tripDate.toDateString();

      if (tripDateStr === today.toDateString()) {
        groups.today.push(trip);
      } else if (tripDateStr === tomorrow.toDateString()) {
        groups.tomorrow.push(trip);
      } else if (tripDate > tomorrow) {
        groups.upcoming.push(trip);
      }
    });

    return groups;
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadTrips();
  };

  const getTripStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return '#4CAF50';
      case 'in progress': return '#FF9800';
      case 'boarding': return '#2196F3';
      case 'check-in open': return '#00BCD4';
      case 'upcoming': return '#9E9E9E';
      case 'cancelled': return '#F44336';
      default: return '#999';
    }
  };

  const getTripStatusText = (trip: any) => {
    const now = new Date();
    const departureTime = new Date(trip.departure_time);
    const timeDiff = departureTime.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (trip.status === 'completed') return 'Completed';
    if (trip.status === 'cancelled') return 'Cancelled';
    if (trip.status === 'in progress') return 'In Progress';
    if (trip.status === 'boarding') return 'Boarding';
    if (hoursDiff <= 2 && hoursDiff > 0) return 'Check-in Open';
    return 'Upcoming';
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const handleViewTrip = (trip: any) => {
    navigation.navigate('TripDetails', { tripId: trip.id });
  };

  const handleStartCheckIn = (trip: any) => {
    navigation.navigate('PassengerCheckIn', { tripId: trip.id });
  };

  const handleStartTrip = async (trip: any) => {
    try {
      Alert.alert(
        'Start Trip',
        `Are you sure you want to start the trip from ${trip.routes?.origin} to ${trip.routes?.destination}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Start Trip',
            onPress: async () => {
              const { error } = await supabase
                .from('trips')
                .update({
                  status: 'in progress',
                  actual_departure: new Date().toISOString(),
                })
                .eq('id', trip.id);

              if (error) {
                Alert.alert('Error', 'Failed to start trip. Please try again.');
                console.error('Error starting trip:', error);
              } else {
                Alert.alert('Success', 'Trip started successfully!');
                loadTrips();
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error starting trip:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const handleEndTrip = async (trip: any) => {
    try {
      Alert.alert(
        'End Trip',
        `Are you sure you want to end this trip?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'End Trip',
            onPress: async () => {
              const { error } = await supabase
                .from('trips')
                .update({
                  status: 'completed',
                  actual_arrival: new Date().toISOString(),
                })
                .eq('id', trip.id);

              if (error) {
                Alert.alert('Error', 'Failed to end trip. Please try again.');
                console.error('Error ending trip:', error);
              } else {
                Alert.alert('Success', 'Trip completed successfully!');
                loadTrips();
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error ending trip:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const canStartTrip = (trip: any) => {
    const status = trip.status?.toLowerCase();
    return !status || status === 'scheduled' || status === 'upcoming' || status === 'boarding' || status === 'check-in open';
  };

  const isTripInProgress = (trip: any) => {
    return trip.status?.toLowerCase() === 'in progress';
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.headerTitle}>My Trips</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  const renderTripCard = (trip: any) => {
    const status = getTripStatusText(trip);
    const passengerCount = trip.bookings?.[0]?.count || 0;

    return (
      <View key={trip.id} style={styles.tripCard}>
        <View style={styles.tripHeader}>
          <View style={styles.tripHeaderLeft}>
            <Text style={styles.tripTime}>{formatTime(trip.departure_time)}</Text>
            <Text style={styles.tripRoute}>
              {trip.routes?.origin || 'Origin'} → {trip.routes?.destination || 'Destination'}
            </Text>
            <Text style={styles.tripBus}>🚌 {trip.buses?.number_plate || 'N/A'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getTripStatusColor(status) }]}>
            <Text style={styles.statusText}>{status.toUpperCase()}</Text>
          </View>
        </View>

        {passengerCount > 0 && (
          <Text style={styles.passengerCount}>👥 {passengerCount} passengers</Text>
        )}

        <View style={styles.tripActions}>
          {canStartTrip(trip) && (
            <TouchableOpacity
              style={styles.startTripButton}
              onPress={() => handleStartTrip(trip)}
            >
              <Text style={styles.startTripButtonText}>▶ Start Trip</Text>
            </TouchableOpacity>
          )}
          
          {isTripInProgress(trip) && (
            <TouchableOpacity
              style={styles.endTripButton}
              onPress={() => handleEndTrip(trip)}
            >
              <Text style={styles.endTripButtonText}>⬛ End Trip</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.viewTripButton, (canStartTrip(trip) || isTripInProgress(trip)) && styles.viewTripButtonSmall]}
            onPress={() => handleStartCheckIn(trip)}
          >
            <Text style={styles.viewTripButtonText}>🎫 Check-In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.headerTitle}>My Trips</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        {/* Today */}
        {groupedTrips.today?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today</Text>
            {groupedTrips.today.map((trip: any) => renderTripCard(trip))}
          </View>
        )}

        {/* Tomorrow */}
        {groupedTrips.tomorrow?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tomorrow</Text>
            {groupedTrips.tomorrow.map((trip: any) => renderTripCard(trip))}
          </View>
        )}

        {/* Upcoming */}
        {groupedTrips.upcoming?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming</Text>
            {groupedTrips.upcoming.map((trip: any) => renderTripCard(trip))}
          </View>
        )}

        {/* Empty State */}
        {!groupedTrips.today?.length && !groupedTrips.tomorrow?.length && !groupedTrips.upcoming?.length && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No trips assigned</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 16,
    marginBottom: 12,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  tripCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tripHeaderLeft: {
    flex: 1,
  },
  tripTime: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  tripRoute: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  tripBus: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  passengerCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  tripActions: {
    flexDirection: 'row',
    gap: 8,
  },
  startTripButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  startTripButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  endTripButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  endTripButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  viewTripButton: {
    flex: 1,
    backgroundColor: theme.colors.secondary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewTripButtonSmall: {
    flex: 0.6,
  },
  viewTripButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
