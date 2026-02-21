import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../config/supabase';
import { theme } from '../config/theme';

export const MyShiftsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [groupedShifts, setGroupedShifts] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadShifts();
  }, []);

  const loadShifts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: driver } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!driver) return;

      const { data: shifts } = await supabase
        .from('driver_shifts')
        .select(`
          *,
          buses:bus_id(number_plate, model),
          routes:route_id(name, origin, destination)
        `)
        .eq('driver_id', driver.id)
        .order('shift_date', { ascending: true });

      if (shifts) {
        // Get trip counts for each shift
        const shiftsWithCounts = await Promise.all(
          shifts.map(async (shift) => {
            const { count } = await supabase
              .from('trips')
              .select('*', { count: 'exact', head: true })
              .eq('shift_id', shift.id);
            
            return { ...shift, trip_count: count || 0 };
          })
        );

        const grouped = groupShiftsByDate(shiftsWithCounts);
        setGroupedShifts(grouped);
      }
    } catch (error) {
      console.error('Error loading shifts:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const groupShiftsByDate = (shifts: any[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const groups: any = {
      today: [],
      upcoming: [],
    };

    shifts.forEach((shift) => {
      const shiftDate = new Date(shift.shift_date);
      shiftDate.setHours(0, 0, 0, 0);

      if (shiftDate.getTime() === today.getTime()) {
        groups.today.push(shift);
      } else if (shiftDate > today) {
        groups.upcoming.push(shift);
      }
    });

    return groups;
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadShifts();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return '#4CAF50';
      case 'active': return '#4CAF50';
      case 'pending': return '#9E9E9E';
      case 'cancelled': return '#F44336';
      default: return '#2196F3';
    }
  };

  const getShiftStatus = (shift: any) => {
    const now = new Date();
    const shiftDate = new Date(shift.shift_date);
    const startTime = new Date(`${shift.shift_date}T${shift.start_time}`);
    const endTime = new Date(`${shift.shift_date}T${shift.end_time}`);

    if (shift.status === 'completed') return 'Completed';
    if (shift.status === 'cancelled') return 'Cancelled';
    if (now >= startTime && now <= endTime) return 'Active';
    if (now < startTime) return 'Pending';
    return shift.status || 'Pending';
  };

  const formatTime = (time: string) => {
    if (!time) return 'N/A';
    return time.substring(0, 5);
  };

  const handleViewTrips = (shiftId: string) => {
    navigation.navigate('MyTrips', { shiftId });
  };

  const handleViewShiftDetails = (shift: any) => {
    navigation.navigate('ShiftDetails', { shiftId: shift.id });
  };

  const renderShiftCard = (shift: any) => {
    const status = getShiftStatus(shift);

    return (
      <View key={shift.id} style={styles.shiftCard}>
        <View style={styles.shiftHeader}>
          <View style={styles.shiftHeaderLeft}>
            <Text style={styles.shiftType}>{shift.shift_type || 'Shift'}</Text>
            <Text style={styles.shiftTime}>
              {formatTime(shift.start_time)} → {formatTime(shift.end_time)}
            </Text>
            {shift.trip_count > 0 && (
              <Text style={styles.tripCount}> {shift.trip_count} Trip{shift.trip_count > 1 ? 's' : ''} Assigned</Text>
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
            <Text style={styles.statusText}>{status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.shiftDetails}>
          {shift.routes && (
            <Text style={styles.detailText}> {shift.routes.name || `${shift.routes.origin} → ${shift.routes.destination}`}</Text>
          )}
          {shift.buses && (
            <Text style={styles.detailText}> {shift.buses.number_plate}</Text>
          )}
        </View>

        <View style={styles.shiftActions}>
          <TouchableOpacity
            style={styles.viewTripsButton}
            onPress={() => handleViewTrips(shift.id)}
          >
            <Text style={styles.viewTripsButtonText}>View Trips</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => handleViewShiftDetails(shift)}
          >
            <Text style={styles.detailsButtonText}>Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.headerTitle}>My Shifts</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.headerTitle}>My Shifts</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        {/* Today */}
        {groupedShifts.today?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today</Text>
            {groupedShifts.today.map((shift: any) => renderShiftCard(shift))}
          </View>
        )}

        {/* Upcoming */}
        {groupedShifts.upcoming?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming</Text>
            {groupedShifts.upcoming.map((shift: any) => renderShiftCard(shift))}
          </View>
        )}

        {/* Empty State */}
        {!groupedShifts.today?.length && !groupedShifts.upcoming?.length && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No shifts assigned</Text>
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
    marginBottom: 8,
  },
  shiftCard: {
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
  pastShiftCard: {
    opacity: 0.7,
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  shiftDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: theme.colors.secondary,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  shiftDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  shiftHeaderLeft: {
    flex: 1,
  },
  shiftType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  shiftTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  tripCount: {
    fontSize: 14,
    color: theme.colors.secondary,
    fontWeight: '600',
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  shiftActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  viewTripsButton: {
    flex: 1,
    backgroundColor: theme.colors.secondary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewTripsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  detailsButton: {
    flex: 1,
    backgroundColor: '#9E9E9E',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
