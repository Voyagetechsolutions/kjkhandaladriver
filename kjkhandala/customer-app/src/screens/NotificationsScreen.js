import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../config/constants';

export default function NotificationsScreen() {
  const notifications = [
    {
      id: 1,
      type: 'booking',
      title: 'Booking Confirmed',
      message: 'Your trip to Francistown has been confirmed',
      time: '2 hours ago',
      read: false,
    },
    {
      id: 2,
      type: 'reminder',
      title: 'Trip Reminder',
      message: 'Your trip departs in 3 hours',
      time: '3 hours ago',
      read: false,
    },
    {
      id: 3,
      type: 'promo',
      title: 'New Promotion',
      message: 'Get 20% off weekend trips with code WEEKEND20',
      time: '1 day ago',
      read: true,
    },
  ];

  const getIcon = (type) => {
    switch (type) {
      case 'booking': return '🎫';
      case 'reminder': return '⏰';
      case 'promo': return '🎁';
      default: return '📢';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity>
          <Text style={styles.markAllRead}>Mark all as read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {notifications.map((notif) => (
          <TouchableOpacity
            key={notif.id}
            style={[styles.notifCard, !notif.read && styles.notifCardUnread]}
          >
            <Text style={styles.notifIcon}>{getIcon(notif.type)}</Text>
            <View style={styles.notifContent}>
              <Text style={styles.notifTitle}>{notif.title}</Text>
              <Text style={styles.notifMessage}>{notif.message}</Text>
              <Text style={styles.notifTime}>{notif.time}</Text>
            </View>
            {!notif.read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        ))}

        {notifications.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  header: {
    backgroundColor: COLORS.white,
    padding: 15,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  markAllRead: {
    fontSize: 14,
    color: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  notifCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  notifCardUnread: {
    backgroundColor: COLORS.primary + '05',
  },
  notifIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  notifMessage: {
    fontSize: 14,
    color: COLORS.gray[600],
    marginBottom: 4,
  },
  notifTime: {
    fontSize: 12,
    color: COLORS.gray[500],
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
    marginTop: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray[500],
  },
});
