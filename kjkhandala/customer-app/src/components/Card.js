import React from 'react';
import { View, StyleSheet } from 'react-native';
import { THEME } from '../config/theme';

/**
 * Card component matching website design
 * @param {ReactNode} children - Card content
 * @param {object} style - Additional styles
 * @param {string} shadow - 'sm' | 'md' | 'lg' | 'xl'
 */
export default function Card({ children, style, shadow = 'md', ...props }) {
  const getShadowStyle = () => {
    return THEME?.shadows?.[shadow] || THEME?.shadows?.md || {};
  };

  return (
    <View style={[styles.card, getShadowStyle(), style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...(THEME?.components?.card || {}),
  },
});
