// Website Design System - Voyage Bus
export const COLORS = {
  // Primary brand colors from website
  primary: '#E63946',      // hsl(0, 72%, 51%) - Red
  secondary: '#1D3557',    // hsl(221, 83%, 23%) - Navy
  accent: '#F1FAEE',       // hsl(120, 60%, 97%) - Light mint
  
  // Status colors
  success: '#10b981',      // Green
  warning: '#f59e0b',      // Amber
  danger: '#ef4444',       // Red
  info: '#3b82f6',         // Blue
  
  // Neutral colors
  dark: '#222222',         // hsl(222, 40%, 15%) - Dark text
  light: '#f5f5f5',        // Light background
  white: '#ffffff',
  black: '#000000',
  
  // Gray scale (matching website)
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',        // Input backgrounds
    200: '#e5e5e5',        // Borders
    300: '#d4d4d4',
    400: '#a3a3a3',        // Placeholders
    500: '#737373',
    600: '#666666',        // Secondary text
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  
  // Gradient colors
  gradient: {
    start: '#E63946',      // Red
    end: '#1D3557',        // Navy
  },
};

export const PAYMENT_METHODS = [
  { 
    id: 'CASH', 
    name: 'Pay at Office', 
    description: 'Reserve now, pay at any of our offices',
    icon: '🏢',
    recommended: true
  },
  { 
    id: 'MOBILE_MONEY', 
    name: 'Mobile Money', 
    description: 'Orange Money, Mascom MyZaka',
    icon: '📱'
  },
  { 
    id: 'CARD', 
    name: 'Credit/Debit Card', 
    description: 'Visa, Mastercard',
    icon: '💳'
  },
  { 
    id: 'BANK_TRANSFER', 
    name: 'Bank Transfer', 
    description: 'Direct bank transfer',
    icon: '🏦'
  },
];

export const BUS_AMENITIES = [
  { id: 'wifi', name: 'WiFi', icon: '📶' },
  { id: 'charging', name: 'Charging Ports', icon: '🔌' },
  { id: 'ac', name: 'Air Conditioning', icon: '❄️' },
  { id: 'movies', name: 'Onboard Movies', icon: '🎬' },
  { id: 'tracking', name: 'Live Tracking', icon: '📍' },
  { id: 'reclining', name: 'Reclining Seats', icon: '🪑' },
  { id: 'toilet', name: 'Onboard Toilet', icon: '🚻' },
  { id: 'refreshments', name: 'Refreshments', icon: '☕' },
];

export const TRIP_STATUS = {
  SCHEDULED: 'scheduled',
  BOARDING: 'boarding',
  DEPARTED: 'departed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DELAYED: 'delayed',
};

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CHECKED_IN: 'checked_in',
  BOARDED: 'boarded',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

export const SEAT_STATUS = {
  AVAILABLE: 'available',
  SELECTED: 'selected',
  BOOKED: 'booked',
  RESERVED: 'reserved',
};

export const NOTIFICATION_TYPES = {
  BOOKING_CONFIRMATION: 'booking_confirmation',
  PAYMENT_SUCCESS: 'payment_success',
  REFUND_STATUS: 'refund_status',
  TRIP_REMINDER: 'trip_reminder',
  DEPARTURE_CHANGE: 'departure_change',
  BUS_ARRIVAL: 'bus_arrival',
  PROMOTION: 'promotion',
  DELAY: 'delay',
  EMERGENCY: 'emergency',
};

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
export const PAYMENT_TIMEOUT = 600000; // 10 minutes
export const SEARCH_DEBOUNCE = 500; // 500ms
