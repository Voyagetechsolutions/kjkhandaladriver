// App theme colors - Professional Blue Theme
export const theme = {
  colors: {
    primary: '#1E3A8A', // Deep Blue
    secondary: '#3B82F6', // Bright Blue
    accent: '#60A5FA', // Light Blue
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#333333',
    textLight: '#666666',
    textWhite: '#FFFFFF',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
    border: '#E0E0E0',
    disabled: '#CCCCCC',
    
    // Status colors
    active: '#4CAF50',
    inactive: '#9E9E9E',
    pending: '#FF9800',
    completed: '#4CAF50',
    cancelled: '#F44336',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 999,
  },
  
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
    xxxl: 32,
  },
  
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export type Theme = typeof theme;
