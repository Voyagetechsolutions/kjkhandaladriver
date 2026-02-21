// Mock data for all driver app features
import {
  DriverProfile,
  Bus,
  Trip,
  Shift,
  MaintenanceAlert,
  DispatchMessage,
  BusHealth,
  Passenger,
} from '../types';

export const mockDriverProfile: DriverProfile = {
  id: '1',
  phoneNumber: '+27123456789',
  role: 'driver',
  name: 'John Doe',
  email: 'john.doe@kjkhandala.com',
  licenseNumber: 'DL123456',
  experience: 5,
  rating: 4.8,
  totalTrips: 1250,
};

export const mockBus: Bus = {
  id: 'bus-001',
  registrationNumber: 'KZN 123 GP',
  model: 'Mercedes-Benz Sprinter',
  capacity: 22,
  status: 'active',
};

export const mockTrips: Trip[] = [
  {
    id: 'trip-001',
    busId: 'bus-001',
    driverId: '1',
    route: 'Route 15A',
    startLocation: 'Durban CBD',
    endLocation: 'Umlazi',
    scheduledDeparture: '2025-11-24T08:00:00',
    scheduledArrival: '2025-11-24T09:30:00',
    status: 'completed',
    passengers: 18,
  },
  {
    id: 'trip-002',
    busId: 'bus-001',
    driverId: '1',
    route: 'Route 15A',
    startLocation: 'Umlazi',
    endLocation: 'Durban CBD',
    scheduledDeparture: '2025-11-24T10:00:00',
    scheduledArrival: '2025-11-24T11:30:00',
    status: 'in-progress',
    passengers: 15,
  },
  {
    id: 'trip-003',
    busId: 'bus-001',
    driverId: '1',
    route: 'Route 15A',
    startLocation: 'Durban CBD',
    endLocation: 'Umlazi',
    scheduledDeparture: '2025-11-24T14:00:00',
    scheduledArrival: '2025-11-24T15:30:00',
    status: 'scheduled',
    passengers: 0,
  },
  {
    id: 'trip-004',
    busId: 'bus-001',
    driverId: '1',
    route: 'Route 15A',
    startLocation: 'Umlazi',
    endLocation: 'Durban CBD',
    scheduledDeparture: '2025-11-25T08:00:00',
    scheduledArrival: '2025-11-25T09:30:00',
    status: 'scheduled',
    passengers: 0,
  },
];

export const mockShifts: Shift[] = [
  {
    id: 'shift-001',
    driverId: '1',
    startTime: '2025-11-24T07:00:00',
    endTime: '2025-11-24T17:00:00',
    status: 'active',
    totalHours: 10,
    terminal: 'Durban CBD Terminal',
    busId: 'bus-001',
    date: '2025-11-24',
  },
  {
    id: 'shift-002',
    driverId: '1',
    startTime: '2025-11-25T07:00:00',
    endTime: '2025-11-25T17:00:00',
    status: 'upcoming',
    totalHours: 10,
    terminal: 'Durban CBD Terminal',
    busId: 'bus-001',
    date: '2025-11-25',
  },
  {
    id: 'shift-003',
    driverId: '1',
    startTime: '2025-11-23T07:00:00',
    endTime: '2025-11-23T17:00:00',
    status: 'completed',
    totalHours: 10,
    terminal: 'Durban CBD Terminal',
    busId: 'bus-001',
    date: '2025-11-23',
  },
];

export const mockMaintenanceAlerts: MaintenanceAlert[] = [
  {
    id: 'alert-001',
    busId: 'bus-001',
    type: 'scheduled',
    title: 'Routine Service Due',
    description: '10,000 km service required',
    dueDate: '2025-11-30',
    status: 'pending',
    createdAt: '2025-11-20T10:00:00',
  },
  {
    id: 'alert-002',
    busId: 'bus-001',
    type: 'warning',
    title: 'Brake Pad Wear',
    description: 'Front brake pads at 30% - replacement recommended',
    dueDate: '2025-12-05',
    status: 'pending',
    createdAt: '2025-11-22T14:30:00',
  },
];

export const mockDispatchMessages: DispatchMessage[] = [
  {
    id: 'msg-001',
    driverId: '1',
    message: 'Route 15A has heavy traffic. Consider alternate route via M4.',
    priority: 'medium',
    createdAt: '2025-11-24T09:15:00',
    read: false,
  },
  {
    id: 'msg-002',
    driverId: '1',
    message: 'Reminder: Staff meeting at 5 PM today at CBD Terminal.',
    priority: 'low',
    createdAt: '2025-11-24T08:00:00',
    read: true,
  },
  {
    id: 'msg-003',
    driverId: '1',
    message: 'URGENT: Road closure on Main Road. Use alternative route.',
    priority: 'urgent',
    createdAt: '2025-11-24T10:30:00',
    read: false,
  },
];

export const mockBusHealth: BusHealth = {
  busId: 'bus-001',
  currentMileage: 87500,
  lastServiceDate: '2025-10-15',
  nextServiceDue: '2025-11-30',
  nextServiceMileage: 90000,
  serviceHistory: [
    {
      id: 'service-001',
      date: '2025-10-15',
      type: 'routine',
      description: '80,000 km service - oil change, filter replacement',
      cost: 2500,
      mileage: 80000,
      performedBy: 'KJ Auto Services',
    },
    {
      id: 'service-002',
      date: '2025-09-10',
      type: 'repair',
      description: 'Replaced alternator',
      cost: 3200,
      mileage: 76500,
      performedBy: 'KJ Auto Services',
    },
    {
      id: 'service-003',
      date: '2025-07-20',
      type: 'routine',
      description: '70,000 km service',
      cost: 2800,
      mileage: 70000,
      performedBy: 'KJ Auto Services',
    },
  ],
  activeMaintenanceTickets: [
    {
      id: 'ticket-001',
      busId: 'bus-001',
      title: 'Air conditioning weak',
      description: 'AC not cooling properly on hot days',
      priority: 'medium',
      status: 'open',
      createdAt: '2025-11-22T11:00:00',
    },
  ],
  recurringIssues: [
    {
      issue: 'Windshield wiper motor',
      occurrences: 3,
      lastOccurrence: '2025-10-05',
      severity: 'moderate',
    },
    {
      issue: 'Door sensor malfunction',
      occurrences: 2,
      lastOccurrence: '2025-09-15',
      severity: 'minor',
    },
  ],
};

export const mockPassengers: Passenger[] = [
  {
    id: 'pass-001',
    ticketNumber: 'TKT-001234',
    name: 'Sarah Johnson',
    phoneNumber: '+27821234567',
    tripId: 'trip-002',
    boarded: true,
    boardedTime: '2025-11-24T10:05:00',
    boardedLocation: {
      latitude: -29.8587,
      longitude: 31.0218,
    },
  },
  {
    id: 'pass-002',
    ticketNumber: 'TKT-001235',
    name: 'Michael Brown',
    phoneNumber: '+27829876543',
    tripId: 'trip-002',
    boarded: false,
  },
];
