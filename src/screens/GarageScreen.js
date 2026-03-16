import React, { useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { Colors, Typography } from '../theme';
import { useVehicles } from '../context/VehicleContext';
import { getAllManufacturers } from '../data';
import { showAlert } from '../utils/alert';
import { clearOnboarded } from '../utils/storage';
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

  // Track previous vehicle count to detect when last vehicle is removed
  const prevVehicleCount = useRef(vehicles.length);
  useEffect(() => {
    if (prevVehicleCount.current > 0 && vehicles.length === 0) {
      clearOnboarded();
      navigation.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: 'Welcome' }] })
      );
    }
    prevVehicleCount.current = vehicles.length;
  }, [vehicles.length, navigation]);

  const handleDeleteVehicle = useCallback(
    (vehicle) => {
      const name = vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
      showAlert(
        'Remove Vehicle',
        `Are you sure you want to remove ${name}? This will also delete all service history for this vehicle.`,
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
            <View key={vehicle.id} style={styles.vehicleRow}>
              <TouchableOpacity
                style={styles.vehicleCardWrapper}
                onPress={() => handleVehiclePress(vehicle)}
              >
                <VehicleCard
                  vehicle={vehicle}
                  summary={vehicleSummaries[vehicle.id]}
                  isSelected={vehicle.id === selectedVehicleId}
                  onPress={() => handleVehiclePress(vehicle)}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteVehicle(vehicle)}
              >
                <Text style={styles.deleteButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))
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
  vehicleRow: {
    marginBottom: 4,
  },
  vehicleCardWrapper: {
    flex: 1,
  },
  deleteButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 2,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  deleteButtonText: {
    ...Typography.small,
    color: Colors.danger,
    fontWeight: '600',
  },
});
