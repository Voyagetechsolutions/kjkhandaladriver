import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation, useRoute } from '@react-navigation/native';
import { tripService } from '../services/tripService';
import { COLORS } from '../config/constants';

const { width, height } = Dimensions.get('window');

export default function LiveTrackingScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { tripId } = route.params;
  const mapRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState(null);
  const [busLocation, setBusLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    loadTripData();
    subscribeToLocation();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [tripId]);

  const loadTripData = async () => {
    try {
      setLoading(true);
      
      // Load trip details
      const { data: tripData, error: tripError } = await tripService.getTripDetails(tripId);
      if (tripError) throw tripError;
      setTrip(tripData);

      // Load current bus location
      const { data: locationData, error: locationError } = await tripService.trackBus(tripId);
      if (!locationError && locationData) {
        setBusLocation({
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          speed: locationData.speed,
          heading: locationData.heading,
        });

        // Center map on bus location
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        }
      }

      // Load route coordinates (you can get this from your routes table or Google Directions API)
      // For now, using sample coordinates
      setRouteCoordinates([
        { latitude: tripData.route.origin.latitude, longitude: tripData.route.origin.longitude },
        { latitude: tripData.route.destination.latitude, longitude: tripData.route.destination.longitude },
      ]);

    } catch (error) {
      console.error('Error loading trip data:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToLocation = () => {
    const sub = tripService.subscribeToBusLocation(tripId, (newLocation) => {
      setBusLocation({
        latitude: newLocation.latitude,
        longitude: newLocation.longitude,
        speed: newLocation.speed,
        heading: newLocation.heading,
      });

      // Animate map to new location
      if (mapRef.current) {
        mapRef.current.animateCamera({
          center: {
            latitude: newLocation.latitude,
            longitude: newLocation.longitude,
          },
        });
      }
    });

    setSubscription(sub);
  };

  const calculateETA = () => {
    if (!busLocation || !trip) return 'Calculating...';
    
    // Calculate distance and ETA based on current location and destination
    // This is a simplified calculation - you should use a proper routing API
    const arrivalTime = new Date(trip.arrival_time);
    const now = new Date();
    const diff = arrivalTime - now;
    
    if (diff < 0) return 'Arrived';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} minutes`;
  };

  const getStatusColor = () => {
    if (!trip) return COLORS.gray[500];
    
    switch (trip.status) {
      case 'boarding':
        return COLORS.warning;
      case 'departed':
      case 'in_progress':
        return COLORS.success;
      case 'delayed':
        return COLORS.danger;
      case 'completed':
        return COLORS.gray[500];
      default:
        return COLORS.primary;
    }
  };

  const getStatusText = () => {
    if (!trip) return 'Loading...';
    
    switch (trip.status) {
      case 'boarding':
        return 'Boarding Now';
      case 'departed':
        return 'On The Way';
      case 'in_progress':
        return 'In Transit';
      case 'delayed':
        return 'Delayed';
      case 'completed':
        return 'Arrived';
      default:
        return trip.status.toUpperCase();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading tracking information...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: busLocation?.latitude || -24.6282,
          longitude: busLocation?.longitude || 25.9231,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        showsUserLocation
        showsMyLocationButton
      >
        {/* Route Line */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={COLORS.primary}
            strokeWidth={4}
            lineDashPattern={[1]}
          />
        )}

        {/* Origin Marker */}
        {trip && (
          <Marker
            coordinate={{
              latitude: trip.route.origin.latitude,
              longitude: trip.route.origin.longitude,
            }}
            title={trip.route.origin.name}
            description="Departure Point"
            pinColor={COLORS.success}
          />
        )}

        {/* Destination Marker */}
        {trip && (
          <Marker
            coordinate={{
              latitude: trip.route.destination.latitude,
              longitude: trip.route.destination.longitude,
            }}
            title={trip.route.destination.name}
            description="Destination"
            pinColor={COLORS.danger}
          />
        )}

        {/* Bus Location Marker */}
        {busLocation && (
          <Marker
            coordinate={busLocation}
            title="Your Bus"
            description={`${trip.bus.registration_number} - ${busLocation.speed || 0} km/h`}
            rotation={busLocation.heading || 0}
          >
            <View style={styles.busMarker}>
              <Text style={styles.busIcon}>🚌</Text>
            </View>
          </Marker>
        )}
      </MapView>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Tracking</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        {/* Status */}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>

        {/* Route */}
        <Text style={styles.routeText}>
          {trip.route.origin.name} → {trip.route.destination.name}
        </Text>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>🕐</Text>
            <Text style={styles.statLabel}>ETA</Text>
            <Text style={styles.statValue}>{calculateETA()}</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statIcon}>⚡</Text>
            <Text style={styles.statLabel}>Speed</Text>
            <Text style={styles.statValue}>
              {busLocation?.speed || 0} km/h
            </Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statIcon}>📍</Text>
            <Text style={styles.statLabel}>Distance</Text>
            <Text style={styles.statValue}>
              {trip.route.distance} km
            </Text>
          </View>
        </View>

        {/* Driver Info */}
        <View style={styles.driverInfo}>
          <View style={styles.driverAvatar}>
            <Text style={styles.driverIcon}>👨‍✈️</Text>
          </View>
          <View style={styles.driverDetails}>
            <Text style={styles.driverName}>{trip.driver.full_name}</Text>
            <Text style={styles.driverRole}>Your Driver</Text>
          </View>
          <TouchableOpacity style={styles.callBtn}>
            <Text style={styles.callBtnText}>📞 Call</Text>
          </TouchableOpacity>
        </View>

        {/* Bus Info */}
        <View style={styles.busInfo}>
          <View style={styles.busInfoRow}>
            <Text style={styles.busInfoLabel}>Bus Number</Text>
            <Text style={styles.busInfoValue}>
              {trip.bus.registration_number}
            </Text>
          </View>
          <View style={styles.busInfoRow}>
            <Text style={styles.busInfoLabel}>Bus Type</Text>
            <Text style={styles.busInfoValue}>{trip.bus.bus_type}</Text>
          </View>
        </View>

        {/* Next Stop */}
        {trip.status === 'in_progress' && (
          <View style={styles.nextStop}>
            <Text style={styles.nextStopLabel}>Next Stop</Text>
            <Text style={styles.nextStopValue}>
              {trip.route.destination.name}
            </Text>
            <Text style={styles.nextStopEta}>Arriving in {calculateETA()}</Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('TripDetails', { 
              bookingId: route.params.bookingId 
            })}
          >
            <Text style={styles.actionButtonText}>View Ticket</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonPrimary]}
            onPress={() => {
              // Share location or get directions
            }}
          >
            <Text style={[styles.actionButtonText, styles.actionButtonTextPrimary]}>
              Share Location
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.gray[600],
  },
  map: {
    width: width,
    height: height,
  },
  busMarker: {
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  busIcon: {
    fontSize: 24,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    padding: 15,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backBtn: {
    padding: 5,
  },
  backBtnText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  placeholder: {
    width: 50,
  },
  infoCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    maxHeight: height * 0.6,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  routeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.gray[100],
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray[600],
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  driverIcon: {
    fontSize: 28,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  driverRole: {
    fontSize: 14,
    color: COLORS.gray[600],
  },
  callBtn: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  callBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  busInfo: {
    marginBottom: 15,
  },
  busInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  busInfoLabel: {
    fontSize: 14,
    color: COLORS.gray[600],
  },
  busInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
  },
  nextStop: {
    backgroundColor: COLORS.primary + '10',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  nextStopLabel: {
    fontSize: 12,
    color: COLORS.gray[600],
    marginBottom: 4,
  },
  nextStopValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  nextStopEta: {
    fontSize: 14,
    color: COLORS.gray[700],
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.gray[100],
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonPrimary: {
    backgroundColor: COLORS.primary,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  actionButtonTextPrimary: {
    color: COLORS.white,
  },
});
