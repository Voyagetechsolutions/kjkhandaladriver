import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getStatusBadgeStyle } from '../config/theme';

/**
 * Badge component for status indicators
 * @param {string} status - Status type (success, warning, danger, info, etc.)
 * @param {string} children - Badge text
 * @param {object} style - Additional styles
 */
export default function Badge({ status, children, style, textStyle }) {
  const badgeStyle = getStatusBadgeStyle(status);

  return (
    <View style={[badgeStyle.badge, style]}>
      <Text style={[badgeStyle.text, textStyle]}>{children}</Text>
    </View>
  );
}
