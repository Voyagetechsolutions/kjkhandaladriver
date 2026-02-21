import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../config/supabase';
import { theme } from '../config/theme';

export const BusHealthScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [bus, setBus] = useState<any>(null);
  const [busHealth, setBusHealth] = useState<any>(null);
  const [healthHistory, setHealthHistory] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBusHealth();
  }, []);

  const loadBusHealth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: driver } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!driver) return;

      // Get current bus from today's shift
      const today = new Date().toISOString().split('T')[0];
      const { data: shift } = await supabase
        .from('driver_shifts')
        .select('bus_id')
        .eq('driver_id', driver.id)
        .eq('shift_date', today)
        .single();

      if (!shift?.bus_id) {
        setIsLoading(false);
        return;
      }

      // Get bus details
      const { data: busData } = await supabase
        .from('buses')
        .select('*')
        .eq('id', shift.bus_id)
        .single();

      setBus(busData);

      // Get latest bus health record
      const { data: latestHealth } = await supabase
        .from('bus_health')
        .select('*')
        .eq('bus_id', shift.bus_id)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single();

      setBusHealth(latestHealth);

      // Get health history
      const { data: history } = await supabase
        .from('bus_health')
        .select('*')
        .eq('bus_id', shift.bus_id)
        .order('recorded_at', { ascending: false })
        .limit(10);

      setHealthHistory(history || []);
    } catch (error) {
      console.error('Error loading bus health:', error);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadBusHealth();
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bus Health</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  if (!bus) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bus Health</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyText}>No bus assigned for today</Text>
        </View>
      </View>
    );
  }

  const getHealthStatus = (score: number | null) => {
    if (!score) return { text: 'Unknown', color: '#999' };
    if (score >= 80) return { text: 'Excellent', color: '#4CAF50' };
    if (score >= 60) return { text: 'Good', color: '#8BC34A' };
    if (score >= 40) return { text: 'Fair', color: '#FF9800' };
    return { text: 'Poor', color: '#F44336' };
  };

  const healthStatus = getHealthStatus(busHealth?.health_score);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bus Health</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        {/* Bus Info */}
        <View style={styles.busCard}>
          <Text style={styles.busNumber}>{bus.number_plate}</Text>
          <Text style={styles.busModel}>{bus.model}</Text>
        </View>

        {/* Current Health Status */}
        {busHealth && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Current Health Status</Text>
              <View style={[styles.statusBadge, { backgroundColor: healthStatus.color }]}>
                <Text style={styles.statusBadgeText}>{healthStatus.text}</Text>
              </View>
            </View>
            
            <View style={styles.healthScoreContainer}>
              <Text style={styles.healthScore}>{busHealth.health_score || 'N/A'}</Text>
              <Text style={styles.healthScoreLabel}>Health Score</Text>
            </View>

            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Status:</Text>
              <Text style={[styles.statusValue, { 
                color: busHealth.status === 'operational' ? '#4CAF50' : '#F44336' 
              }]}>
                {busHealth.status?.toUpperCase() || 'UNKNOWN'}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Recorded:</Text>
              <Text style={styles.statusValue}>
                {new Date(busHealth.recorded_at).toLocaleString()}
              </Text>
            </View>
            {busHealth.mileage && (
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Mileage:</Text>
                <Text style={styles.statusValue}>{busHealth.mileage.toLocaleString()} km</Text>
              </View>
            )}
          </View>
        )}

        {/* Technical Readings */}
        {busHealth && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🔧 Technical Readings</Text>
            {busHealth.engine_temp && (
              <View style={styles.readingRow}>
                <Text style={styles.readingLabel}>Engine Temperature:</Text>
                <Text style={[styles.readingValue, busHealth.engine_temp > 100 && { color: '#F44336' }]}>
                  {busHealth.engine_temp}°C
                </Text>
              </View>
            )}
            {busHealth.oil_level && (
              <View style={styles.readingRow}>
                <Text style={styles.readingLabel}>Oil Level:</Text>
                <Text style={styles.readingValue}>{busHealth.oil_level}%</Text>
              </View>
            )}
            {busHealth.tire_pressure && (
              <View style={styles.readingRow}>
                <Text style={styles.readingLabel}>Tire Pressure:</Text>
                <Text style={styles.readingValue}>{busHealth.tire_pressure} PSI</Text>
              </View>
            )}
            {busHealth.battery_voltage && (
              <View style={styles.readingRow}>
                <Text style={styles.readingLabel}>Battery Voltage:</Text>
                <Text style={styles.readingValue}>{busHealth.battery_voltage}V</Text>
              </View>
            )}
            {busHealth.brake_condition && (
              <View style={styles.readingRow}>
                <Text style={styles.readingLabel}>Brake Condition:</Text>
                <Text style={styles.readingValue}>{busHealth.brake_condition}%</Text>
              </View>
            )}
          </View>
        )}

        {/* Issues & Maintenance */}
        {busHealth?.issues && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>⚠️ Reported Issues</Text>
            <Text style={styles.issuesText}>{busHealth.issues}</Text>
            {busHealth.requires_maintenance && (
              <View style={styles.maintenanceAlert}>
                <Text style={styles.maintenanceAlertText}>🔧 Maintenance Required</Text>
              </View>
            )}
          </View>
        )}

        {/* Fault Codes */}
        {busHealth?.fault_codes && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🚨 Fault Codes</Text>
            <Text style={styles.faultCodesText}>{busHealth.fault_codes}</Text>
          </View>
        )}

        {/* Health History */}
        {healthHistory.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📊 Health History</Text>
            {healthHistory.map((record: any) => (
              <View key={record.id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyDate}>
                    {new Date(record.recorded_at).toLocaleDateString()}
                  </Text>
                  <View style={[styles.historyBadge, { 
                    backgroundColor: getHealthStatus(record.health_score).color 
                  }]}>
                    <Text style={styles.historyBadgeText}>{record.health_score || 'N/A'}</Text>
                  </View>
                </View>
                <Text style={styles.historyStatus}>Status: {record.status}</Text>
                {record.is_auto_detected && (
                  <Text style={styles.autoDetected}>🤖 Auto-detected</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical': return '#D32F2F';
    case 'high': return '#F44336';
    case 'medium': return '#FF9800';
    case 'low': return '#4CAF50';
    default: return '#999';
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'major': return '#F44336';
    case 'moderate': return '#FF9800';
    case 'minor': return '#FFC107';
    default: return '#999';
  }
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
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  urgentText: {
    color: '#F44336',
  },
  ticketCard: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  ticketDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  ticketDate: {
    fontSize: 12,
    color: '#999',
  },
  issueCard: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  issueTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  occurrences: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
  },
  issueDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  severityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  severityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  serviceCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  serviceDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  serviceCost: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  serviceType: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  serviceMileage: {
    fontSize: 12,
    color: '#999',
  },
  backButton: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  busCard: {
    backgroundColor: theme.colors.secondary,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  busNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  busModel: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  healthScoreContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 12,
  },
  healthScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  healthScoreLabel: {
    fontSize: 14,
    color: '#666',
  },
  readingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  readingLabel: {
    fontSize: 14,
    color: '#666',
  },
  readingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  issuesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  maintenanceAlert: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  maintenanceAlertText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E65100',
  },
  faultCodesText: {
    fontSize: 14,
    color: '#D32F2F',
    fontFamily: 'monospace',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
  },
  historyCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  historyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  historyBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  historyStatus: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  autoDetected: {
    fontSize: 12,
    color: '#007AFF',
    fontStyle: 'italic',
  },
});
