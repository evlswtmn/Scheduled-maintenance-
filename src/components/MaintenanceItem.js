import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography } from '../theme';
import { formatMileage, getStatusDisplay } from '../utils/maintenanceCalculator';

export default function MaintenanceItem({ item, onPress, onLogService }) {
  const statusDisplay = getStatusDisplay(item.status);
  const statusColor = Colors[statusDisplay.colorKey] || Colors.textSecondary;
  const categoryColor = Colors[item.typeInfo?.category] || Colors.textSecondary;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.categoryBar, { backgroundColor: categoryColor }]} />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.titleArea}>
            <Text style={styles.serviceName}>{item.typeInfo?.name || item.type}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              <Text style={[styles.statusLabel, { color: statusColor }]}>
                {statusDisplay.label}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.mileageInfo}>
            <Text style={styles.label}>NEXT DUE</Text>
            <Text style={styles.mileageValue}>
              {formatMileage(item.nextDueMiles)} mi
            </Text>
          </View>

          <View style={styles.mileageInfo}>
            <Text style={styles.label}>
              {item.milesUntilDue < 0 ? 'OVERDUE BY' : 'MILES TO GO'}
            </Text>
            <Text style={[styles.milesRemaining, { color: statusColor }]}>
              {item.milesUntilDue < 0
                ? formatMileage(Math.abs(item.milesUntilDue))
                : formatMileage(item.milesUntilDue)}{' '}
              mi
            </Text>
          </View>
        </View>

        {item.notes ? (
          <Text style={styles.notes} numberOfLines={2}>
            {item.notes}
          </Text>
        ) : null}

        {item.lastServiceMileage ? (
          <Text style={styles.lastService}>
            Last service: {formatMileage(item.lastServiceMileage)} mi
          </Text>
        ) : null}

        {onLogService ? (
          <TouchableOpacity
            style={styles.logButton}
            onPress={() => onLogService(item)}
          >
            <Text style={styles.logButtonText}>Mark as Done</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  categoryBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusLabel: {
    ...Typography.smallBold,
  },
  detailRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 24,
  },
  mileageInfo: {},
  label: {
    ...Typography.label,
    color: Colors.textMuted,
    fontSize: 10,
    marginBottom: 2,
  },
  mileageValue: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
  },
  milesRemaining: {
    ...Typography.captionBold,
  },
  notes: {
    ...Typography.small,
    color: Colors.textMuted,
    marginTop: 8,
    fontStyle: 'italic',
  },
  lastService: {
    ...Typography.small,
    color: Colors.textMuted,
    marginTop: 4,
  },
  logButton: {
    alignSelf: 'flex-start',
    marginTop: 10,
    backgroundColor: Colors.accentMuted,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  logButtonText: {
    ...Typography.smallBold,
    color: Colors.accent,
  },
});
