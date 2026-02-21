import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../config/theme';

/**
 * Gradient header component matching website design
 * @param {string} title - Header title
 * @param {string} subtitle - Optional subtitle
 * @param {ReactNode} children - Additional header content
 * @param {object} style - Additional styles
 */
export default function GradientHeader({ title, subtitle, children, style }) {
  const gradientColors = THEME?.gradients?.primary?.colors || ['#E63946', '#1D3557'];
  const gradientStart = THEME?.gradients?.primary?.start || { x: 0, y: 0 };
  const gradientEnd = THEME?.gradients?.primary?.end || { x: 1, y: 1 };

  return (
    <LinearGradient
      colors={gradientColors}
      start={gradientStart}
      end={gradientEnd}
      style={[styles.header, style]}
    >
      <SafeAreaView>
        <View style={styles.content}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          {children}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  content: {
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: THEME?.colors?.white || '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: THEME?.colors?.white || '#ffffff',
    opacity: 0.9,
  },
});
