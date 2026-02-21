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

export default function PaymentMethodsScreen() {
  const auth = useAuth();
  const user = auth?.user;
  const [loading, setLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({
    method_type: 'card',
    card_number: '',
    card_holder: '',
    expiry_date: '',
    mobile_number: '',
    wallet_provider: '',
    is_default: false,
  });

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('saved_payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      Alert.alert('Error', 'Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setForm({
      method_type: 'card',
      card_number: '',
      card_holder: '',
      expiry_date: '',
      mobile_number: '',
      wallet_provider: '',
      is_default: false,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        user_id: user.id,
        method_type: form.method_type,
        is_default: form.is_default,
      };

      if (form.method_type === 'card') {
        if (!form.card_number || !form.card_holder || !form.expiry_date) {
          Alert.alert('Error', 'Please fill in all card details');
          return;
        }
        payload.card_last_four = form.card_number.slice(-4);
        payload.card_holder = form.card_holder;
        payload.expiry_date = form.expiry_date;
      } else if (form.method_type === 'mobile_money') {
        if (!form.mobile_number || !form.wallet_provider) {
          Alert.alert('Error', 'Please fill in mobile money details');
          return;
        }
        payload.mobile_number = form.mobile_number;
        payload.wallet_provider = form.wallet_provider;
      }

      const { error } = await supabase
        .from('saved_payment_methods')
        .insert([payload]);

      if (error) throw error;

      Alert.alert('Success', 'Payment method added successfully');
      setModalVisible(false);
      loadPaymentMethods();
    } catch (error) {
      console.error('Error saving payment method:', error);
      Alert.alert('Error', 'Failed to save payment method');
    }
  };

  const handleDelete = (method) => {
    Alert.alert(
      'Delete Payment Method',
      'Are you sure you want to delete this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('saved_payment_methods')
                .delete()
                .eq('id', method.id);

              if (error) throw error;
              loadPaymentMethods();
            } catch (error) {
              console.error('Error deleting payment method:', error);
              Alert.alert('Error', 'Failed to delete payment method');
            }
          },
        },
      ]
    );
  };

  const setAsDefault = async (method) => {
    try {
      // Remove default from all methods
      await supabase
        .from('saved_payment_methods')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Set this method as default
      const { error } = await supabase
        .from('saved_payment_methods')
        .update({ is_default: true })
        .eq('id', method.id);

      if (error) throw error;
      loadPaymentMethods();
    } catch (error) {
      console.error('Error setting default:', error);
      Alert.alert('Error', 'Failed to set as default');
    }
  };

  const renderPaymentMethod = ({ item }) => (
    <Card style={styles.methodCard}>
      <View style={styles.methodHeader}>
        <View style={styles.methodInfo}>
          <Text style={styles.methodType}>
            {item.method_type === 'card' ? '💳 Card' : '📱 Mobile Money'}
          </Text>
          {item.is_default && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Default</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.methodDetails}>
        {item.method_type === 'card' ? (
          <>
            <Text style={styles.detailText}>•••• •••• •••• {item.card_last_four}</Text>
            <Text style={styles.detailText}>{item.card_holder}</Text>
            <Text style={styles.detailText}>Expires: {item.expiry_date}</Text>
          </>
        ) : (
          <>
            <Text style={styles.detailText}>{item.wallet_provider}</Text>
            <Text style={styles.detailText}>{item.mobile_number}</Text>
          </>
        )}
      </View>

      <View style={styles.actions}>
        {!item.is_default && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.defaultBtn]}
            onPress={() => setAsDefault(item)}
          >
            <Text style={styles.defaultBtnText}>Set as Default</Text>
          </TouchableOpacity>
        )}
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
        <Text style={styles.loadingText}>Loading payment methods...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GradientHeader title="Payment Methods" />

      <View style={styles.content}>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ Add Payment Method</Text>
        </TouchableOpacity>

        <FlatList
          data={paymentMethods}
          renderItem={renderPaymentMethod}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No payment methods saved</Text>
              <Text style={styles.emptySubtext}>
                Add a payment method for faster checkout
              </Text>
            </View>
          }
        />
      </View>

      {/* Add Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Add Payment Method</Text>

              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeBtn,
                    form.method_type === 'card' && styles.typeBtnActive,
                  ]}
                  onPress={() => setForm({ ...form, method_type: 'card' })}
                >
                  <Text
                    style={[
                      styles.typeText,
                      form.method_type === 'card' && styles.typeTextActive,
                    ]}
                  >
                    💳 Card
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeBtn,
                    form.method_type === 'mobile_money' && styles.typeBtnActive,
                  ]}
                  onPress={() => setForm({ ...form, method_type: 'mobile_money' })}
                >
                  <Text
                    style={[
                      styles.typeText,
                      form.method_type === 'mobile_money' && styles.typeTextActive,
                    ]}
                  >
                    📱 Mobile Money
                  </Text>
                </TouchableOpacity>
              </View>

              {form.method_type === 'card' ? (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Card Number *</Text>
                    <TextInput
                      style={styles.input}
                      value={form.card_number}
                      onChangeText={(text) => setForm({ ...form, card_number: text })}
                      placeholder="1234 5678 9012 3456"
                      keyboardType="numeric"
                      maxLength={16}
                      placeholderTextColor={THEME.colors.gray[400]}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Card Holder Name *</Text>
                    <TextInput
                      style={styles.input}
                      value={form.card_holder}
                      onChangeText={(text) => setForm({ ...form, card_holder: text })}
                      placeholder="John Doe"
                      placeholderTextColor={THEME.colors.gray[400]}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Expiry Date *</Text>
                    <TextInput
                      style={styles.input}
                      value={form.expiry_date}
                      onChangeText={(text) => setForm({ ...form, expiry_date: text })}
                      placeholder="MM/YY"
                      maxLength={5}
                      placeholderTextColor={THEME.colors.gray[400]}
                    />
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Wallet Provider *</Text>
                    <TextInput
                      style={styles.input}
                      value={form.wallet_provider}
                      onChangeText={(text) => setForm({ ...form, wallet_provider: text })}
                      placeholder="Orange Money, MyZaka, etc."
                      placeholderTextColor={THEME.colors.gray[400]}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Mobile Number *</Text>
                    <TextInput
                      style={styles.input}
                      value={form.mobile_number}
                      onChangeText={(text) => setForm({ ...form, mobile_number: text })}
                      placeholder="+267 XX XXX XXX"
                      keyboardType="phone-pad"
                      placeholderTextColor={THEME.colors.gray[400]}
                    />
                  </View>
                </>
              )}

              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setForm({ ...form, is_default: !form.is_default })}
              >
                <View style={[styles.checkbox, form.is_default && styles.checkboxChecked]}>
                  {form.is_default && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Set as default payment method</Text>
              </TouchableOpacity>

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
  methodCard: {
    marginBottom: 12,
  },
  methodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  methodType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.colors.dark,
  },
  defaultBadge: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    color: THEME.colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  methodDetails: {
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
  defaultBtn: {
    backgroundColor: THEME.colors.secondary,
  },
  defaultBtnText: {
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
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  typeBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: THEME.colors.gray[300],
    alignItems: 'center',
  },
  typeBtnActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primary,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.gray[600],
  },
  typeTextActive: {
    color: THEME.colors.white,
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: THEME.colors.gray[300],
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  checkmark: {
    color: THEME.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: THEME.colors.gray[700],
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
