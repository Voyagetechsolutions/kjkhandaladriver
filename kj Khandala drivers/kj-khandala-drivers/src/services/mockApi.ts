// Mock API for development/testing
import { User, DriverProfile, Bus, Trip, Shift } from '../types';

// Mock data
const mockDriverProfile: DriverProfile = {
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

const mockBus: Bus = {
  id: 'bus-001',
  registrationNumber: 'KZN 123 GP',
  model: 'Mercedes-Benz Sprinter',
  capacity: 22,
  status: 'active',
};

const mockTrips: Trip[] = [
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
];

const mockShift: Shift = {
  id: 'shift-001',
  driverId: '1',
  startTime: '2025-11-24T07:00:00',
  endTime: '2025-11-24T17:00:00',
  status: 'active',
  totalHours: 10,
};

// Mock API service
export class MockApiService {
  private static delay(ms: number = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async login(phoneNumber: string, password: string) {
    await this.delay(1500);
    
    // Mock validation
    if (phoneNumber === '+27123456789' && password === 'password123') {
      return {
        user: mockDriverProfile,
        token: 'mock-jwt-token-12345',
      };
    }
    
    throw new Error('Invalid phone number or password');
  }

  static async requestPasswordReset(phoneNumber: string) {
    await this.delay(1000);
    
    if (phoneNumber === '+27123456789') {
      return { message: 'Reset code sent to your phone' };
    }
    
    throw new Error('Phone number not found');
  }

  static async resetPassword(phoneNumber: string, code: string, newPassword: string) {
    await this.delay(1000);
    
    if (code === '123456') {
      return { message: 'Password reset successful' };
    }
    
    throw new Error('Invalid reset code');
  }

  static async getDriverProfile(driverId: string) {
    await this.delay(800);
    return mockDriverProfile;
  }

  static async getAssignedBus(driverId: string) {
    await this.delay(800);
    return mockBus;
  }

  static async getTodaysTrips(driverId: string) {
    await this.delay(800);
    return mockTrips;
  }

  static async getActiveShift(driverId: string) {
    await this.delay(800);
    return mockShift;
  }
}
