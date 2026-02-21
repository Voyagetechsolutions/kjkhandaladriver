import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { THEME } from '../../config/theme';
import { Card, GradientHeader } from '../../components';

export default function TermsPrivacyScreen() {
  const [activeTab, setActiveTab] = useState('terms');

  const termsContent = [
    {
      title: '1. Acceptance of Risk',
      content: [
        'By using our services, passengers travel entirely at their own risk.',
        'The company is not liable for:',
        '• Loss or damage to property',
        '• Bodily injury',
        '• Delays or cancellations',
        '• Direct or indirect damages',
        'This includes negligence by employees or agents.',
      ],
    },
    {
      title: '2. Online Booking',
      content: [
        'All bookings must be made through the app or official agents.',
        'Payment is required during booking.',
        'Credit/debit card bookings may require the cardholder to show their card and ID at check-in.',
      ],
    },
    {
      title: '3. Ticket Cancellation and Refunds',
      content: [
        'Full refund if cancelled 72+ hours before departure.',
        'No refund if cancelled within 24 hours of departure.',
        'Refunds go back to the original payer.',
      ],
    },
    {
      title: '4. Seat Allocation',
      content: [
        'Seats are assigned on a first-come, first-served basis.',
        'Seat requests may be made, but are not guaranteed.',
      ],
    },
    {
      title: '5. Luggage Policy',
      content: [
        '1 free bag (20kg).',
        'Extra luggage may incur fees.',
        'Luggage is transported at the passenger\'s risk.',
        'Dangerous or illegal items are strictly prohibited.',
      ],
    },
    {
      title: '6. Boarding Process',
      content: [
        'Check-in closes 15 minutes before departure.',
        'Passengers arriving late may lose their seat and must purchase a new ticket.',
      ],
    },
    {
      title: '7. Code of Conduct',
      content: [
        'Disrespectful, disruptive, or unsafe behavior will result in removal without refund.',
        'Smoking, alcohol, and drugs are prohibited on all buses.',
      ],
    },
    {
      title: '8. Schedule Changes',
      content: [
        'The company may change schedules due to:',
        '• Weather',
        '• Mechanical issues',
        '• Road closures',
        '• Safety concerns',
        'Passengers will be notified where possible.',
      ],
    },
  ];

  const privacyContent = [
    {
      title: '1. Information We Collect',
      content: [
        'Personal information: Name, email, phone number, ID number',
        'Payment information: Card details, mobile money numbers',
        'Booking information: Trip details, seat preferences',
        'Device information: IP address, device type, app version',
        'Location data: GPS location for live tracking (with permission)',
      ],
    },
    {
      title: '2. How We Use Your Information',
      content: [
        'Process bookings and payments',
        'Send booking confirmations and updates',
        'Provide customer support',
        'Improve our services',
        'Send promotional offers (with your consent)',
        'Comply with legal requirements',
      ],
    },
    {
      title: '3. Information Sharing',
      content: [
        'We do not sell your personal information.',
        'We may share information with:',
        '• Payment processors',
        '• Service providers',
        '• Law enforcement (when required)',
      ],
    },
    {
      title: '4. Data Security',
      content: [
        'We use industry-standard encryption',
        'Secure payment processing',
        'Regular security audits',
        'Access controls and authentication',
      ],
    },
    {
      title: '5. Your Rights',
      content: [
        'Access your personal data',
        'Correct inaccurate data',
        'Request data deletion',
        'Opt-out of marketing communications',
        'Withdraw consent for data processing',
      ],
    },
    {
      title: '6. Cookies and Tracking',
      content: [
        'We use cookies to improve user experience',
        'Analytics to understand app usage',
        'You can disable cookies in your device settings',
      ],
    },
    {
      title: '7. Children\'s Privacy',
      content: [
        'Our services are not intended for children under 13',
        'We do not knowingly collect data from children',
      ],
    },
    {
      title: '8. Changes to Privacy Policy',
      content: [
        'We may update this policy periodically',
        'Users will be notified of significant changes',
        'Continued use implies acceptance of changes',
      ],
    },
  ];

  const content = activeTab === 'terms' ? termsContent : privacyContent;

  return (
    <View style={styles.container}>
      <GradientHeader title="Terms & Privacy" />

      <View style={styles.content}>
        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'terms' && styles.tabActive]}
            onPress={() => setActiveTab('terms')}
          >
            <Text
              style={[styles.tabText, activeTab === 'terms' && styles.tabTextActive]}
            >
              Terms & Conditions
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'privacy' && styles.tabActive]}
            onPress={() => setActiveTab('privacy')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'privacy' && styles.tabTextActive,
              ]}
            >
              Privacy Policy
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.introCard}>
            <Text style={styles.introText}>
              {activeTab === 'terms'
                ? 'By booking a ticket with Voyage Onboard, you agree to be bound by these terms and conditions. Please read them carefully.'
                : 'Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.'}
            </Text>
            <Text style={styles.lastUpdated}>
              Last updated: {new Date().toLocaleDateString()}
            </Text>
          </Card>

          {content.map((section, index) => (
            <Card key={index} style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.content.map((item, itemIndex) => (
                <Text key={itemIndex} style={styles.sectionText}>
                  {item}
                </Text>
              ))}
            </Card>
          ))}

          <Card style={styles.contactCard}>
            <Text style={styles.contactTitle}>Questions?</Text>
            <Text style={styles.contactText}>
              If you have any questions about these {activeTab === 'terms' ? 'terms' : 'policies'}, please contact us at:
            </Text>
            <Text style={styles.contactEmail}>support@voyagebus.com</Text>
          </Card>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
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
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.gray[200],
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: THEME.colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.gray[600],
  },
  tabTextActive: {
    color: THEME.colors.primary,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  introCard: {
    marginBottom: 16,
    backgroundColor: THEME.colors.blue[50],
  },
  introText: {
    fontSize: 14,
    color: THEME.colors.gray[700],
    lineHeight: 20,
    marginBottom: 12,
  },
  lastUpdated: {
    fontSize: 12,
    color: THEME.colors.gray[500],
    fontStyle: 'italic',
  },
  sectionCard: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.colors.dark,
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    color: THEME.colors.gray[600],
    lineHeight: 20,
    marginBottom: 6,
  },
  contactCard: {
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: THEME.colors.primary + '10',
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.colors.dark,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: THEME.colors.gray[600],
    marginBottom: 8,
  },
  contactEmail: {
    fontSize: 14,
    color: THEME.colors.primary,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 32,
  },
});
