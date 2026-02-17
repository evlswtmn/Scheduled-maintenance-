import React, { useCallback } from 'react';
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
import { formatMileage, getStatusDisplay } from '../utils/maintenanceCalculator';

export default function MaintenanceDetailScreen({ route, navigation }) {
  const { item, vehicle } = route.params;
  const { logService, getVehicleLog } = useVehicles();

  const statusDisplay = getStatusDisplay(item.status);
  const statusColor = Colors[statusDisplay.colorKey] || Colors.textSecondary;
  const categoryColor = Colors[item.typeInfo?.category] || Colors.textSecondary;

  // Get past service records for this type
  const vehicleLog = getVehicleLog(vehicle.id);
  const serviceHistory = vehicleLog.filter((l) => l.type === item.type);

  const handleLogService = useCallback(() => {
    Alert.alert(
      'Mark as Done',
      `Log "${item.typeInfo.name}" as completed at ${formatMileage(vehicle.mileage)} miles?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            logService(
              vehicle.id,
              item.type,
              vehicle.mileage,
              new Date().toISOString(),
              ''
            );
            navigation.goBack();
          },
        },
      ]
    );
  }, [item, vehicle, logService, navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>&lsaquo; Back</Text>
          </TouchableOpacity>
        </View>

        {/* Service Info Card */}
        <View style={styles.card}>
          <View style={[styles.categoryIndicator, { backgroundColor: categoryColor }]} />
          <View style={styles.cardContent}>
            <Text style={styles.serviceName}>{item.typeInfo?.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {statusDisplay.label}
              </Text>
            </View>

            <Text style={styles.serviceDescription}>
              {item.typeInfo?.description}
            </Text>

            <View style={styles.divider} />

            {/* Interval Info */}
            <View style={styles.infoGrid}>
              <InfoRow label="Service Interval" value={`Every ${formatMileage(item.intervalMiles)} miles`} />
              {item.intervalMonths ? (
                <InfoRow label="Time Interval" value={`Every ${item.intervalMonths} months`} />
              ) : null}
              <InfoRow
                label="Next Due At"
                value={`${formatMileage(item.nextDueMiles)} miles`}
                valueColor={statusColor}
              />
              <InfoRow
                label={item.milesUntilDue < 0 ? 'Overdue By' : 'Miles Remaining'}
                value={`${formatMileage(Math.abs(item.milesUntilDue))} miles`}
                valueColor={statusColor}
              />
              <InfoRow
                label="Current Odometer"
                value={`${formatMileage(vehicle.mileage)} miles`}
              />
              {item.lastServiceMileage ? (
                <InfoRow
                  label="Last Serviced"
                  value={`${formatMileage(item.lastServiceMileage)} miles`}
                />
              ) : (
                <InfoRow label="Last Serviced" value="No record" />
              )}
            </View>

            {item.notes ? (
              <>
                <View style={styles.divider} />
                <Text style={styles.notesLabel}>NOTES</Text>
                <Text style={styles.notesText}>{item.notes}</Text>
              </>
            ) : null}

            {item.drivetrainSpecific ? (
              <>
                <View style={styles.divider} />
                <Text style={styles.notesLabel}>APPLIES TO</Text>
                <Text style={styles.notesText}>
                  {item.drivetrainSpecific.join(', ')} drivetrains only
                </Text>
              </>
            ) : null}
          </View>
        </View>

        {/* Vehicle Info */}
        <View style={styles.vehicleCard}>
          <Text style={styles.vehicleCardLabel}>VEHICLE</Text>
          <Text style={styles.vehicleCardName}>
            {vehicle.year} {vehicle.make} {vehicle.model}
          </Text>
          <Text style={styles.vehicleCardDetail}>{vehicle.drivetrain}</Text>
        </View>

        {/* Service History */}
        {serviceHistory.length > 0 ? (
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Service History</Text>
            {serviceHistory.map((entry) => (
              <View key={entry.id} style={styles.historyItem}>
                <View style={styles.historyDot} />
                <View style={styles.historyContent}>
                  <Text style={styles.historyMileage}>
                    {formatMileage(entry.mileage)} miles
                  </Text>
                  <Text style={styles.historyDate}>
                    {new Date(entry.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {/* Action Button */}
        <TouchableOpacity style={styles.logButton} onPress={handleLogService} activeOpacity={0.8}>
          <Text style={styles.logButtonText}>Mark Service as Completed</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, valueColor }) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={[infoStyles.value, valueColor && { color: valueColor }]}>{value}</Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  value: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
  },
});

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
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  backButton: {
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  backText: {
    ...Typography.bodyBold,
    color: Colors.accent,
    fontSize: 18,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 16,
  },
  categoryIndicator: {
    height: 4,
  },
  cardContent: {
    padding: 18,
  },
  serviceName: {
    ...Typography.title,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  statusText: {
    ...Typography.captionBold,
  },
  serviceDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 14,
  },
  infoGrid: {},
  notesLabel: {
    ...Typography.label,
    color: Colors.textMuted,
    marginBottom: 6,
  },
  notesText: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  vehicleCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 16,
  },
  vehicleCardLabel: {
    ...Typography.label,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  vehicleCardName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  vehicleCardDetail: {
    ...Typography.small,
    color: Colors.textMuted,
    marginTop: 2,
  },
  historySection: {
    marginBottom: 20,
  },
  sectionTitle: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingLeft: 4,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
    marginTop: 6,
    marginRight: 12,
  },
  historyContent: {},
  historyMileage: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
  },
  historyDate: {
    ...Typography.small,
    color: Colors.textMuted,
    marginTop: 2,
  },
  logButton: {
    backgroundColor: Colors.buttonPrimary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logButtonText: {
    ...Typography.bodyBold,
    color: Colors.buttonPrimaryText,
    fontSize: 17,
  },
});
