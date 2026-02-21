import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { DriverProfile, Bus, Trip, Shift } from '../types';
import { MockApiService } from '../services/mockApi';

export const DriverDashboardScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
  const [assignedBus, setAssignedBus] = useState<Bus | null>(null);
  const [todaysTrips, setTodaysTrips] = useState<Trip[]>([]);
  const [activeShift, setActiveShift] = useState<Shift | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Fetch all data in parallel
      const [profile, bus, trips, shift] = await Promise.all([
        MockApiService.getDriverProfile(user.id),
        MockApiService.getAssignedBus(user.id),
        MockApiService.getTodaysTrips(user.id),
        MockApiService.getActiveShift(user.id),
      ]);

      setDriverProfile(profile);
      setAssignedBus(bus);
      setTodaysTrips(trips);
      setActiveShift(shift);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load dashboard data');
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadDashboardData();
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            Alert.alert('Error', 'Failed to logout');
          }
        },
      },
    ]);
  };

  const getTripStatusColor = (status: Trip['status']) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'in-progress':
        return '#FF9800';
      case 'scheduled':
        return '#2196F3';
      case 'cancelled':
        return '#F44336';
      default:
        return '#999';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.driverName}>{driverProfile?.name}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Driver Profile Card */}
      {driverProfile && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Driver Profile</Text>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>License:</Text>
            <Text style={styles.profileValue}>{driverProfile.licenseNumber}</Text>
          </View>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Experience:</Text>
            <Text style={styles.profileValue}>{driverProfile.experience} years</Text>
          </View>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Rating:</Text>
            <Text style={styles.profileValue}>⭐ {driverProfile.rating.toFixed(1)}</Text>
          </View>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Total Trips:</Text>
            <Text style={styles.profileValue}>{driverProfile.totalTrips}</Text>
          </View>
        </View>
      )}

      {/* Active Shift Card */}
      {activeShift && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Active Shift</Text>
          <View style={[styles.statusBadge, { backgroundColor: '#4CAF50' }]}>
            <Text style={styles.statusBadgeText}>ACTIVE</Text>
          </View>
          <View style={styles.shiftRow}>
            <Text style={styles.shiftLabel}>Start Time:</Text>
            <Text style={styles.shiftValue}>{formatTime(activeShift.startTime)}</Text>
          </View>
          <View style={styles.shiftRow}>
            <Text style={styles.shiftLabel}>End Time:</Text>
            <Text style={styles.shiftValue}>{formatTime(activeShift.endTime)}</Text>
          </View>
          <View style={styles.shiftRow}>
            <Text style={styles.shiftLabel}>Total Hours:</Text>
            <Text style={styles.shiftValue}>{activeShift.totalHours}h</Text>
          </View>
        </View>
      )}

      {/* Assigned Bus Card */}
      {assignedBus && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Assigned Bus</Text>
          <View style={styles.busInfo}>
            <Text style={styles.busReg}>{assignedBus.registrationNumber}</Text>
            <View style={[styles.statusBadge, { backgroundColor: '#4CAF50' }]}>
              <Text style={styles.statusBadgeText}>{assignedBus.status.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.busModel}>{assignedBus.model}</Text>
          <Text style={styles.busCapacity}>Capacity: {assignedBus.capacity} passengers</Text>
        </View>
      )}

      {/* Today's Trips Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today's Trips ({todaysTrips.length})</Text>
        {todaysTrips.length === 0 ? (
          <Text style={styles.noTripsText}>No trips scheduled for today</Text>
        ) : (
          todaysTrips.map((trip) => (
            <View key={trip.id} style={styles.tripCard}>
              <View style={styles.tripHeader}>
                <Text style={styles.tripRoute}>{trip.route}</Text>
                <View
                  style={[
                    styles.tripStatusBadge,
                    { backgroundColor: getTripStatusColor(trip.status) },
                  ]}
                >
                  <Text style={styles.tripStatusText}>
                    {trip.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              <View style={styles.tripLocations}>
                <Text style={styles.tripLocation}>📍 {trip.startLocation}</Text>
                <Text style={styles.tripArrow}>→</Text>
                <Text style={styles.tripLocation}>📍 {trip.endLocation}</Text>
              </View>
              <View style={styles.tripTimes}>
                <Text style={styles.tripTime}>
                  Departure: {formatTime(trip.scheduledDeparture)}
                </Text>
                <Text style={styles.tripTime}>
                  Arrival: {formatTime(trip.scheduledArrival)}
                </Text>
              </View>
              {trip.passengers > 0 && (
                <Text style={styles.tripPassengers}>
                  👥 {trip.passengers} passengers
                </Text>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#007AFF',
    paddingTop: 50,
  },
  welcomeText: {
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
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileLabel: {
    fontSize: 14,
    color: '#666',
  },
  profileValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  shiftRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  shiftLabel: {
    fontSize: 14,
    color: '#666',
  },
  shiftValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  busInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  busReg: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  busModel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  busCapacity: {
    fontSize: 14,
    color: '#999',
  },
  noTripsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  tripCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripRoute: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  tripLocations: {
    marginBottom: 8,
  },
  tripStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tripStatusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tripLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  tripArrow: {
    fontSize: 14,
    color: '#999',
    marginVertical: 4,
  },
  tripTimes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  tripTime: {
    fontSize: 12,
    color: '#666',
  },
  tripPassengers: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
});
