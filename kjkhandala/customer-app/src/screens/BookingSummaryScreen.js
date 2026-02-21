import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS } from '../config/constants';

export default function BookingSummaryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { bookingId, paymentReference } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.successIcon}>✅</Text>
        <Text style={styles.title}>Booking Confirmed!</Text>
        <Text style={styles.subtitle}>
          Your ticket has been sent to your email
        </Text>
        
        <View style={styles.infoCard}>
          <Text style={styles.label}>Booking Reference</Text>
          <Text style={styles.value}>{bookingId}</Text>
          
          <Text style={styles.label}>Payment Reference</Text>
          <Text style={styles.value}>{paymentReference}</Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('MyTrips')}
        >
          <Text style={styles.buttonText}>View My Trips</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.buttonSecondaryText}>Back to Home</Text>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray[600],
    textAlign: 'center',
    marginBottom: 30,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    color: COLORS.gray[600],
    marginTop: 15,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginTop: 5,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonSecondary: {
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  buttonSecondaryText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
