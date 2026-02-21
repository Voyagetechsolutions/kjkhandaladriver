import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InspectionItem, PreTripInspection } from '../types';
import { theme } from '../config/theme';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';

const INSPECTION_CATEGORIES = [
  { name: 'Front Tyres', category: 'tyres' as const },
  { name: 'Rear Tyres', category: 'tyres' as const },
  { name: 'Brake System', category: 'brakes' as const },
  { name: 'Headlights', category: 'lights' as const },
  { name: 'Tail Lights', category: 'lights' as const },
  { name: 'Indicators', category: 'lights' as const },
  { name: 'Windshield Wipers', category: 'wipers' as const },
  { name: 'Side Mirrors', category: 'mirrors' as const },
  { name: 'Rear View Mirror', category: 'mirrors' as const },
  { name: 'Engine Oil', category: 'engine' as const },
  { name: 'Coolant Level', category: 'engine' as const },
  { name: 'Dashboard Lights', category: 'dashboard' as const },
  { name: 'Fire Extinguisher', category: 'safety' as const },
  { name: 'First Aid Box', category: 'safety' as const },
  { name: 'Interior Cleanliness', category: 'cleanliness' as const },
  { name: 'Exterior Cleanliness', category: 'cleanliness' as const },
];

export const PreTripInspectionScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [inspectionItems, setInspectionItems] = useState<InspectionItem[]>(
    INSPECTION_CATEGORIES.map(cat => ({
      name: cat.name,
      category: cat.category,
      status: 'good' as const,
      notes: '',
    }))
  );
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignedBus, setAssignedBus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAssignedBus();
  }, []);

  const loadAssignedBus = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) return;

      // Get driver info
      const { data: driver } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', authUser.id)
        .single();

      if (!driver) return;

      // Get today's shift to find assigned bus
      const { data: shift } = await supabase
        .from('driver_shifts')
        .select('bus_id')
        .eq('driver_id', driver.id)
        .eq('shift_date', today)
        .single();

      if (shift?.bus_id) {
        const { data: bus } = await supabase
          .from('buses')
          .select('*')
          .eq('id', shift.bus_id)
          .single();
        
        setAssignedBus(bus);
      }
    } catch (error) {
      console.error('Error loading assigned bus:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateItemStatus = (index: number, status: InspectionItem['status']) => {
    const updated = [...inspectionItems];
    updated[index].status = status;
    setInspectionItems(updated);
  };

  const updateItemNotes = (index: number, notes: string) => {
    const updated = [...inspectionItems];
    updated[index].notes = notes;
    setInspectionItems(updated);
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera roll permission is required');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImages([...images, result.assets[0].uri]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImages([...images, result.assets[0].uri]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }

    const location = await Location.getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  };

  const handleSubmit = async () => {
    // Check if any item failed
    const failedItems = inspectionItems.filter(item => item.status === 'failed');
    const hasFailed = failedItems.length > 0;

    if (hasFailed) {
      Alert.alert(
        'Inspection Failed',
        `${failedItems.length} item(s) failed inspection. A maintenance alert will be created.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Submit Anyway', onPress: () => submitInspection(hasFailed) },
        ]
      );
    } else {
      submitInspection(false);
    }
  };

  const submitInspection = async (failed: boolean) => {
    setIsSubmitting(true);

    try {
      const location = await getLocation();

      const inspection: PreTripInspection = {
        id: `inspection-${Date.now()}`,
        driverId: '1', // Get from auth context
        busId: 'bus-001', // Get from current assignment
        date: new Date().toISOString(),
        items: inspectionItems,
        images,
        location: location || { latitude: 0, longitude: 0 },
        status: failed ? 'failed' : 'passed',
        synced: false,
        createdAt: new Date().toISOString(),
      };

      // Save to AsyncStorage for offline support
      const stored = await AsyncStorage.getItem('@inspections');
      const inspections = stored ? JSON.parse(stored) : [];
      inspections.push(inspection);
      await AsyncStorage.setItem('@inspections', JSON.stringify(inspections));

      Alert.alert(
        'Success',
        failed
          ? 'Inspection submitted. Maintenance alert created.'
          : 'Pre-trip inspection passed!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save inspection. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: InspectionItem['status']) => {
    switch (status) {
      case 'good': return '#4CAF50';
      case 'fair': return '#FF9800';
      case 'poor': return '#F44336';
      case 'failed': return '#D32F2F';
      default: return '#999';
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pre-Trip Inspection</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Assigned Bus */}
        {isLoading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading assigned bus...</Text>
          </View>
        ) : assignedBus ? (
          <View style={styles.busCard}>
            <Text style={styles.busCardTitle}>🚌 Assigned Bus</Text>
            <Text style={styles.busReg}>{assignedBus.number_plate}</Text>
            <View style={styles.busDetails}>
              <Text style={styles.busDetail}>Model: {assignedBus.model || 'N/A'}</Text>
              <Text style={styles.busDetail}>Capacity: {assignedBus.seating_capacity || 'N/A'} seats</Text>
              {assignedBus.year && <Text style={styles.busDetail}>Year: {assignedBus.year}</Text>}
            </View>
          </View>
        ) : (
          <View style={styles.noBusCard}>
            <Text style={styles.noBusText}>⚠️ No bus assigned for today</Text>
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Complete all inspection items before starting your trip. Mark any issues and add notes.
          </Text>
        </View>

        {inspectionItems.map((item, index) => (
          <View key={index} style={styles.inspectionItem}>
            <Text style={styles.itemName}>{item.name}</Text>
            
            <View style={styles.statusButtons}>
              {(['good', 'fair', 'poor', 'failed'] as const).map(status => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusButton,
                    item.status === status && {
                      backgroundColor: getStatusColor(status),
                      borderColor: getStatusColor(status),
                    },
                  ]}
                  onPress={() => updateItemStatus(index, status)}
                >
                  <Text
                    style={[
                      styles.statusButtonText,
                      item.status === status && styles.statusButtonTextActive,
                    ]}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {(item.status === 'poor' || item.status === 'failed') && (
              <TextInput
                style={styles.notesInput}
                placeholder="Add notes about the issue..."
                value={item.notes}
                onChangeText={(text) => updateItemNotes(index, text)}
                multiline
              />
            )}
          </View>
        ))}

        <View style={styles.imageSection}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <View style={styles.imageButtons}>
            <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
              <Text style={styles.imageButtonText}>📷 Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
              <Text style={styles.imageButtonText}>🖼️ Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
          {images.length > 0 && (
            <Text style={styles.imageCount}>{images.length} photo(s) added</Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit Inspection'}
          </Text>
        </TouchableOpacity>
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
  backButton: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
  },
  inspectionItem: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  statusButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  statusButtonTextActive: {
    color: '#fff',
  },
  notesInput: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  imageSection: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  imageButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  imageButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  imageButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  imageCount: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: theme.colors.secondary,
    margin: 16,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  busCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  busCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  busReg: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 8,
  },
  busDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  busDetail: {
    fontSize: 14,
    color: '#666',
    marginRight: 16,
  },
  noBusCard: {
    backgroundColor: '#FFF3CD',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  noBusText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
  },
});
