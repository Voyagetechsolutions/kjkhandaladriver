import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { THEME } from '../config/theme';

/**
 * Input component matching website design
 * @param {string} label - Input label
 * @param {string} error - Error message
 * @param {object} style - Additional container styles
 * @param {object} inputStyle - Additional input styles
 */
export default function Input({ label, error, style, inputStyle, ...props }) {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          inputStyle,
        ]}
        placeholderTextColor={THEME?.colors?.gray?.[400] || '#a3a3a3'}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    ...(THEME?.components?.inputLabel || {}),
  },
  input: {
    ...(THEME?.components?.input || {}),
  },
  inputError: {
    ...(THEME?.components?.inputError || {}),
  },
  errorText: {
    ...(THEME?.components?.inputErrorText || {}),
  },
});
