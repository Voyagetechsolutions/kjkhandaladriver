import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { COLORS } from '../config/constants';

export default function SupportScreen() {
  const contactMethods = [
    {
      icon: '📞',
      title: 'Call Us',
      subtitle: '+267 1234 5678',
      action: () => Linking.openURL('tel:+26712345678'),
    },
    {
      icon: '💬',
      title: 'WhatsApp',
      subtitle: 'Chat with us',
      action: () => Linking.openURL('https://wa.me/26712345678'),
    },
    {
      icon: '✉️',
      title: 'Email',
      subtitle: 'support@voyagetech.com',
      action: () => Linking.openURL('mailto:support@voyagetech.com'),
    },
  ];

  const faqItems = [
    { q: 'How do I book a ticket?', a: 'Search for trips, select seats, and pay.' },
    { q: 'Can I cancel my booking?', a: 'Yes, up to 48 hours before departure.' },
    { q: 'How do I get a refund?', a: 'Request refund from My Trips section.' },
    { q: 'Where do I check in?', a: 'Use QR code at the station or check-in online.' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <Text style={styles.headerSubtitle}>We're here to help you</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Us</Text>
        {contactMethods.map((method, index) => (
          <TouchableOpacity
            key={index}
            style={styles.contactCard}
            onPress={method.action}
          >
            <Text style={styles.contactIcon}>{method.icon}</Text>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>{method.title}</Text>
              <Text style={styles.contactSubtitle}>{method.subtitle}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {faqItems.map((item, index) => (
          <View key={index} style={styles.faqCard}>
            <Text style={styles.faqQuestion}>{item.q}</Text>
            <Text style={styles.faqAnswer}>{item.a}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency</Text>
        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={() => Linking.openURL('tel:911')}
        >
          <Text style={styles.emergencyText}>🚨 Emergency Hotline</Text>
        </TouchableOpacity>
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
    backgroundColor: COLORS.primary,
    padding: 30,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 15,
  },
  contactCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  contactIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
  },
  contactSubtitle: {
    fontSize: 14,
    color: COLORS.gray[600],
    marginTop: 2,
  },
  arrow: {
    fontSize: 24,
    color: COLORS.gray[400],
  },
  faqCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: COLORS.gray[600],
    lineHeight: 20,
  },
  emergencyButton: {
    backgroundColor: COLORS.danger,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  emergencyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});
