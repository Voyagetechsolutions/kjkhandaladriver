import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../config/constants';

export default function PromotionsScreen() {
  const promotions = [
    {
      id: 1,
      title: 'Welcome Offer',
      code: 'WELCOME10',
      discount: '10% OFF',
      description: 'Get 10% off your first booking',
      validUntil: '2024-12-31',
      color: COLORS.primary,
    },
    {
      id: 2,
      title: 'Weekend Special',
      code: 'WEEKEND20',
      discount: '20% OFF',
      description: 'Travel on weekends and save 20%',
      validUntil: '2024-12-31',
      color: COLORS.success,
    },
    {
      id: 3,
      title: 'Group Discount',
      code: 'GROUP15',
      discount: '15% OFF',
      description: 'Book 4+ seats and get 15% off',
      validUntil: '2024-12-31',
      color: COLORS.warning,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Promotions & Offers</Text>
        <Text style={styles.headerSubtitle}>Save more on your trips</Text>
      </View>

      <View style={styles.content}>
        {promotions.map((promo) => (
          <View key={promo.id} style={[styles.promoCard, { borderLeftColor: promo.color }]}>
            <View style={styles.promoHeader}>
              <View>
                <Text style={styles.promoTitle}>{promo.title}</Text>
                <Text style={[styles.promoDiscount, { color: promo.color }]}>
                  {promo.discount}
                </Text>
              </View>
              <View style={[styles.codeBadge, { backgroundColor: promo.color }]}>
                <Text style={styles.codeText}>{promo.code}</Text>
              </View>
            </View>
            
            <Text style={styles.promoDescription}>{promo.description}</Text>
            
            <View style={styles.promoFooter}>
              <Text style={styles.validText}>Valid until {promo.validUntil}</Text>
              <TouchableOpacity style={styles.useButton}>
                <Text style={styles.useButtonText}>Use Code</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 How to use promo codes</Text>
          <Text style={styles.infoText}>
            1. Select your trip and seats{'\n'}
            2. Enter promo code at checkout{'\n'}
            3. Discount will be applied automatically{'\n'}
            4. Complete your booking
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  header: {
    backgroundColor: COLORS.white,
    padding: 30,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.gray[600],
  },
  content: {
    padding: 15,
  },
  promoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderLeftWidth: 4,
  },
  promoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  promoDiscount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
  },
  codeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  codeText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  promoDescription: {
    fontSize: 14,
    color: COLORS.gray[600],
    marginBottom: 12,
  },
  promoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  validText: {
    fontSize: 12,
    color: COLORS.gray[500],
  },
  useButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  useButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.gray[700],
    lineHeight: 22,
  },
});
