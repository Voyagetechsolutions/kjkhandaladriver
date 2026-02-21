import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { THEME } from '../../config/theme';
import { Card, Button, GradientHeader } from '../../components';

export default function SavedPassengersScreen() {
  const auth = useAuth();
  const user = auth?.user;
  const [loading, setLoading] = useState(true);
  const [passengers, setPassengers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPassenger, setEditingPassenger] = useState(null);
  const [form, setForm] = useState({
    full_name: '',
    id_number: '',
    phone: '',
    email: '',
    date_of_birth: '',
    relationship: '',
  });

  useEffect(() => {
    loadPassengers();
  }, []);

  const loadPassengers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('saved_passengers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPassengers(data || []);
    } catch (error) {
      console.error('Error loading passengers:', error);
      Alert.alert('Error', 'Failed to load saved passengers');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingPassenger(null);
    setForm({
      full_name: '',
      id_number: '',
      phone: '',
      email: '',
      date_of_birth: '',
      relationship: '',
    });
    setModalVisible(true);
  };

  const openEditModal = (passenger) => {
    setEditingPassenger(passenger);
    setForm({
      full_name: passenger.full_name || '',
      id_number: passenger.id_number || '',
      phone: passenger.phone || '',
      email: passenger.email || '',
      date_of_birth: passenger.date_of_birth || '',
      relationship: passenger.relationship || '',
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.full_name || !form.id_number) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    try {
      if (editingPassenger) {
        // Update existing passenger
        const { error } = await supabase
          .from('saved_passengers')
          .update({
            ...form,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingPassenger.id);

        if (error) throw error;
        Alert.alert('Success', 'Passenger updated successfully');
      } else {
        // Add new passenger
        const { error } = await supabase
          .from('saved_passengers')
          .insert([
            {
              user_id: user.id,
              ...form,
            },
          ]);

        if (error) throw error;
        Alert.alert('Success', 'Passenger added successfully');
      }

      setModalVisible(false);
      loadPassengers();
    } catch (error) {
      console.error('Error saving passenger:', error);
      Alert.alert('Error', 'Failed to save passenger');
    }
  };

  const handleDelete = (passenger) => {
    Alert.alert(
      'Delete Passenger',
      `Are you sure you want to delete ${passenger.full_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('saved_passengers')
                .delete()
                .eq('id', passenger.id);

              if (error) throw error;
              loadPassengers();
            } catch (error) {
              console.error('Error deleting passenger:', error);
              Alert.alert('Error', 'Failed to delete passenger');
            }
          },
        },
      ]
    );
  };

  const renderPassenger = ({ item }) => (
    <Card style={styles.passengerCard}>
      <View style={styles.passengerHeader}>
        <View style={styles.passengerInfo}>
          <Text style={styles.passengerName}>{item.full_name}</Text>
          {item.relationship && (
            <Text style={styles.relationship}>{item.relationship}</Text>
          )}
        </View>
      </View>

      <View style={styles.passengerDetails}>
        <Text style={styles.detailText}>ID: {item.id_number}</Text>
        {item.phone && <Text style={styles.detailText}>Phone: {item.phone}</Text>}
        {item.email && <Text style={styles.detailText}>Email: {item.email}</Text>}
        {item.date_of_birth && (
          <Text style={styles.detailText}>DOB: {item.date_of_birth}</Text>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => openEditModal(item)}
        >
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => handleDelete(item)}
        >
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text style={styles.loadingText}>Loading passengers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GradientHeader title="Saved Passengers" />

      <View style={styles.content}>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ Add New Passenger</Text>
        </TouchableOpacity>

        <FlatList
          data={passengers}
          renderItem={renderPassenger}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No saved passengers</Text>
              <Text style={styles.emptySubtext}>
                Add passengers to speed up future bookings
              </Text>
            </View>
          }
        />
      </View>

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {editingPassenger ? 'Edit Passenger' : 'Add Passenger'}
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  value={form.full_name}
                  onChangeText={(text) => setForm({ ...form, full_name: text })}
                  placeholder="Enter full name"
                  placeholderTextColor={THEME.colors.gray[400]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>ID Number *</Text>
                <TextInput
                  style={styles.input}
                  value={form.id_number}
                  onChangeText={(text) => setForm({ ...form, id_number: text })}
                  placeholder="Enter ID number"
                  placeholderTextColor={THEME.colors.gray[400]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone</Text>
                <TextInput
                  style={styles.input}
                  value={form.phone}
                  onChangeText={(text) => setForm({ ...form, phone: text })}
                  placeholder="+267 XX XXX XXX"
                  keyboardType="phone-pad"
                  placeholderTextColor={THEME.colors.gray[400]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={form.email}
                  onChangeText={(text) => setForm({ ...form, email: text })}
                  placeholder="email@example.com"
                  keyboardType="email-address"
                  placeholderTextColor={THEME.colors.gray[400]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date of Birth</Text>
                <TextInput
                  style={styles.input}
                  value={form.date_of_birth}
                  onChangeText={(text) => setForm({ ...form, date_of_birth: text })}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={THEME.colors.gray[400]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Relationship</Text>
                <TextInput
                  style={styles.input}
                  value={form.relationship}
                  onChangeText={(text) => setForm({ ...form, relationship: text })}
                  placeholder="e.g., Spouse, Child, Friend"
                  placeholderTextColor={THEME.colors.gray[400]}
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.cancelBtn]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.saveBtn]}
                  onPress={handleSave}
                >
                  <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.gray[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.colors.gray[50],
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: THEME.colors.gray[600],
  },
  content: {
    flex: 1,
    padding: 16,
  },
  addButton: {
    backgroundColor: THEME.colors.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: THEME.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  list: {
    paddingBottom: 16,
  },
  passengerCard: {
    marginBottom: 12,
  },
  passengerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  passengerInfo: {
    flex: 1,
  },
  passengerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.colors.dark,
    marginBottom: 4,
  },
  relationship: {
    fontSize: 14,
    color: THEME.colors.primary,
    fontWeight: '600',
  },
  passengerDetails: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: THEME.colors.gray[600],
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  editBtn: {
    backgroundColor: THEME.colors.secondary,
  },
  editBtnText: {
    color: THEME.colors.white,
    fontWeight: '600',
  },
  deleteBtn: {
    backgroundColor: THEME.colors.gray[200],
  },
  deleteBtnText: {
    color: THEME.colors.gray[700],
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.colors.dark,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: THEME.colors.gray[600],
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: THEME.colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.colors.dark,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.gray[700],
    marginBottom: 8,
  },
  input: {
    backgroundColor: THEME.colors.white,
    borderWidth: 1,
    borderColor: THEME.colors.gray[300],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: THEME.colors.dark,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: THEME.colors.gray[200],
  },
  cancelBtnText: {
    color: THEME.colors.gray[700],
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveBtn: {
    backgroundColor: THEME.colors.primary,
  },
  saveBtnText: {
    color: THEME.colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
