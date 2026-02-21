import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SyncEngine, SyncStatus } from '../services/syncEngine';

export const SyncStatusBar: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(SyncEngine.getStatus());
  const [expanded, setExpanded] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Subscribe to sync status updates
    const unsubscribe = SyncEngine.subscribe((status) => {
      setSyncStatus(status);
      
      // Auto-show when syncing starts
      if (status.isSyncing && !expanded) {
        setExpanded(true);
      }
      
      // Auto-hide after sync completes (after 3 seconds)
      if (!status.isSyncing && status.progress === 100) {
        setTimeout(() => {
          setExpanded(false);
        }, 3000);
      }
    });

    return () => unsubscribe();
  }, [expanded]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: expanded ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [expanded]);

  const handleManualSync = async () => {
    try {
      await SyncEngine.forceSyncNow();
    } catch (error: any) {
      console.error('Manual sync failed:', error);
    }
  };

  const getStatusColor = () => {
    if (!syncStatus.isOnline) return '#F44336';
    if (syncStatus.isSyncing) return '#FF9800';
    if (syncStatus.totalUnsynced > 0) return '#FFC107';
    return '#4CAF50';
  };

  const getStatusText = () => {
    if (!syncStatus.isOnline) return 'Offline';
    if (syncStatus.isSyncing) return `Syncing... ${Math.round(syncStatus.progress)}%`;
    if (syncStatus.totalUnsynced > 0) return `${syncStatus.totalUnsynced} unsynced`;
    return 'All synced';
  };

  const getStatusIcon = () => {
    if (!syncStatus.isOnline) return '📵';
    if (syncStatus.isSyncing) return '🔄';
    if (syncStatus.totalUnsynced > 0) return '⚠️';
    return '✅';
  };

  return (
    <View style={styles.container}>
      {/* Compact Status Bar */}
      <TouchableOpacity
        style={[styles.statusBar, { backgroundColor: getStatusColor() }]}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
        <Text style={styles.statusText}>{getStatusText()}</Text>
        {syncStatus.isSyncing && (
          <ActivityIndicator size="small" color="#fff" style={styles.spinner} />
        )}
        {!syncStatus.isSyncing && syncStatus.totalUnsynced > 0 && (
          <TouchableOpacity
            style={styles.syncButton}
            onPress={handleManualSync}
            disabled={!syncStatus.isOnline}
          >
            <Text style={styles.syncButtonText}>Sync Now</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* Expanded Details */}
      {expanded && (
        <Animated.View
          style={[
            styles.expandedContainer,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {syncStatus.isSyncing && syncStatus.currentItem && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Current:</Text>
              <Text style={styles.detailValue}>{syncStatus.currentItem}</Text>
            </View>
          )}

          {syncStatus.lastSync && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Last Sync:</Text>
              <Text style={styles.detailValue}>
                {new Date(syncStatus.lastSync).toLocaleString('en-ZA', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          )}

          {syncStatus.errors.length > 0 && (
            <View style={styles.errorsContainer}>
              <Text style={styles.errorsTitle}>Errors:</Text>
              {syncStatus.errors.slice(0, 3).map((error, index) => (
                <Text key={index} style={styles.errorText}>
                  • {error}
                </Text>
              ))}
            </View>
          )}

          {syncStatus.isSyncing && (
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${syncStatus.progress}%` },
                ]}
              />
            </View>
          )}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  statusIcon: {
    fontSize: 16,
  },
  statusText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  spinner: {
    marginLeft: 8,
  },
  syncButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  expandedContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  errorsContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
  errorsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#D32F2F',
    marginTop: 2,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
});
