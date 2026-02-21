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
import * as Location from 'expo-location';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';
import { theme } from '../config/theme';

const INCIDENT_TYPES = ['breakdown', 'accident', 'mechanical', 'electrical', 'other'] as const;
const SEVERITY_LEVELS = ['low', 'medium', 'high', 'critical'] as const;

export const BreakdownReportScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [incidentType, setIncidentType] = useState<typeof INCIDENT_TYPES[number]>('breakdown');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<typeof SEVERITY_LEVELS[number]>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignedBus, setAssignedBus] = useState<any>(null);
  const [currentTrip, setCurrentTrip] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

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

      // Get today's shift to find assigned bus and trip
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

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return null;
      }

      const location = await Location.getCurrentPositionAsync({});
      return `${location.coords.latitude},${location.coords.longitude}`;
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'Please provide a title and description');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Not authenticated');

      // Get location
      const location = await getLocation();

      // Insert incident
      const { error } = await supabase
        .from('incidents')
        .insert({
          title: title.trim(),
          incident_type: incidentType,
          severity,
          location,
          description: description.trim(),
          occurred_at: new Date().toISOString(),
          bus_id: assignedBus?.id || null,
          trip_id: currentTrip?.id || null,
          reported_by: authUser.id,
          status: 'reported',
        });

      if (error) throw error;

      Alert.alert(
        'Success',
        'Incident reported successfully. Maintenance team and dispatch have been notified.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      console.error('Error submitting incident:', error);
      Alert.alert('Error', error.message || 'Failed to submit incident report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSeverityColor = (level: typeof SEVERITY_LEVELS[number]) => {
    switch (level) {
      case 'critical': return '#D32F2F';
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Breakdown</Text>
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
            <Text style={styles.label}>Incident Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="Brief title of the incident"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Incident Type *</Text>
            <View style={styles.optionButtons}>
              {INCIDENT_TYPES.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.optionButton, incidentType === t && styles.optionButtonActive]}
                  onPress={() => setIncidentType(t)}
                >
                  <Text style={[styles.optionText, incidentType === t && styles.optionTextActive]}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Severity Level *</Text>
            <View style={styles.optionButtons}>
              {SEVERITY_LEVELS.map(level => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.severityButton,
                    severity === level && {
                      backgroundColor: getSeverityColor(level),
                      borderColor: getSeverityColor(level),
                    },
                  ]}
                  onPress={() => setSeverity(level)}
                >
                  <Text
                    style={[
                      styles.severityText,
                      severity === level && styles.severityTextActive,
                    ]}
                  >
                    {level.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the incident in detail..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              📍 Location will be captured automatically when you submit
            </Text>
          </View>

          <TouchableOpacity style={styles.imageButton}>
            <Text style={styles.imageButtonText}>📷 Add Photos/Videos</Text>
          </TouchableOpacity>

          <View style={styles.locationInfo}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>Location will be captured automatically</Text>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  optionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  optionButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  optionTextActive: {
    color: '#fff',
  },
  severityButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  severityText: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  severityTextActive: {
    color: '#fff',
  },
  imageButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  imageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  locationIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#2E7D32',
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
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoText: {
    fontSize: 14,
    color: '#1565C0',
  },
});
