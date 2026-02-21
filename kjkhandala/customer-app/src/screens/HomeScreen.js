import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import { COLORS } from '../config/constants';

export default function HomeScreen() {
  const navigation = useNavigation();
  const auth = useAuth();
  const user = auth?.user;
  const profile = auth?.profile;
  
  const [cities, setCities] = useState([]);
  const [popularRoutes, setPopularRoutes] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    date: new Date().toISOString().split('T')[0],
    returnDate: '',
    passengers: 1,
    tripType: 'one-way',
  });

  const [showCityModal, setShowCityModal] = useState(false);
  const [cityModalType, setCityModalType] = useState('origin');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState('departure');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load cities
      const { data: citiesData } = await supabase
        .from('cities')
        .select('*')
        .order('name');
      if (citiesData) setCities(citiesData);

      // Load popular routes
      const { data: routesData } = await supabase
        .from('routes')
        .select('*, origin_city:cities!origin_city_id(name), destination_city:cities!destination_city_id(name)')
        .eq('status', 'active')
        .limit(5);
      if (routesData) setPopularRoutes(routesData);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchParams.origin || !searchParams.destination) {
      Alert.alert('Error', 'Please select origin and destination');
      return;
    }

    if (searchParams.origin === searchParams.destination) {
      Alert.alert('Error', 'Origin and destination cannot be the same');
      return;
    }

    if (searchParams.tripType === 'return' && !searchParams.returnDate) {
      Alert.alert('Error', 'Please select a return date');
      return;
    }

    navigation.navigate('SearchResults', searchParams);
  };

  const handleQuickRoute = (route) => {
    navigation.navigate('SearchResults', {
      origin: route.origin_city_id,
      destination: route.destination_city_id,
      date: new Date().toISOString().split('T')[0],
      passengers: 1,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Hello, {profile?.full_name?.split(' ')[0] || 'Guest'}! 👋
        </Text>
        <Text style={styles.subtitle}>Where would you like to go?</Text>
      </View>

      {/* Search Card */}
      <View style={styles.searchCard}>
        <Text style={styles.searchTitle}>Book Your Trip</Text>
        
        {/* Origin */}
        <TouchableOpacity
          style={styles.input}
          onPress={() => {
            setCityModalType('origin');
            setShowCityModal(true);
          }}
        >
          <Text style={searchParams.origin ? styles.inputText : styles.placeholder}>
            {searchParams.origin 
              ? cities.find(c => c.name === searchParams.origin)?.name 
              : '📍 From'}
          </Text>
        </TouchableOpacity>

        {/* Destination */}
        <TouchableOpacity
          style={styles.input}
          onPress={() => {
            setCityModalType('destination');
            setShowCityModal(true);
          }}
        >
          <Text style={searchParams.destination ? styles.inputText : styles.placeholder}>
            {searchParams.destination 
              ? cities.find(c => c.name === searchParams.destination)?.name 
              : '📍 To'}
          </Text>
        </TouchableOpacity>

        {/* Trip Type */}
        <View style={styles.tripTypeContainer}>
          <TouchableOpacity
            style={[
              styles.tripTypeBtn,
              searchParams.tripType === 'one-way' && styles.tripTypeBtnActive,
            ]}
            onPress={() => setSearchParams({ ...searchParams, tripType: 'one-way' })}
          >
            <Text
              style={[
                styles.tripTypeText,
                searchParams.tripType === 'one-way' && styles.tripTypeTextActive,
              ]}
            >
              One-Way
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tripTypeBtn,
              searchParams.tripType === 'return' && styles.tripTypeBtnActive,
            ]}
            onPress={() => setSearchParams({ ...searchParams, tripType: 'return' })}
          >
            <Text
              style={[
                styles.tripTypeText,
                searchParams.tripType === 'return' && styles.tripTypeTextActive,
              ]}
            >
              Return
            </Text>
          </TouchableOpacity>
        </View>

        {/* Departure Date */}
        <TouchableOpacity
          style={styles.input}
          onPress={() => {
            setDatePickerType('departure');
            setShowDatePicker(true);
          }}
        >
          <Text style={styles.inputText}>
            📅 Departure: {new Date(searchParams.date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </TouchableOpacity>

        {/* Return Date */}
        {searchParams.tripType === 'return' && (
          <TouchableOpacity
            style={styles.input}
            onPress={() => {
              setDatePickerType('return');
              setShowDatePicker(true);
            }}
          >
            <Text style={searchParams.returnDate ? styles.inputText : styles.placeholder}>
              {searchParams.returnDate
                ? `📅 Return: ${new Date(searchParams.returnDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}`
                : '📅 Select Return Date'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Passengers */}
        <View style={styles.passengersRow}>
          <Text style={styles.label}>Passengers</Text>
          <View style={styles.counter}>
            <TouchableOpacity
              style={styles.counterBtn}
              onPress={() => setSearchParams({
                ...searchParams,
                passengers: Math.max(1, searchParams.passengers - 1),
              })}
            >
              <Text style={styles.counterBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.counterValue}>{searchParams.passengers}</Text>
            <TouchableOpacity
              style={styles.counterBtn}
              onPress={() => setSearchParams({
                ...searchParams,
                passengers: Math.min(10, searchParams.passengers + 1),
              })}
            >
              <Text style={styles.counterBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Button */}
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchBtnText}>🔍 Search Trips</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('MyTrips')}
          >
            <Text style={styles.actionIcon}>🎫</Text>
            <Text style={styles.actionText}>My Trips</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Promotions')}
          >
            <Text style={styles.actionIcon}>🎁</Text>
            <Text style={styles.actionText}>Promotions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Support')}
          >
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionText}>Support</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.actionIcon}>👤</Text>
            <Text style={styles.actionText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Popular Routes */}
      {popularRoutes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Routes</Text>
          {popularRoutes.map((route) => (
            <TouchableOpacity
              key={route.id}
              style={styles.routeCard}
              onPress={() => handleQuickRoute(route)}
            >
              <View style={styles.routeInfo}>
                <Text style={styles.routeText}>
                  {route.origin.name} → {route.destination.name}
                </Text>
                <Text style={styles.routeSubtext}>
                  {route.distance} km • {route.duration}
                </Text>
              </View>
              <Text style={styles.routePrice}>From BWP {route.base_fare}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Announcements */}
      <View style={styles.section}>
        <View style={styles.announcementCard}>
          <Text style={styles.announcementIcon}>📢</Text>
          <View style={styles.announcementContent}>
            <Text style={styles.announcementTitle}>Travel Safe</Text>
            <Text style={styles.announcementText}>
              Please arrive 30 minutes before departure time
            </Text>
          </View>
        </View>
      </View>

      {/* Emergency Contact */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.emergencyCard}
          onPress={() => Alert.alert('Emergency', 'Call +267 1234 5678')}
        >
          <Text style={styles.emergencyIcon}>🚨</Text>
          <Text style={styles.emergencyText}>Emergency Contact</Text>
        </TouchableOpacity>
      </View>

      {/* City Picker Modal */}
      <Modal
        visible={showCityModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select {cityModalType === 'origin' ? 'Origin' : 'Destination'}
              </Text>
              <TouchableOpacity onPress={() => setShowCityModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={cities}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.cityItem}
                  onPress={() => {
                    setSearchParams({
                      ...searchParams,
                      [cityModalType]: item.name,
                    });
                    setShowCityModal(false);
                  }}
                >
                  <Text style={styles.cityName}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select {datePickerType === 'departure' ? 'Departure' : 'Return'} Date
              </Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.dateInput}
              value={datePickerType === 'departure' ? searchParams.date : searchParams.returnDate}
              onChangeText={(date) => {
                if (datePickerType === 'departure') {
                  setSearchParams({ ...searchParams, date });
                } else {
                  setSearchParams({ ...searchParams, returnDate: date });
                }
              }}
              placeholder="YYYY-MM-DD"
            />
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.modalButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
  },
  searchCard: {
    backgroundColor: COLORS.white,
    margin: 15,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 15,
  },
  input: {
    backgroundColor: COLORS.gray[100],
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
  },
  inputText: {
    fontSize: 16,
    color: COLORS.dark,
  },
  placeholder: {
    fontSize: 16,
    color: COLORS.gray[400],
  },
  passengersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: COLORS.dark,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterBtn: {
    backgroundColor: COLORS.primary,
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterBtnText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  counterValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20,
    color: COLORS.dark,
  },
  searchBtn: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  searchBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 15,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: COLORS.white,
    width: '48%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    color: COLORS.dark,
    fontWeight: '600',
  },
  routeCard: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  routeInfo: {
    flex: 1,
  },
  routeText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  routeSubtext: {
    fontSize: 14,
    color: COLORS.gray[500],
  },
  routePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  announcementCard: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  announcementIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  announcementContent: {
    flex: 1,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 4,
  },
  announcementText: {
    fontSize: 14,
    color: COLORS.gray[600],
  },
  emergencyCard: {
    backgroundColor: COLORS.danger,
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  emergencyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  modalClose: {
    fontSize: 24,
    color: COLORS.gray[500],
  },
  cityItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  cityName: {
    fontSize: 16,
    color: COLORS.dark,
  },
  dateInput: {
    backgroundColor: COLORS.gray[100],
    padding: 16,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  tripTypeContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  tripTypeBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  tripTypeBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  tripTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[600],
  },
  tripTypeTextActive: {
    color: COLORS.white,
  },
});
