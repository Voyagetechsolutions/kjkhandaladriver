// Voyage Bus Design System - Matching Website
import { COLORS } from './constants';

export const THEME = {
  // Colors
  colors: COLORS || {},

  // Typography
  typography: {
    // Font sizes
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 28,
      '4xl': 32,
    },
    
    // Font weights
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    
    // Line heights
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Spacing (matching website's spacing scale)
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
  },

  // Border radius
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },

  // Shadows (matching website's shadow system)
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },

  // Common component styles
  components: {
    // Card
    card: {
      backgroundColor: COLORS.white,
      borderRadius: 12,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },

    // Button - Primary
    buttonPrimary: {
      backgroundColor: COLORS.primary,
      borderRadius: 8,
      paddingVertical: 14,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonPrimaryText: {
      color: COLORS.white,
      fontSize: 16,
      fontWeight: '600',
    },

    // Button - Secondary
    buttonSecondary: {
      backgroundColor: COLORS.secondary,
      borderRadius: 8,
      paddingVertical: 14,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonSecondaryText: {
      color: COLORS.white,
      fontSize: 16,
      fontWeight: '600',
    },

    // Button - Outline
    buttonOutline: {
      backgroundColor: 'transparent',
      borderRadius: 8,
      paddingVertical: 14,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: COLORS.primary,
    },
    buttonOutlineText: {
      color: COLORS.primary,
      fontSize: 16,
      fontWeight: '600',
    },

    // Input
    input: {
      backgroundColor: COLORS.gray[100],
      borderRadius: 8,
      paddingVertical: 14,
      paddingHorizontal: 16,
      fontSize: 16,
      color: COLORS.dark,
      borderWidth: 1,
      borderColor: COLORS.gray[200],
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: COLORS.dark,
      marginBottom: 8,
    },
    inputError: {
      borderColor: COLORS.danger,
    },
    inputErrorText: {
      fontSize: 12,
      color: COLORS.danger,
      marginTop: 4,
    },

    // Header
    header: {
      backgroundColor: COLORS.primary,
      paddingTop: 60,
      paddingBottom: 20,
      paddingHorizontal: 20,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: COLORS.white,
    },
    headerSubtitle: {
      fontSize: 14,
      color: COLORS.white,
      opacity: 0.9,
      marginTop: 4,
    },

    // Badge
    badge: {
      paddingVertical: 4,
      paddingHorizontal: 12,
      borderRadius: 12,
      alignSelf: 'flex-start',
    },
    badgeText: {
      fontSize: 12,
      fontWeight: '600',
    },

    // Status badges
    badgeSuccess: {
      backgroundColor: COLORS.success + '20',
    },
    badgeSuccessText: {
      color: COLORS.success,
    },
    badgeWarning: {
      backgroundColor: COLORS.warning + '20',
    },
    badgeWarningText: {
      color: COLORS.warning,
    },
    badgeDanger: {
      backgroundColor: COLORS.danger + '20',
    },
    badgeDangerText: {
      color: COLORS.danger,
    },
    badgeInfo: {
      backgroundColor: COLORS.info + '20',
    },
    badgeInfoText: {
      color: COLORS.info,
    },

    // Divider
    divider: {
      height: 1,
      backgroundColor: COLORS.gray[200],
      marginVertical: 16,
    },

    // Container
    container: {
      flex: 1,
      backgroundColor: COLORS.light,
    },
    containerPadded: {
      flex: 1,
      backgroundColor: COLORS.light,
      padding: 16,
    },
  },

  // Gradient presets
  gradients: {
    primary: {
      colors: [COLORS?.gradient?.start || '#E63946', COLORS?.gradient?.end || '#1D3557'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    primaryVertical: {
      colors: [COLORS?.gradient?.start || '#E63946', COLORS?.gradient?.end || '#1D3557'],
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
    },
    primaryHorizontal: {
      colors: [COLORS?.gradient?.start || '#E63946', COLORS?.gradient?.end || '#1D3557'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 0 },
    },
  },
};

// Helper function to get status color
export const getStatusColor = (status) => {
  const statusColors = {
    success: COLORS.success,
    confirmed: COLORS.success,
    completed: COLORS.success,
    boarded: COLORS.success,
    
    warning: COLORS.warning,
    pending: COLORS.warning,
    processing: COLORS.warning,
    boarding: COLORS.warning,
    
    danger: COLORS.danger,
    cancelled: COLORS.danger,
    failed: COLORS.danger,
    
    info: COLORS.info,
    scheduled: COLORS.info,
    departed: COLORS.info,
    in_progress: COLORS.info,
  };
  
  return statusColors[status?.toLowerCase()] || COLORS.gray[500];
};

// Helper function to get status badge style
export const getStatusBadgeStyle = (status) => {
  const color = getStatusColor(status);
  return {
    badge: {
      ...THEME.components.badge,
      backgroundColor: color + '20',
    },
    text: {
      ...THEME.components.badgeText,
      color: color,
    },
  };
};

export default THEME;
