// API service for backend communication
import { User, DriverProfile, Bus, Trip, Shift } from '../types';

// Replace with your actual API base URL
const API_BASE_URL = 'https://your-api-url.com/api';

export class ApiService {
  private static token: string | null = null;

  static setToken(token: string | null) {
    this.token = token;
  }

  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  // Authentication endpoints
  static async login(phoneNumber: string, password: string) {
    return this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, password }),
    });
  }

  static async requestPasswordReset(phoneNumber: string) {
    return this.request<{ message: string }>('/auth/request-reset', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
    });
  }

  static async resetPassword(phoneNumber: string, code: string, newPassword: string) {
    return this.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, code, newPassword }),
    });
  }

  // Driver endpoints
  static async getDriverProfile(driverId: string) {
    return this.request<DriverProfile>(`/drivers/${driverId}`);
  }

  static async getAssignedBus(driverId: string) {
    return this.request<Bus>(`/drivers/${driverId}/bus`);
  }

  static async getTodaysTrips(driverId: string) {
    return this.request<Trip[]>(`/drivers/${driverId}/trips/today`);
  }

  static async getActiveShift(driverId: string) {
    return this.request<Shift | null>(`/drivers/${driverId}/shift/active`);
  }
}
