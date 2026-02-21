import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../config/constants';

export default function PassengerDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const auth = useAuth();
  const user = auth?.user;
  const profile = auth?.profile;
  const { tripId, selectedSeats, totalAmount, fare } = route.params;

  const [passengers, setPassengers] = useState(
    selectedSeats.map((seat, index) => ({
      seatNumber: seat,
      fullName: index === 0 ? profile?.full_name || '' : '',
      phone: index === 0 ? profile?.phone || '' : '',
      idNumber: index === 0 ? profile?.id_number || '' : '',
      gender: '',
      nextOfKin: '',
    }))
  );

  const [luggageCount, setLuggageCount] = useState(0);
  const [hasInfant, setHasInfant] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const LUGGAGE_FEE = 50; // BWP per bag
  const INFANT_FEE = 0; // Free

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const validateForm = () => {
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.fullName.trim()) {
        Alert.alert('Missing Information', `Please enter full name for Seat ${p.seatNumber}`);
        return false;
      }
      if (!p.phone.trim()) {
        Alert.alert('Missing Information', `Please enter phone number for Seat ${p.seatNumber}`);
        return false;
      }
      if (!p.idNumber.trim()) {
        Alert.alert('Missing Information', `Please enter ID/Passport for Seat ${p.seatNumber}`);
        return false;
      }
      if (!p.gender) {
        Alert.alert('Missing Information', `Please select gender for Seat ${p.seatNumber}`);
        return false;
      }
    }
    return true;
  };

  const calculateTotal = () => {
    const baseFare = totalAmount;
    const luggageFee = luggageCount * LUGGAGE_FEE;
    const infantFee = hasInfant ? INFANT_FEE : 0;
    const total = baseFare + luggageFee + infantFee - discount;
    return Math.max(0, total);
  };

  const handleContinue = () => {
    if (!validateForm()) return;

    navigation.navigate('Payment', {
      tripId,
      passengers,
      selectedSeats,
      luggageCount,
      hasInfant,
      promoCode,
      discount,
      totalAmount: calculateTotal(),
      baseFare: totalAmount,
      luggageFee: luggageCount * LUGGAGE_FEE,
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Passenger Details</Text>
        <Text style={styles.headerSubtitle}>
          Fill details for {selectedSeats.length} passenger{selectedSeats.length > 1 ? 's' : ''}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Passenger Forms */}
        {passengers.map((passenger, index) => (
          <View key={index} style={styles.passengerCard}>
            <Text style={styles.cardTitle}>
              Seat {passenger.seatNumber} - Passenger {index + 1}
            </Text>

            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter full name"
              value={passenger.fullName}
              onChangeText={(value) => handlePassengerChange(index, 'fullName', value)}
            />

            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="+267 7X XXX XXX"
              keyboardType="phone-pad"
              value={passenger.phone}
              onChangeText={(value) => handlePassengerChange(index, 'phone', value)}
            />

            <Text style={styles.label}>ID / Passport Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter ID or Passport"
              value={passenger.idNumber}
              onChangeText={(value) => handlePassengerChange(index, 'idNumber', value)}
            />

            <Text style={styles.label}>Gender *</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[
                  styles.genderBtn,
                  passenger.gender === 'male' && styles.genderBtnActive,
                ]}
                onPress={() => handlePassengerChange(index, 'gender', 'male')}
              >
                <Text
                  style={[
                    styles.genderText,
                    passenger.gender === 'male' && styles.genderTextActive,
                  ]}
                >
                  Male
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderBtn,
                  passenger.gender === 'female' && styles.genderBtnActive,
                ]}
                onPress={() => handlePassengerChange(index, 'gender', 'female')}
              >
                <Text
                  style={[
                    styles.genderText,
                    passenger.gender === 'female' && styles.genderTextActive,
                  ]}
                >
                  Female
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Next of Kin (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Emergency contact name"
              value={passenger.nextOfKin}
              onChangeText={(value) => handlePassengerChange(index, 'nextOfKin', value)}
            />
          </View>
        ))}

        {/* Additional Options */}
        <View style={styles.optionsCard}>
          <Text style={styles.cardTitle}>Additional Options</Text>

          {/* Luggage */}
          <View style={styles.optionRow}>
            <View style={styles.optionInfo}>
              <Text style={styles.optionLabel}>Luggage</Text>
              <Text style={styles.optionPrice}>BWP {LUGGAGE_FEE} per bag</Text>
            </View>
            <View style={styles.counter}>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setLuggageCount(Math.max(0, luggageCount - 1))}
              >
                <Text style={styles.counterBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{luggageCount}</Text>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setLuggageCount(Math.min(10, luggageCount + 1))}
              >
                <Text style={styles.counterBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Infant */}
          <View style={styles.optionRow}>
            <View style={styles.optionInfo}>
              <Text style={styles.optionLabel}>Traveling with Infant</Text>
              <Text style={styles.optionPrice}>Free (0-2 years)</Text>
            </View>
            <TouchableOpacity
              style={[styles.checkbox, hasInfant && styles.checkboxActive]}
              onPress={() => setHasInfant(!hasInfant)}
            >
              {hasInfant && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          </View>

          {/* Promo Code */}
          <Text style={styles.label}>Promo Code</Text>
          <View style={styles.promoContainer}>
            <TextInput
              style={styles.promoInput}
              placeholder="Enter promo code"
              value={promoCode}
              onChangeText={setPromoCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.applyBtn}>
              <Text style={styles.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Price Breakdown */}
        <View style={styles.breakdownCard}>
          <Text style={styles.cardTitle}>Price Breakdown</Text>
          
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>
              Base Fare ({selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''})
            </Text>
            <Text style={styles.breakdownValue}>BWP {totalAmount}</Text>
          </View>

          {luggageCount > 0 && (
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>
                Luggage ({luggageCount} bag{luggageCount > 1 ? 's' : ''})
              </Text>
              <Text style={styles.breakdownValue}>BWP {luggageCount * LUGGAGE_FEE}</Text>
            </View>
          )}

          {hasInfant && (
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Infant</Text>
              <Text style={styles.breakdownValue}>BWP {INFANT_FEE}</Text>
            </View>
          )}

          {discount > 0 && (
            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, { color: COLORS.success }]}>
                Discount
              </Text>
              <Text style={[styles.breakdownValue, { color: COLORS.success }]}>
                -BWP {discount}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.breakdownRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>BWP {calculateTotal()}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
          <Text style={styles.continueBtnText}>Continue to Payment →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  header: {
    backgroundColor: COLORS.white,
    padding: 15,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  backBtn: {
    fontSize: 16,
    color: COLORS.primary,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.gray[600],
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  passengerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[700],
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: COLORS.gray[100],
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: COLORS.dark,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  genderBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
  },
  genderBtnActive: {
    backgroundColor: COLORS.primary,
  },
  genderText: {
    fontSize: 16,
    color: COLORS.gray[700],
  },
  genderTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  optionsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  optionInfo: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    color: COLORS.dark,
    fontWeight: '600',
  },
  optionPrice: {
    fontSize: 14,
    color: COLORS.gray[600],
    marginTop: 2,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterBtn: {
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterBtnText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  counterValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 15,
    color: COLORS.dark,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  promoContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  promoInput: {
    flex: 1,
    backgroundColor: COLORS.gray[100],
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: COLORS.dark,
  },
  applyBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
  },
  applyBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  breakdownCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    color: COLORS.gray[700],
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray[200],
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  footer: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  continueBtn: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  continueBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
