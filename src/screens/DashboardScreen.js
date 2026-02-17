import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { Colors, Typography } from '../theme';
import { useVehicles } from '../context/VehicleContext';
import { getAllManufacturers } from '../data';
import {
  calculateUpcomingMaintenance,
  getMaintenanceSummary,
  formatMileage,
} from '../utils/maintenanceCalculator';
import MaintenanceItem from '../components/MaintenanceItem';

export default function DashboardScreen({ navigation }) {
  const {
    vehicles,
    maintenanceLog,
    selectedVehicleId,
    selectVehicle,
    logService,
    updateMileage,
  } = useVehicles();

  const [showMileageUpdate, setShowMileageUpdate] = useState(false);
  const [newMileage, setNewMileage] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const manufacturers = useMemo(() => getAllManufacturers(), []);

  const selectedVehicle = useMemo(() => {
    return vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0] || null;
  }, [vehicles, selectedVehicleId]);

  // Get maintenance schedule for selected vehicle
  const schedule = useMemo(() => {
    if (!selectedVehicle) return [];
    const manufacturer = manufacturers.find((m) => m.name === selectedVehicle.make);
    if (!manufacturer) return [];
    const model = manufacturer.models.find(
      (m) =>
        m.name === selectedVehicle.model &&
        selectedVehicle.year >= m.years.start &&
        selectedVehicle.year <= m.years.end
    );
    if (!model) return [];
    return manufacturer.schedules[model.scheduleGroup] || [];
  }, [selectedVehicle, manufacturers]);

  const upcomingMaintenance = useMemo(() => {
    if (!selectedVehicle || !schedule.length) return [];
    return calculateUpcomingMaintenance(selectedVehicle, schedule, maintenanceLog);
  }, [selectedVehicle, schedule, maintenanceLog]);

  const summary = useMemo(() => {
    return getMaintenanceSummary(upcomingMaintenance);
  }, [upcomingMaintenance]);

  const handleLogService = useCallback(
    (item) => {
      if (!selectedVehicle) return;
      Alert.alert(
        'Mark as Done',
        `Log "${item.typeInfo.name}" as completed at ${formatMileage(selectedVehicle.mileage)} miles?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm',
            onPress: () => {
              logService(
                selectedVehicle.id,
                item.type,
                selectedVehicle.mileage,
                new Date().toISOString(),
                ''
              );
            },
          },
        ]
      );
    },
    [selectedVehicle, logService]
  );

  const handleUpdateMileage = useCallback(() => {
    const val = parseInt(newMileage.replace(/,/g, ''), 10);
    if (isNaN(val) || val < 0) {
      Alert.alert('Invalid Mileage', 'Please enter a valid mileage number.');
      return;
    }
    if (selectedVehicle) {
      updateMileage(selectedVehicle.id, val);
      setShowMileageUpdate(false);
      setNewMileage('');
    }
  }, [newMileage, selectedVehicle, updateMileage]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Force re-render by toggling refresh state
    setTimeout(() => setRefreshing(false), 300);
  }, []);

  if (!selectedVehicle) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>&#128663;</Text>
          <Text style={styles.emptyTitle}>No Vehicles</Text>
          <Text style={styles.emptyText}>Add a vehicle to see its maintenance schedule.</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('VehicleSetup')}
          >
            <Text style={styles.addButtonText}>+ Add Vehicle</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getOverallStatusColor = () => {
    switch (summary.overallStatus) {
      case 'attention': return Colors.danger;
      case 'monitor': return Colors.warning;
      default: return Colors.success;
    }
  };

  const getOverallStatusText = () => {
    switch (summary.overallStatus) {
      case 'attention': return 'Needs Attention';
      case 'monitor': return 'Services Due Soon';
      default: return 'All Systems Go';
    }
  };

  // Split items by status for section display
  const overdueItems = upcomingMaintenance.filter((i) => i.status === 'overdue');
  const dueSoonItems = upcomingMaintenance.filter((i) => i.status === 'due_soon');
  const upcomingItems = upcomingMaintenance.filter((i) => i.status === 'upcoming');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.accent}
          />
        }
      >
        {/* Vehicle Selector (if multiple) */}
        {vehicles.length > 1 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.vehicleSelector}
            contentContainerStyle={styles.vehicleSelectorContent}
          >
            {vehicles.map((v) => (
              <TouchableOpacity
                key={v.id}
                style={[
                  styles.vehicleChip,
                  v.id === selectedVehicle.id && styles.vehicleChipSelected,
                ]}
                onPress={() => selectVehicle(v.id)}
              >
                <Text
                  style={[
                    styles.vehicleChipText,
                    v.id === selectedVehicle.id && styles.vehicleChipTextSelected,
                  ]}
                  numberOfLines={1}
                >
                  {v.nickname || `${v.year} ${v.model}`}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : null}

        {/* Vehicle Info Card */}
        <View style={styles.vehicleInfoCard}>
          <View style={styles.vehicleInfoTop}>
            <View>
              <Text style={styles.vehicleYear}>
                {selectedVehicle.year} {selectedVehicle.make}
              </Text>
              <Text style={styles.vehicleModel}>{selectedVehicle.model}</Text>
              <Text style={styles.vehicleDrivetrain}>{selectedVehicle.drivetrain}</Text>
            </View>
            <View style={[styles.statusIndicatorLarge, { borderColor: getOverallStatusColor() }]}>
              <View style={[styles.statusDotLarge, { backgroundColor: getOverallStatusColor() }]} />
              <Text style={[styles.statusTextLarge, { color: getOverallStatusColor() }]}>
                {getOverallStatusText()}
              </Text>
            </View>
          </View>

          {/* Mileage Display */}
          <TouchableOpacity
            style={styles.mileageRow}
            onPress={() => {
              setShowMileageUpdate(!showMileageUpdate);
              setNewMileage(selectedVehicle.mileage.toString());
            }}
          >
            <View>
              <Text style={styles.mileageLabel}>CURRENT ODOMETER</Text>
              <Text style={styles.mileageValue}>
                {formatMileage(selectedVehicle.mileage)}{' '}
                <Text style={styles.mileageUnit}>miles</Text>
              </Text>
            </View>
            <Text style={styles.editHint}>Tap to update</Text>
          </TouchableOpacity>

          {showMileageUpdate ? (
            <View style={styles.mileageUpdateRow}>
              <TextInput
                style={styles.mileageInput}
                value={newMileage}
                onChangeText={setNewMileage}
                keyboardType="numeric"
                placeholder="New mileage"
                placeholderTextColor={Colors.textMuted}
                autoFocus
              />
              <TouchableOpacity style={styles.mileageUpdateBtn} onPress={handleUpdateMileage}>
                <Text style={styles.mileageUpdateBtnText}>Update</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.mileageCancelBtn}
                onPress={() => setShowMileageUpdate(false)}
              >
                <Text style={styles.mileageCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Summary Badges */}
          <View style={styles.summaryRow}>
            {summary.overdue > 0 ? (
              <View style={[styles.summaryBadge, { backgroundColor: Colors.dangerMuted }]}>
                <Text style={[styles.summaryBadgeNum, { color: Colors.danger }]}>
                  {summary.overdue}
                </Text>
                <Text style={[styles.summaryBadgeLabel, { color: Colors.danger }]}>Overdue</Text>
              </View>
            ) : null}
            {summary.dueSoon > 0 ? (
              <View style={[styles.summaryBadge, { backgroundColor: Colors.warningMuted }]}>
                <Text style={[styles.summaryBadgeNum, { color: Colors.warning }]}>
                  {summary.dueSoon}
                </Text>
                <Text style={[styles.summaryBadgeLabel, { color: Colors.warning }]}>Due Soon</Text>
              </View>
            ) : null}
            <View style={[styles.summaryBadge, { backgroundColor: Colors.successMuted }]}>
              <Text style={[styles.summaryBadgeNum, { color: Colors.success }]}>
                {summary.upcoming}
              </Text>
              <Text style={[styles.summaryBadgeLabel, { color: Colors.success }]}>On Track</Text>
            </View>
          </View>
        </View>

        {/* Overdue Section */}
        {overdueItems.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors.danger }]}>
              &#9888; Overdue
            </Text>
            {overdueItems.map((item, index) => (
              <MaintenanceItem
                key={`${item.type}_${index}`}
                item={item}
                onLogService={handleLogService}
                onPress={() =>
                  navigation.navigate('MaintenanceDetail', {
                    item,
                    vehicle: selectedVehicle,
                  })
                }
              />
            ))}
          </View>
        ) : null}

        {/* Due Soon Section */}
        {dueSoonItems.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors.warning }]}>
              Due Soon
            </Text>
            {dueSoonItems.map((item, index) => (
              <MaintenanceItem
                key={`${item.type}_${index}`}
                item={item}
                onLogService={handleLogService}
                onPress={() =>
                  navigation.navigate('MaintenanceDetail', {
                    item,
                    vehicle: selectedVehicle,
                  })
                }
              />
            ))}
          </View>
        ) : null}

        {/* Upcoming Section */}
        {upcomingItems.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors.success }]}>
              Upcoming
            </Text>
            {upcomingItems.map((item, index) => (
              <MaintenanceItem
                key={`${item.type}_${index}`}
                item={item}
                onLogService={handleLogService}
                onPress={() =>
                  navigation.navigate('MaintenanceDetail', {
                    item,
                    vehicle: selectedVehicle,
                  })
                }
              />
            ))}
          </View>
        ) : null}

        {upcomingMaintenance.length === 0 ? (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>
              No maintenance schedule data found for this vehicle configuration.
            </Text>
          </View>
        ) : null}
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
  vehicleSelector: {
    marginBottom: 12,
    marginHorizontal: -16,
  },
  vehicleSelectorContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  vehicleChip: {
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginRight: 8,
  },
  vehicleChipSelected: {
    backgroundColor: Colors.accentMuted,
    borderColor: Colors.accent,
  },
  vehicleChipText: {
    ...Typography.smallBold,
    color: Colors.textSecondary,
  },
  vehicleChipTextSelected: {
    color: Colors.accent,
  },
  vehicleInfoCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  vehicleInfoTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  vehicleYear: {
    ...Typography.small,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  vehicleModel: {
    ...Typography.title,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  vehicleDrivetrain: {
    ...Typography.small,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statusIndicatorLarge: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusDotLarge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusTextLarge: {
    ...Typography.smallBold,
    fontSize: 10,
  },
  mileageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  mileageLabel: {
    ...Typography.label,
    color: Colors.textMuted,
    fontSize: 10,
  },
  mileageValue: {
    ...Typography.title,
    color: Colors.textPrimary,
    fontSize: 28,
    marginTop: 2,
  },
  mileageUnit: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 14,
  },
  editHint: {
    ...Typography.small,
    color: Colors.accent,
    marginBottom: 4,
  },
  mileageUpdateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  mileageInput: {
    flex: 1,
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...Typography.body,
    color: Colors.textPrimary,
  },
  mileageUpdateBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  mileageUpdateBtnText: {
    ...Typography.captionBold,
    color: Colors.buttonPrimaryText,
  },
  mileageCancelBtn: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  mileageCancelBtnText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  summaryRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 8,
  },
  summaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  summaryBadgeNum: {
    ...Typography.captionBold,
    fontSize: 16,
  },
  summaryBadgeLabel: {
    ...Typography.small,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    ...Typography.captionBold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    paddingLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    ...Typography.title,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: Colors.buttonPrimary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  addButtonText: {
    ...Typography.bodyBold,
    color: Colors.buttonPrimaryText,
  },
  noDataContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noDataText: {
    ...Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
