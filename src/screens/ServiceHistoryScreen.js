import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors, Typography } from '../theme';
import { useVehicles } from '../context/VehicleContext';
import MaintenanceTypes from '../data/maintenanceTypes';
import { formatMileage } from '../utils/maintenanceCalculator';

export default function ServiceHistoryScreen({ navigation }) {
  const { vehicles, maintenanceLog, selectedVehicleId, removeLogEntry } = useVehicles();

  const selectedVehicle = useMemo(() => {
    return vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0] || null;
  }, [vehicles, selectedVehicleId]);

  const vehicleLog = useMemo(() => {
    if (!selectedVehicle) return [];
    return maintenanceLog
      .filter((l) => l.vehicleId === selectedVehicle.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [selectedVehicle, maintenanceLog]);

  // Group by month/year
  const groupedLog = useMemo(() => {
    const groups = {};
    vehicleLog.forEach((entry) => {
      const date = new Date(entry.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      if (!groups[key]) {
        groups[key] = { key, label, entries: [] };
      }
      groups[key].entries.push(entry);
    });
    return Object.values(groups).sort((a, b) => b.key.localeCompare(a.key));
  }, [vehicleLog]);

  const handleDeleteEntry = useCallback(
    (entry) => {
      const typeInfo = MaintenanceTypes[entry.type];
      Alert.alert(
        'Delete Record',
        `Remove this "${typeInfo?.name || entry.type}" service record?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => removeLogEntry(entry.id),
          },
        ]
      );
    },
    [removeLogEntry]
  );

  if (!selectedVehicle) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No vehicle selected</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Service History</Text>
          <Text style={styles.subtitle}>
            {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
          </Text>
        </View>

        {vehicleLog.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>&#128203;</Text>
            <Text style={styles.emptyTitle}>No service records yet</Text>
            <Text style={styles.emptyDesc}>
              When you mark maintenance items as completed, they will appear here as a service history timeline.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.summaryBar}>
              <Text style={styles.summaryText}>
                {vehicleLog.length} service{vehicleLog.length !== 1 ? 's' : ''} recorded
              </Text>
            </View>

            {groupedLog.map((group) => (
              <View key={group.key} style={styles.group}>
                <Text style={styles.groupLabel}>{group.label}</Text>
                {group.entries.map((entry) => {
                  const typeInfo = MaintenanceTypes[entry.type];
                  const categoryColor = Colors[typeInfo?.category] || Colors.textMuted;
                  return (
                    <TouchableOpacity
                      key={entry.id}
                      style={styles.logEntry}
                      onLongPress={() => handleDeleteEntry(entry)}
                      delayLongPress={600}
                    >
                      <View style={[styles.logDot, { backgroundColor: categoryColor }]} />
                      <View style={styles.logContent}>
                        <Text style={styles.logServiceName}>
                          {typeInfo?.name || entry.type}
                        </Text>
                        <Text style={styles.logMileage}>
                          at {formatMileage(entry.mileage)} miles
                        </Text>
                        <Text style={styles.logDate}>
                          {new Date(entry.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </Text>
                        {entry.notes ? (
                          <Text style={styles.logNotes}>{entry.notes}</Text>
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}

            <Text style={styles.hint}>Long-press an entry to delete it</Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    ...Typography.title,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  summaryBar: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  summaryText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  group: {
    marginBottom: 20,
  },
  groupLabel: {
    ...Typography.captionBold,
    color: Colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    paddingLeft: 4,
  },
  logEntry: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  logDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
    marginRight: 12,
  },
  logContent: {
    flex: 1,
  },
  logServiceName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  logMileage: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  logDate: {
    ...Typography.small,
    color: Colors.textMuted,
    marginTop: 2,
  },
  logNotes: {
    ...Typography.small,
    color: Colors.textMuted,
    fontStyle: 'italic',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    ...Typography.subtitle,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptyDesc: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textMuted,
  },
  hint: {
    ...Typography.small,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
});
