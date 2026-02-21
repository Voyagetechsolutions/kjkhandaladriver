import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { supabase } from '../config/supabase';
import { theme } from '../config/theme';

export const PerformanceReportScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [driver, setDriver] = useState<any>(null);
  const [stats, setStats] = useState<any>({
    totalTrips: 0,
    completedTrips: 0,
    fuelLogs: 0,
    incidents: 0,
    inspections: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPerformanceData();
  }, []);

  const loadPerformanceData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get driver data
      const { data: driverData } = await supabase
        .from('drivers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setDriver(driverData);

      if (driverData) {
        // Get total trips from driver_shifts
        const { count: totalTrips } = await supabase
          .from('driver_shifts')
          .select('*', { count: 'exact', head: true })
          .eq('driver_id', driverData.id);

        // Get completed trips (past shifts)
        const today = new Date().toISOString().split('T')[0];
        const { count: completedTrips } = await supabase
          .from('driver_shifts')
          .select('*', { count: 'exact', head: true })
          .eq('driver_id', driverData.id)
          .lt('shift_date', today);

        // Get fuel logs count
        const { count: fuelLogs } = await supabase
          .from('fuel_logs')
          .select('*', { count: 'exact', head: true })
          .eq('driver_id', driverData.id);

        // Get incidents count
        const { count: incidents } = await supabase
          .from('incidents')
          .select('*', { count: 'exact', head: true })
          .eq('reported_by', user.id);

        // Get inspections count
        const { count: inspections } = await supabase
          .from('pre_trip_inspections')
          .select('*', { count: 'exact', head: true })
          .eq('driver_id', driverData.id);

        setStats({
          totalTrips: totalTrips || 0,
          completedTrips: completedTrips || 0,
          fuelLogs: fuelLogs || 0,
          incidents: incidents || 0,
          inspections: inspections || 0,
        });
      }
    } catch (error) {
      console.error('Error loading performance data:', error);
      Alert.alert('Error', 'Failed to load performance data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Performance Report</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  const completionRate = stats.totalTrips > 0 
    ? ((stats.completedTrips / stats.totalTrips) * 100).toFixed(1) 
    : '0.0';

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Performance Report</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Driver Info */}
        <View style={styles.driverCard}>
          <Text style={styles.driverName}>{driver?.full_name || 'Driver'}</Text>
          <Text style={styles.driverLicense}>License: {driver?.license_number || 'N/A'}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>⭐ {driver?.rating?.toFixed(1) || '0.0'}</Text>
            <Text style={styles.ratingLabel}>Overall Rating</Text>
          </View>
        </View>

        {/* Key Metrics */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Key Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>{stats.totalTrips}</Text>
              <Text style={styles.metricLabel}>Total Trips</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>{stats.completedTrips}</Text>
              <Text style={styles.metricLabel}>Completed</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={[styles.metricValue, { color: theme.colors.primary }]}>
                {completionRate}%
              </Text>
              <Text style={styles.metricLabel}>Completion Rate</Text>
            </View>
          </View>
        </View>

        {/* Safety Record */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🛡️ Safety Record</Text>
          <View style={styles.safetyGrid}>
            <View style={styles.safetyItem}>
              <View style={[styles.safetyIcon, { backgroundColor: '#4CAF50' }]}>
                <Text style={styles.safetyIconText}>✓</Text>
              </View>
              <View style={styles.safetyInfo}>
                <Text style={styles.safetyValue}>{stats.inspections}</Text>
                <Text style={styles.safetyLabel}>Pre-Trip Inspections</Text>
              </View>
            </View>
            <View style={styles.safetyItem}>
              <View style={[styles.safetyIcon, { backgroundColor: stats.incidents > 0 ? '#FF9800' : '#4CAF50' }]}>
                <Text style={styles.safetyIconText}>{stats.incidents > 0 ? '!' : '✓'}</Text>
              </View>
              <View style={styles.safetyInfo}>
                <Text style={styles.safetyValue}>{stats.incidents}</Text>
                <Text style={styles.safetyLabel}>Incidents Reported</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Fuel Management */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⛽ Fuel Management</Text>
          <View style={styles.fuelInfo}>
            <View style={styles.fuelRow}>
              <Text style={styles.fuelLabel}>Total Fuel Logs:</Text>
              <Text style={styles.fuelValue}>{stats.fuelLogs}</Text>
            </View>
            <View style={styles.fuelRow}>
              <Text style={styles.fuelLabel}>Average per Trip:</Text>
              <Text style={styles.fuelValue}>
                {stats.totalTrips > 0 ? (stats.fuelLogs / stats.totalTrips).toFixed(1) : '0.0'}
              </Text>
            </View>
          </View>
        </View>

        {/* Monthly Performance */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📅 This Month</Text>
          <View style={styles.monthlyStats}>
            <View style={styles.monthlyItem}>
              <Text style={styles.monthlyLabel}>Trips Completed</Text>
              <Text style={styles.monthlyValue}>{stats.completedTrips}</Text>
            </View>
            <View style={styles.monthlyItem}>
              <Text style={styles.monthlyLabel}>Fuel Efficiency</Text>
              <Text style={[styles.monthlyValue, { color: '#4CAF50' }]}>Good</Text>
            </View>
            <View style={styles.monthlyItem}>
              <Text style={styles.monthlyLabel}>Safety Score</Text>
              <Text style={[styles.monthlyValue, { color: '#4CAF50' }]}>
                {stats.incidents === 0 ? 'Excellent' : 'Good'}
              </Text>
            </View>
          </View>
        </View>

        {/* Status */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋 Current Status</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Driver Status:</Text>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: driver?.status === 'active' ? '#4CAF50' : '#999' }
            ]}>
              <Text style={styles.statusText}>{driver?.status?.toUpperCase() || 'INACTIVE'}</Text>
            </View>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>License Status:</Text>
            <View style={[styles.statusBadge, { backgroundColor: '#4CAF50' }]}>
              <Text style={styles.statusText}>VALID</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {driver?.notes && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📝 Performance Notes</Text>
            <Text style={styles.notesText}>{driver.notes}</Text>
          </View>
        )}

        {/* Export Button */}
        <TouchableOpacity style={styles.exportButton}>
          <Text style={styles.exportButtonText}>📥 Export Full Report</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  driverCard: {
    backgroundColor: theme.colors.secondary,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  driverName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  driverLicense: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 12,
  },
  ratingContainer: {
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  ratingLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metricBox: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.secondary,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  safetyGrid: {
    gap: 16,
  },
  safetyItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  safetyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  safetyIconText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  safetyInfo: {
    flex: 1,
  },
  safetyValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  safetyLabel: {
    fontSize: 14,
    color: '#666',
  },
  fuelInfo: {
    gap: 12,
  },
  fuelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  fuelLabel: {
    fontSize: 14,
    color: '#666',
  },
  fuelValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  monthlyStats: {
    gap: 12,
  },
  monthlyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  monthlyLabel: {
    fontSize: 14,
    color: '#666',
  },
  monthlyValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  exportButton: {
    backgroundColor: theme.colors.primary,
    margin: 16,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 32,
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
