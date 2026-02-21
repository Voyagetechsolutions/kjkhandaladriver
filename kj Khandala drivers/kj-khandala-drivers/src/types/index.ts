// Type definitions for the app

export interface User {
  id: string;
  phoneNumber: string;
  phone: string;
  role: 'driver' | 'admin' | 'passenger';
  name: string;
  email?: string;
}

export interface DriverProfile extends User {
  role: 'driver';
  licenseNumber: string;
  experience: number;
  rating: number;
  totalTrips: number;
}

export interface Bus {
  id: string;
  registrationNumber: string;
  number_plate: string;
  model: string;
  capacity: number;
  seating_capacity: number;
  status: 'active' | 'maintenance' | 'inactive';
}

export interface Trip {
  id: string;
  busId: string;
  driverId: string;
  route: string;
  routes?: any;
  startLocation: string;
  endLocation: string;
  scheduledDeparture: string;
  scheduled_departure: string;
  scheduledArrival: string;
  scheduled_arrival: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  passengers: number;
}

export interface Shift {
  id: string;
  driverId: string;
  startTime: string;
  endTime: string;
  status: 'active' | 'completed' | 'upcoming';
  totalHours: number;
  terminal: string;
  busId: string;
  date: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface MaintenanceAlert {
  id: string;
  busId: string;
  type: 'scheduled' | 'urgent' | 'warning';
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
}

export interface DispatchMessage {
  id: string;
  driverId: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  read: boolean;
}

export interface PreTripInspection {
  id: string;
  driverId: string;
  busId: string;
  tripId?: string;
  date: string;
  items: InspectionItem[];
  images: string[];
  location: {
    latitude: number;
    longitude: number;
  };
  status: 'passed' | 'failed' | 'pending';
  synced: boolean;
  createdAt: string;
}

export interface InspectionItem {
  name: string;
  category: 'tyres' | 'brakes' | 'lights' | 'wipers' | 'mirrors' | 'engine' | 'dashboard' | 'safety' | 'cleanliness';
  status: 'good' | 'fair' | 'poor' | 'failed';
  notes?: string;
  image?: string;
}

export interface FuelLog {
  id: string;
  driverId: string;
  busId: string;
  tripId?: string;
  litres: number;
  amount: number;
  fuelStation: string;
  receiptImage?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  date: string;
  synced: boolean;
  createdAt: string;
}

export interface BreakdownReport {
  id: string;
  driverId: string;
  busId: string;
  tripId?: string;
  type: 'mechanical' | 'electrical' | 'accident' | 'other';
  description: string;
  partsAffected: string[];
  images: string[];
  videos?: string[];
  location: {
    latitude: number;
    longitude: number;
  };
  severityLevel: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'acknowledged' | 'in-progress' | 'resolved';
  createdAt: string;
  synced: boolean;
}

export interface Passenger {
  id: string;
  ticketNumber: string;
  name: string;
  phoneNumber: string;
  tripId: string;
  boarded: boolean;
  boardedTime?: string;
  boardedLocation?: {
    latitude: number;
    longitude: number;
  };
}

export interface BusHealth {
  busId: string;
  currentMileage: number;
  lastServiceDate: string;
  nextServiceDue: string;
  nextServiceMileage: number;
  serviceHistory: ServiceRecord[];
  activeMaintenanceTickets: MaintenanceTicket[];
  recurringIssues: RecurringIssue[];
}

export interface ServiceRecord {
  id: string;
  date: string;
  type: 'routine' | 'repair' | 'inspection';
  description: string;
  cost: number;
  mileage: number;
  performedBy: string;
}

export interface MaintenanceTicket {
  id: string;
  busId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdAt: string;
  resolvedAt?: string;
}

export interface RecurringIssue {
  issue: string;
  occurrences: number;
  lastOccurrence: string;
  severity: 'minor' | 'moderate' | 'major';
}
