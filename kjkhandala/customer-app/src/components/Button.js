import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { THEME } from '../config/theme';

/**
 * Button component matching website design
 * @param {string} variant - 'primary' | 'secondary' | 'outline' | 'danger'
 * @param {boolean} loading - Show loading spinner
 * @param {boolean} disabled - Disable button
 * @param {function} onPress - Press handler
 * @param {string} children - Button text
 * @param {object} style - Additional styles
 */
export default function Button({
  variant = 'primary',
  loading = false,
  disabled = false,
  onPress,
  children,
  style,
  textStyle,
  ...props
}) {
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.buttonSecondary;
      case 'outline':
        return styles.buttonOutline;
      case 'danger':
        return styles.buttonDanger;
      default:
        return styles.buttonPrimary;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return styles.buttonOutlineText;
      default:
        return styles.buttonText;
    }
  };

  return (
    <TouchableOpacity
      style={[
        getButtonStyle(),
        (disabled || loading) && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? THEME?.colors?.primary || '#E63946' : THEME?.colors?.white || '#ffffff'} />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonPrimary: {
    ...(THEME?.components?.buttonPrimary || {}),
  },
  buttonSecondary: {
    ...(THEME?.components?.buttonSecondary || {}),
  },
  buttonOutline: {
    ...(THEME?.components?.buttonOutline || {}),
  },
  buttonDanger: {
    backgroundColor: THEME?.colors?.danger || '#ef4444',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: THEME?.colors?.white || '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonOutlineText: {
    color: THEME?.colors?.primary || '#E63946',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
