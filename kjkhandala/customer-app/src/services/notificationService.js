import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '../config/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const notificationService = {
  // Register for push notifications
  registerForPushNotifications: async (userId) => {
    try {
      if (!Device.isDevice) {
        console.log('Must use physical device for push notifications');
        return { data: null, error: 'Physical device required' };
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return { data: null, error: 'Permission not granted' };
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;

      // Save token to database
      await supabase
        .from('profiles')
        .update({ push_token: token })
        .eq('id', userId);

      // Save locally
      await AsyncStorage.setItem('pushToken', token);

      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#1e40af',
        });
      }

      return { data: token, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Send local notification
  sendLocalNotification: async (title, body, data = {}) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  },

  // Schedule notification
  scheduleNotification: async (title, body, trigger, data = {}) => {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger,
      });
      return { data: id, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Cancel notification
  cancelNotification: async (notificationId) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  // Get user notifications
  getUserNotifications: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Mark all as read
  markAllAsRead: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Subscribe to real-time notifications
  subscribeToNotifications: (userId, callback) => {
    const subscription = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new);
          // Send local notification
          notificationService.sendLocalNotification(
            payload.new.title,
            payload.new.message,
            payload.new.data
          );
        }
      )
      .subscribe();

    return subscription;
  },

  // Schedule trip reminders
  scheduleTripReminders: async (booking) => {
    try {
      const departureTime = new Date(booking.trip.departure_time);
      
      // 3 hours before
      const threeHoursBefore = new Date(departureTime.getTime() - 3 * 60 * 60 * 1000);
      if (threeHoursBefore > new Date()) {
        await notificationService.scheduleNotification(
          'Trip Reminder',
          `Your trip to ${booking.trip.route.destination.name} departs in 3 hours`,
          threeHoursBefore,
          { bookingId: booking.id, type: 'trip_reminder' }
        );
      }

      // 1 hour before
      const oneHourBefore = new Date(departureTime.getTime() - 60 * 60 * 1000);
      if (oneHourBefore > new Date()) {
        await notificationService.scheduleNotification(
          'Trip Reminder',
          `Your trip to ${booking.trip.route.destination.name} departs in 1 hour`,
          oneHourBefore,
          { bookingId: booking.id, type: 'trip_reminder' }
        );
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  },
};
