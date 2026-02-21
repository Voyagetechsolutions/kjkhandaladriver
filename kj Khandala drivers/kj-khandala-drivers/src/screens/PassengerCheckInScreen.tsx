import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { supabase } from '../config/supabase';
import { theme } from '../config/theme';

export const PassengerCheckInScreen: React.FC<{ navigation: any, route: any }> = ({
  navigation,
  route,
}) => {
  const [ticketNumber, setTicketNumber] = useState('');
  const [passengers, setPassengers] = useState<any[]>([]);
  const [checkedInPassengers, setCheckedInPassengers] = useState<any[]>([]);
  const [scanning, setScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [isDownloading, setIsDownloading] = useState(false);
  const tripId = route.params?.tripId;

  useEffect(() => {
    loadPassengers();
  }, []);

  const loadPassengers = async () => {
    try {
      if (!tripId) return;

      const { data } = await supabase
        .from('bookings')
        .select('*')
        .eq('trip_id', tripId);

      const allPassengers = data || [];
      setPassengers(allPassengers);
      setCheckedInPassengers(allPassengers.filter((p: any) => p.checked_in));
    } catch (error) {
      console.error('Error loading passengers:', error);
    }
  };

  const handleCheckIn = async (ticketNum: string) => {
    try {
      const passenger = passengers.find(p => p.ticket_number === ticketNum || p.id === ticketNum);
      
      if (!passenger) {
        Alert.alert('Error', 'Ticket not found');
        return;
      }

      if (passenger.checked_in) {
        Alert.alert('Already Checked In', 'This passenger has already been checked in');
        return;
      }

      // Update booking in Supabase
      const { error } = await supabase
        .from('bookings')
        .update({ checked_in: true, checked_in_at: new Date().toISOString() })
        .eq('id', passenger.id);

      if (error) throw error;

      Alert.alert('Success', 'Passenger checked in successfully');
      setTicketNumber('');
      loadPassengers(); // Reload to update UI
    } catch (error) {
      console.error('Check-in error:', error);
      Alert.alert('Error', 'Failed to check in passenger');
    }
  };

  const handleManualCheckIn = async () => {
    if (!ticketNumber.trim()) {
      Alert.alert('Error', 'Please enter a ticket number');
      return;
    }
    await handleCheckIn(ticketNumber);
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanning(false);
    handleCheckIn(data);
  };

  const handleQRScan = async () => {
    if (!permission) {
      Alert.alert('Permission Required', 'Requesting camera permission...');
      await requestPermission();
      return;
    }
    if (!permission.granted) {
      Alert.alert('No Permission', 'Camera permission is required to scan QR codes');
      return;
    }
    setScanning(true);
  };

  const generatePassengerManifestPDF = async () => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #DC143C; text-align: center; }
          h2 { color: #000080; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #DC143C; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
          .checked-in { color: #4CAF50; font-weight: bold; }
          .not-checked-in { color: #F44336; }
          .summary { background-color: #E3F2FD; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h1>KJ Khandala Drivers</h1>
        <h2>Passenger Manifest - Trip ${tripId}</h2>
        <div class="summary">
          <p><strong>Total Passengers:</strong> ${passengers.length}</p>
          <p><strong>Checked In:</strong> ${checkedInPassengers.length}</p>
          <p><strong>Not Checked In:</strong> ${passengers.length - checkedInPassengers.length}</p>
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Ticket Number</th>
              <th>Passenger Name</th>
              <th>Seat Number</th>
              <th>Status</th>
              <th>Check-in Time</th>
            </tr>
          </thead>
          <tbody>
            ${passengers.map(p => `
              <tr>
                <td>${p.ticket_number || 'N/A'}</td>
                <td>${p.passenger_name || 'N/A'}</td>
                <td>${p.seat_number || 'N/A'}</td>
                <td class="${p.checked_in ? 'checked-in' : 'not-checked-in'}">
                  ${p.checked_in ? '✓ Checked In' : '✗ Not Checked In'}
                </td>
                <td>${p.checked_in_at ? new Date(p.checked_in_at).toLocaleTimeString() : '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    return html;
  };

  const handleDownloadManifest = async () => {
    try {
      setIsDownloading(true);
      const html = await generatePassengerManifestPDF();
      const { uri } = await Print.printToFileAsync({ html });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Passenger Manifest',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Success', 'PDF saved successfully');
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      Alert.alert('Error', 'Failed to generate PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const boardedCount = checkedInPassengers.length;
  const totalCount = passengers.length;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Passenger Check-In</Text>
      </View>

      {/* QR Scanner Modal */}
      <Modal visible={scanning} animationType="slide">
        <View style={styles.scannerContainer}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
            onBarcodeScanned={scanning ? handleBarCodeScanned : undefined}
          />
          <View style={styles.scannerOverlay}>
            <Text style={styles.scannerText}>Scan Ticket QR Code</Text>
            <TouchableOpacity
              style={styles.cancelScanButton}
              onPress={() => setScanning(false)}
            >
              <Text style={styles.cancelScanText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.statsCard}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{boardedCount}</Text>
          <Text style={styles.statLabel}>Boarded</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{totalCount - boardedCount}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{totalCount}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      <View style={styles.scanSection}>
        <TouchableOpacity style={styles.qrButton} onPress={handleQRScan}>
          <Text style={styles.qrButtonText}>📱 Scan QR Code</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>OR</Text>

        <View style={styles.manualInput}>
          <TextInput
            style={styles.input}
            placeholder="Enter ticket number"
            value={ticketNumber}
            onChangeText={setTicketNumber}
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.checkInButton} onPress={handleManualCheckIn}>
            <Text style={styles.checkInButtonText}>Check In</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Passenger Manifest</Text>
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={handleDownloadManifest}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.downloadButtonText}>📥 Download PDF</Text>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={passengers}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.passengerCard}>
            <View style={styles.passengerInfo}>
              <Text style={styles.passengerName}>{item.name}</Text>
              <Text style={styles.ticketText}>Ticket: {item.ticketNumber}</Text>
              <Text style={styles.phoneText}>{item.phoneNumber}</Text>
            </View>
            <View style={styles.passengerStatus}>
              {item.boarded ? (
                <>
                  <View style={[styles.statusBadge, { backgroundColor: '#4CAF50' }]}>
                    <Text style={styles.statusText}>✓ BOARDED</Text>
                  </View>
                  {item.boardedTime && (
                    <Text style={styles.timeText}>
                      {new Date(item.boardedTime).toLocaleTimeString('en-ZA', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  )}
                </>
              ) : (
                <TouchableOpacity
                  style={styles.checkInSmallButton}
                  onPress={() => handleCheckIn(item.ticket_number || item.id)}
                >
                  <Text style={styles.checkInSmallText}>Check In</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
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
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
  },
  scanSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrButton: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  qrButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  orText: {
    textAlign: 'center',
    color: '#999',
    marginVertical: 16,
    fontSize: 14,
  },
  manualInput: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  checkInButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
  },
  checkInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  passengerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  passengerInfo: {
    flex: 1,
  },
  passengerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  ticketText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  phoneText: {
    fontSize: 12,
    color: '#999',
  },
  passengerStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
  checkInSmallButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  checkInSmallText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  scannerOverlay: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    padding: 20,
  },
  scannerText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  cancelScanButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelScanText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  downloadButton: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
