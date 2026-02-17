import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors, Typography } from '../theme';
import DropdownPicker from '../components/DropdownPicker';
import { useVehicles } from '../context/VehicleContext';
import { getAllManufacturers } from '../data';

export default function VehicleSetupScreen({ navigation, route }) {
  const { addVehicle } = useVehicles();
  const manufacturers = useMemo(() => getAllManufacturers(), []);
  const isInitialSetup = route?.params?.initial;

  const [selectedMake, setSelectedMake] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedDrivetrain, setSelectedDrivetrain] = useState(null);
  const [mileage, setMileage] = useState('');
  const [nickname, setNickname] = useState('');

  // Get list of makes (manufacturer names) alphabetically sorted
  const makeOptions = useMemo(() => {
    return manufacturers.map((m) => ({ label: m.name, value: m.name }));
  }, [manufacturers]);

  // Get models for selected make
  const modelOptions = useMemo(() => {
    if (!selectedMake) return [];
    const manufacturer = manufacturers.find((m) => m.name === selectedMake);
    if (!manufacturer) return [];
    // Get unique model names sorted alphabetically
    const uniqueModels = [...new Set(manufacturer.models.map((m) => m.name))].sort();
    return uniqueModels.map((name) => ({ label: name, value: name }));
  }, [selectedMake, manufacturers]);

  // Get years for selected make + model
  const yearOptions = useMemo(() => {
    if (!selectedMake || !selectedModel) return [];
    const manufacturer = manufacturers.find((m) => m.name === selectedMake);
    if (!manufacturer) return [];
    const matchingModels = manufacturer.models.filter((m) => m.name === selectedModel);
    // Gather all valid years from all matching model entries
    const years = new Set();
    matchingModels.forEach((m) => {
      for (let y = m.years.start; y <= m.years.end; y++) {
        years.add(y);
      }
    });
    // Sort descending (newest first)
    return [...years]
      .sort((a, b) => b - a)
      .map((y) => ({ label: y.toString(), value: y.toString() }));
  }, [selectedMake, selectedModel, manufacturers]);

  // Get drivetrains for selected make + model + year
  const drivetrainOptions = useMemo(() => {
    if (!selectedMake || !selectedModel || !selectedYear) return [];
    const manufacturer = manufacturers.find((m) => m.name === selectedMake);
    if (!manufacturer) return [];
    const year = parseInt(selectedYear, 10);
    const matchingModel = manufacturer.models.find(
      (m) => m.name === selectedModel && year >= m.years.start && year <= m.years.end
    );
    if (!matchingModel) return [];
    return matchingModel.drivetrains.map((d) => ({ label: getDrivetrainLabel(d), value: d }));
  }, [selectedMake, selectedModel, selectedYear, manufacturers]);

  const handleMakeChange = useCallback((value) => {
    setSelectedMake(value);
    setSelectedModel(null);
    setSelectedYear(null);
    setSelectedDrivetrain(null);
  }, []);

  const handleModelChange = useCallback((value) => {
    setSelectedModel(value);
    setSelectedYear(null);
    setSelectedDrivetrain(null);
  }, []);

  const handleYearChange = useCallback((value) => {
    setSelectedYear(value);
    setSelectedDrivetrain(null);
  }, []);

  const handleSave = useCallback(() => {
    const trimmedMileage = mileage.replace(/,/g, '').trim();
    const mileageNum = parseInt(trimmedMileage, 10);

    if (!selectedMake || !selectedModel || !selectedYear || !selectedDrivetrain) {
      Alert.alert('Missing Information', 'Please select your vehicle year, make, model, and drivetrain.');
      return;
    }
    if (!trimmedMileage || isNaN(mileageNum) || mileageNum < 0) {
      Alert.alert('Invalid Mileage', 'Please enter a valid current mileage.');
      return;
    }

    const vehicle = {
      make: selectedMake,
      model: selectedModel,
      year: parseInt(selectedYear, 10),
      drivetrain: selectedDrivetrain,
      mileage: mileageNum,
      nickname: nickname.trim() || `${selectedYear} ${selectedMake} ${selectedModel}`,
    };

    addVehicle(vehicle);

    if (isInitialSetup) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } else {
      navigation.goBack();
    }
  }, [selectedMake, selectedModel, selectedYear, selectedDrivetrain, mileage, nickname, addVehicle, navigation, isInitialSetup]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Add Vehicle</Text>
            <Text style={styles.subtitle}>
              Select your vehicle details to get its recommended maintenance schedule.
            </Text>
          </View>

          <DropdownPicker
            label="Manufacturer"
            placeholder="Select manufacturer..."
            value={selectedMake}
            options={makeOptions}
            onSelect={handleMakeChange}
            searchable
          />

          <DropdownPicker
            label="Model"
            placeholder={selectedMake ? 'Select model...' : 'Select manufacturer first'}
            value={selectedModel}
            options={modelOptions}
            onSelect={handleModelChange}
            disabled={!selectedMake}
            searchable
          />

          <DropdownPicker
            label="Year"
            placeholder={selectedModel ? 'Select year...' : 'Select model first'}
            value={selectedYear}
            options={yearOptions}
            onSelect={handleYearChange}
            disabled={!selectedModel}
          />

          <DropdownPicker
            label="Drivetrain"
            placeholder={selectedYear ? 'Select drivetrain...' : 'Select year first'}
            value={selectedDrivetrain}
            options={drivetrainOptions}
            onSelect={setSelectedDrivetrain}
            disabled={!selectedYear}
          />

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>CURRENT MILEAGE</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 45000"
              placeholderTextColor={Colors.textMuted}
              value={mileage}
              onChangeText={setMileage}
              keyboardType="numeric"
              returnKeyType="done"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>NICKNAME (OPTIONAL)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. My Daily Driver"
              placeholderTextColor={Colors.textMuted}
              value={nickname}
              onChangeText={setNickname}
              returnKeyType="done"
              maxLength={30}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              (!selectedMake || !selectedModel || !selectedYear || !selectedDrivetrain) &&
                styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>
              {isInitialSetup ? 'Get Started' : 'Add Vehicle'}
            </Text>
          </TouchableOpacity>

          {!isInitialSetup ? (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function getDrivetrainLabel(code) {
  const labels = {
    FWD: 'Front-Wheel Drive (FWD)',
    RWD: 'Rear-Wheel Drive (RWD)',
    AWD: 'All-Wheel Drive (AWD)',
    '4WD': 'Four-Wheel Drive (4WD)',
  };
  return labels[code] || code;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    ...Typography.title,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  textInput: {
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...Typography.body,
    color: Colors.textPrimary,
  },
  saveButton: {
    backgroundColor: Colors.buttonPrimary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    ...Typography.bodyBold,
    color: Colors.buttonPrimaryText,
    fontSize: 17,
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    ...Typography.body,
    color: Colors.textMuted,
  },
});
