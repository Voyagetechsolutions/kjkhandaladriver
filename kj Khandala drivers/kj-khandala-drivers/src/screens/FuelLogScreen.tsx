import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';
import { theme } from '../config/theme';

export const FuelLogScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [litres, setLitres] = useState('');
  const [costPerLiter, setCostPerLiter] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [fuelStation, setFuelStation] = useState('');
  const [odometerReading, setOdometerReading] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignedBus, setAssignedBus] = useState<any>(null);
  const [currentTrip, setCurrentTrip] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Auto-calculate total cost
    if (litres && costPerLiter) {
      const total = parseFloat(litres) * parseFloat(costPerLiter);
      setTotalCost(total.toFixed(2));
    }
  }, [litres, costPerLiter]);

  const loadData = async () => {
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
        .select('bus_id, trip_id')
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

      if (shift?.trip_id) {
        const { data: trip } = await supabase
          .from('trips')
          .select('*')
          .eq('id', shift.trip_id)
          .single();
        
        setCurrentTrip(trip);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!litres || !costPerLiter || !totalCost) {
      Alert.alert('Error', 'Please fill in litres, cost per liter, and total cost');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Not authenticated');

      // Get driver info
      const { data: driver } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', authUser.id)
        .single();

      if (!driver) throw new Error('Driver not found');

      // Insert fuel log
      const { error } = await supabase
        .from('fuel_logs')
        .insert({
          liters: parseFloat(litres),
          cost_per_liter: parseFloat(costPerLiter),
          total_cost: parseFloat(totalCost),
          filled_at: new Date().toISOString(),
          bus_id: assignedBus?.id || null,
          driver_id: driver.id,
          trip_id: currentTrip?.id || null,
          fuel_station: fuelStation || null,
          odometer_reading: odometerReading ? parseInt(odometerReading) : null,
          receipt_number: receiptNumber || null,
        });

      if (error) throw error;

      Alert.alert('Success', 'Fuel log saved successfully. Finance team will be notified.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error('Error saving fuel log:', error);
      Alert.alert('Error', error.message || 'Failed to save fuel log');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fuel Log</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Bus Info */}
        {isLoading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        ) : assignedBus && (
          <View style={styles.busInfo}>
            <Text style={styles.busInfoText}>🚌 {assignedBus.number_plate}</Text>
          </View>
        )}

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Required Fields</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Litres *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter litres"
              value={litres}
              onChangeText={setLitres}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cost per Liter (R) *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter cost per liter"
              value={costPerLiter}
              onChangeText={setCostPerLiter}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Total Cost (R) *</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              placeholder="Auto-calculated"
              value={totalCost}
              editable={false}
            />
          </View>

          <Text style={styles.sectionTitle}>Optional Fields</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fuel Station</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter fuel station name"
              value={fuelStation}
              onChangeText={setFuelStation}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Odometer Reading (km)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter odometer reading"
              value={odometerReading}
              onChangeText={setOdometerReading}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Receipt Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter receipt number"
              value={receiptNumber}
              onChangeText={setReceiptNumber}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Saving...' : 'Submit Fuel Log'}
            </Text>
          </TouchableOpacity>
        </View>
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
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  imageButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  imageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: theme.colors.secondary,
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
  busInfo: {
    backgroundColor: theme.colors.primary,
    margin: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  busInfoText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginTop: 8,
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
});
