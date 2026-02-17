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
import { getAllManufacturers } from '../data';
import {
  calculateUpcomingMaintenance,
  getMaintenanceSummary,
} from '../utils/maintenanceCalculator';
import VehicleCard from '../components/VehicleCard';

export default function GarageScreen({ navigation }) {
  const {
    vehicles,
    maintenanceLog,
    selectedVehicleId,
    selectVehicle,
    removeVehicle,
  } = useVehicles();

  const manufacturers = useMemo(() => getAllManufacturers(), []);

  // Calculate summary for each vehicle
  const vehicleSummaries = useMemo(() => {
    const summaries = {};
    vehicles.forEach((vehicle) => {
      const manufacturer = manufacturers.find((m) => m.name === vehicle.make);
      if (!manufacturer) {
        summaries[vehicle.id] = null;
        return;
      }
      const model = manufacturer.models.find(
        (m) =>
          m.name === vehicle.model &&
          vehicle.year >= m.years.start &&
          vehicle.year <= m.years.end
      );
      if (!model) {
        summaries[vehicle.id] = null;
        return;
      }
      const schedule = manufacturer.schedules[model.scheduleGroup] || [];
      const upcoming = calculateUpcomingMaintenance(vehicle, schedule, maintenanceLog);
      summaries[vehicle.id] = getMaintenanceSummary(upcoming);
    });
    return summaries;
  }, [vehicles, manufacturers, maintenanceLog]);

  const handleVehiclePress = useCallback(
    (vehicle) => {
      selectVehicle(vehicle.id);
      navigation.navigate('Dashboard');
    },
    [selectVehicle, navigation]
  );

  const handleDeleteVehicle = useCallback(
    (vehicle) => {
      Alert.alert(
        'Remove Vehicle',
        `Remove "${vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}" from your garage? This will also delete its service history.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => removeVehicle(vehicle.id),
          },
        ]
      );
    },
    [removeVehicle]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>My Garage</Text>
            <Text style={styles.subtitle}>
              {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('VehicleSetup')}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {vehicles.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>&#128295;</Text>
            <Text style={styles.emptyTitle}>Your garage is empty</Text>
            <Text style={styles.emptyText}>
              Add your first vehicle to start tracking its maintenance schedule.
            </Text>
            <TouchableOpacity
              style={styles.emptyAddButton}
              onPress={() => navigation.navigate('VehicleSetup')}
            >
              <Text style={styles.emptyAddButtonText}>Add Vehicle</Text>
            </TouchableOpacity>
          </View>
        ) : (
          vehicles.map((vehicle) => (
            <TouchableOpacity
              key={vehicle.id}
              onLongPress={() => handleDeleteVehicle(vehicle)}
              delayLongPress={600}
            >
              <VehicleCard
                vehicle={vehicle}
                summary={vehicleSummaries[vehicle.id]}
                isSelected={vehicle.id === selectedVehicleId}
                onPress={() => handleVehiclePress(vehicle)}
              />
            </TouchableOpacity>
          ))
        )}

        {vehicles.length > 0 ? (
          <Text style={styles.hint}>Long-press a vehicle to remove it</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
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
  addButton: {
    backgroundColor: Colors.accentMuted,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  addButtonText: {
    ...Typography.captionBold,
    color: Colors.accent,
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
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  emptyAddButton: {
    backgroundColor: Colors.buttonPrimary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  emptyAddButtonText: {
    ...Typography.bodyBold,
    color: Colors.buttonPrimaryText,
  },
  hint: {
    ...Typography.small,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
});
