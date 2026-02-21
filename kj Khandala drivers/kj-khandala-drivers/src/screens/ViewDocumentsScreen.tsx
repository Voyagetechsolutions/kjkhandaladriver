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

export const ViewDocumentsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [driver, setDriver] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDriverDocuments();
  }, []);

  const loadDriverDocuments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: driverData } = await supabase
        .from('drivers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setDriver(driverData);
    } catch (error) {
      console.error('Error loading documents:', error);
      Alert.alert('Error', 'Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const getExpiryStatus = (expiryDate: string | null) => {
    if (!expiryDate) return { text: 'Not Set', color: '#999' };
    
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return { text: 'Expired', color: '#D32F2F' };
    if (daysUntilExpiry < 30) return { text: `Expires in ${daysUntilExpiry} days`, color: '#FF9800' };
    return { text: 'Valid', color: '#4CAF50' };
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>View Documents</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  const licenseStatus = getExpiryStatus(driver?.license_expiry);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>View Documents</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Driver License */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🪪 Driver's License</Text>
            <View style={[styles.statusBadge, { backgroundColor: licenseStatus.color }]}>
              <Text style={styles.statusText}>{licenseStatus.text}</Text>
            </View>
          </View>
          
          <View style={styles.documentInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>License Number:</Text>
              <Text style={styles.infoValue}>{driver?.license_number || 'Not Provided'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Issue Date:</Text>
              <Text style={styles.infoValue}>
                {driver?.created_at ? new Date(driver.created_at).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Expiry Date:</Text>
              <Text style={styles.infoValue}>
                {driver?.license_expiry ? new Date(driver.license_expiry).toLocaleDateString() : 'Not Set'}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.viewButton}>
            <Text style={styles.viewButtonText}>📄 View Document</Text>
          </TouchableOpacity>
        </View>

        {/* Professional Driving Permit */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>📋 Professional Driving Permit (PDP)</Text>
            <View style={[styles.statusBadge, { backgroundColor: '#4CAF50' }]}>
              <Text style={styles.statusText}>Valid</Text>
            </View>
          </View>
          
          <View style={styles.documentInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>PDP Number:</Text>
              <Text style={styles.infoValue}>PDP-{driver?.id?.slice(0, 8)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Expiry Date:</Text>
              <Text style={styles.infoValue}>
                {driver?.license_expiry ? new Date(driver.license_expiry).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.viewButton}>
            <Text style={styles.viewButtonText}>📄 View Document</Text>
          </TouchableOpacity>
        </View>

        {/* Medical Certificate */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🏥 Medical Certificate</Text>
            <View style={[styles.statusBadge, { backgroundColor: '#4CAF50' }]}>
              <Text style={styles.statusText}>Valid</Text>
            </View>
          </View>
          
          <View style={styles.documentInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Check-up:</Text>
              <Text style={styles.infoValue}>
                {driver?.updated_at ? new Date(driver.updated_at).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Next Check-up:</Text>
              <Text style={styles.infoValue}>
                {driver?.license_expiry ? new Date(driver.license_expiry).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.viewButton}>
            <Text style={styles.viewButtonText}>📄 View Document</Text>
          </TouchableOpacity>
        </View>

        {/* ID Document */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🆔 ID Document</Text>
            <View style={[styles.statusBadge, { backgroundColor: '#4CAF50' }]}>
              <Text style={styles.statusText}>Verified</Text>
            </View>
          </View>
          
          <View style={styles.documentInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ID Number:</Text>
              <Text style={styles.infoValue}>***********{driver?.id?.slice(-4)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Verified On:</Text>
              <Text style={styles.infoValue}>
                {driver?.created_at ? new Date(driver.created_at).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.viewButton}>
            <Text style={styles.viewButtonText}>📄 View Document</Text>
          </TouchableOpacity>
        </View>

        {/* Notes Section */}
        {driver?.notes && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📝 Notes</Text>
            <Text style={styles.notesText}>{driver.notes}</Text>
          </View>
        )}

        {/* Upload New Document */}
        <TouchableOpacity style={styles.uploadButton}>
          <Text style={styles.uploadButtonText}>📤 Upload New Document</Text>
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
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
  documentInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  viewButton: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginTop: 8,
  },
  uploadButton: {
    backgroundColor: theme.colors.primary,
    margin: 16,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 32,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
