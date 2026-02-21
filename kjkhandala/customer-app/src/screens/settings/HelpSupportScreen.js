import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { THEME } from '../../config/theme';
import { Card, GradientHeader } from '../../components';

export default function HelpSupportScreen() {
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const faqs = [
    {
      question: 'How do I book a ticket?',
      answer: 'Search for trips, select your preferred trip, choose seats, enter passenger details, and complete payment.',
    },
    {
      question: 'Can I cancel or reschedule my booking?',
      answer: 'Yes, you can cancel or reschedule from My Trips. Refund policies apply based on how far in advance you cancel.',
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept Orange Money, Mascom MyZaka, Smega Wallet, bank transfers, credit/debit cards, and cash payments.',
    },
    {
      question: 'How do I track my bus in real-time?',
      answer: 'Go to My Trips, select your booking, and tap "Track Bus" to see live GPS location.',
    },
    {
      question: 'What is the luggage policy?',
      answer: 'Each passenger is allowed one carry-on bag and one checked bag. Additional luggage may incur extra charges.',
    },
    {
      question: 'Can I select my seat?',
      answer: 'Yes, during booking you can view the seat map and select your preferred seats.',
    },
    {
      question: 'How do I get my ticket?',
      answer: 'Your ticket is available in the app under My Trips. You can download or show the QR code at check-in.',
    },
    {
      question: 'What if I miss my bus?',
      answer: 'Contact support immediately. Depending on the circumstances, we may be able to reschedule you on the next available trip.',
    },
  ];

  const contactOptions = [
    {
      icon: '📞',
      title: 'Call Us',
      subtitle: '+267 XXX XXXX',
      action: () => Linking.openURL('tel:+267XXXXXXX'),
    },
    {
      icon: '💬',
      title: 'WhatsApp',
      subtitle: 'Chat with support',
      action: () => Linking.openURL('whatsapp://send?phone=267XXXXXXX'),
    },
    {
      icon: '📧',
      title: 'Email',
      subtitle: 'support@voyagebus.com',
      action: () => Linking.openURL('mailto:support@voyagebus.com'),
    },
    {
      icon: '🌐',
      title: 'Website',
      subtitle: 'Visit our website',
      action: () => Linking.openURL('https://voyagebus.com'),
    },
  ];

  const toggleFAQ = (index) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <View style={styles.container}>
      <GradientHeader title="Help & Support" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactGrid}>
            {contactOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.contactCard}
                onPress={option.action}
              >
                <Text style={styles.contactIcon}>{option.icon}</Text>
                <Text style={styles.contactTitle}>{option.title}</Text>
                <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqs.map((faq, index) => (
            <Card key={index} style={styles.faqCard}>
              <TouchableOpacity
                style={styles.faqHeader}
                onPress={() => toggleFAQ(index)}
              >
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Text style={styles.faqIcon}>
                  {expandedFAQ === index ? '−' : '+'}
                </Text>
              </TouchableOpacity>
              {expandedFAQ === index && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              )}
            </Card>
          ))}
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Links</Text>
          <Card style={styles.linksCard}>
            <TouchableOpacity style={styles.linkItem}>
              <Text style={styles.linkText}>📍 Find Bus Stations</Text>
            </TouchableOpacity>
            <View style={styles.linkDivider} />
            <TouchableOpacity style={styles.linkItem}>
              <Text style={styles.linkText}>🕐 Operating Hours</Text>
            </TouchableOpacity>
            <View style={styles.linkDivider} />
            <TouchableOpacity style={styles.linkItem}>
              <Text style={styles.linkText}>💰 Refund Policy</Text>
            </TouchableOpacity>
            <View style={styles.linkDivider} />
            <TouchableOpacity style={styles.linkItem}>
              <Text style={styles.linkText}>🎫 Booking Guidelines</Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* Emergency Contact */}
        <Card style={styles.emergencyCard}>
          <Text style={styles.emergencyTitle}>🚨 Emergency Support</Text>
          <Text style={styles.emergencyText}>
            For urgent assistance during your trip, call our 24/7 emergency hotline:
          </Text>
          <TouchableOpacity
            style={styles.emergencyButton}
            onPress={() => Linking.openURL('tel:+267XXXXXXX')}
          >
            <Text style={styles.emergencyButtonText}>+267 XXX XXXX</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.gray[50],
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.colors.dark,
    marginBottom: 16,
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  contactCard: {
    width: '48%',
    backgroundColor: THEME.colors.white,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    ...THEME.shadows.md,
  },
  contactIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.colors.dark,
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 12,
    color: THEME.colors.gray[600],
    textAlign: 'center',
  },
  faqCard: {
    marginBottom: 8,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: THEME.colors.dark,
  },
  faqIcon: {
    fontSize: 24,
    color: THEME.colors.primary,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  faqAnswer: {
    marginTop: 12,
    fontSize: 14,
    color: THEME.colors.gray[600],
    lineHeight: 20,
  },
  linksCard: {
    padding: 0,
    overflow: 'hidden',
  },
  linkItem: {
    padding: 16,
  },
  linkText: {
    fontSize: 16,
    color: THEME.colors.dark,
  },
  linkDivider: {
    height: 1,
    backgroundColor: THEME.colors.gray[200],
  },
  emergencyCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 2,
    borderColor: '#FCA5A5',
    marginBottom: 32,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#991B1B',
    marginBottom: 8,
  },
  emergencyText: {
    fontSize: 14,
    color: '#7F1D1D',
    marginBottom: 16,
    lineHeight: 20,
  },
  emergencyButton: {
    backgroundColor: '#DC2626',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  emergencyButtonText: {
    color: THEME.colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
