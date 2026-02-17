import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography } from '../theme';
import { formatMileage } from '../utils/maintenanceCalculator';

export default function VehicleCard({ vehicle, summary, onPress, isSelected }) {
  const getStatusColor = () => {
    if (!summary) return Colors.textMuted;
    switch (summary.overallStatus) {
      case 'attention':
        return Colors.danger;
      case 'monitor':
        return Colors.warning;
      default:
        return Colors.success;
    }
  };

  const getStatusText = () => {
    if (!summary) return 'Loading...';
    if (summary.overdue > 0) return `${summary.overdue} overdue`;
    if (summary.dueSoon > 0) return `${summary.dueSoon} due soon`;
    return 'All on track';
  };

  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.statusIndicator}>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
      </View>

      <View style={styles.content}>
        <Text style={styles.yearMake}>
          {vehicle.year} {vehicle.make}
        </Text>
        <Text style={styles.model}>{vehicle.model}</Text>
        <View style={styles.detailsRow}>
          <Text style={styles.detail}>{vehicle.drivetrain}</Text>
          <Text style={styles.detailSeparator}>|</Text>
          <Text style={styles.detail}>{formatMileage(vehicle.mileage)} mi</Text>
        </View>
      </View>

      <View style={styles.statusBadge}>
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
        <Text style={styles.chevron}>&rsaquo;</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  cardSelected: {
    borderColor: Colors.accent,
    borderWidth: 2,
  },
  statusIndicator: {
    marginRight: 14,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  content: {
    flex: 1,
  },
  yearMake: {
    ...Typography.small,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  model: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  detail: {
    ...Typography.small,
    color: Colors.textMuted,
  },
  detailSeparator: {
    ...Typography.small,
    color: Colors.textMuted,
    marginHorizontal: 6,
  },
  statusBadge: {
    alignItems: 'flex-end',
  },
  statusText: {
    ...Typography.smallBold,
  },
  chevron: {
    fontSize: 24,
    color: Colors.textMuted,
    marginTop: -2,
  },
});
