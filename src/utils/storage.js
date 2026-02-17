import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  VEHICLES: '@maintenance_tracker_vehicles',
  MAINTENANCE_LOG: '@maintenance_tracker_log',
  SETTINGS: '@maintenance_tracker_settings',
  ONBOARDED: '@maintenance_tracker_onboarded',
};

/**
 * Save user vehicles to persistent storage.
 */
export async function saveVehicles(vehicles) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
    return true;
  } catch (error) {
    console.error('Error saving vehicles:', error);
    return false;
  }
}

/**
 * Load user vehicles from persistent storage.
 */
export async function loadVehicles() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.VEHICLES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading vehicles:', error);
    return [];
  }
}

/**
 * Save a maintenance log entry (service that was performed).
 */
export async function saveMaintenanceLog(log) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.MAINTENANCE_LOG, JSON.stringify(log));
    return true;
  } catch (error) {
    console.error('Error saving maintenance log:', error);
    return false;
  }
}

/**
 * Load maintenance log.
 */
export async function loadMaintenanceLog() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.MAINTENANCE_LOG);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading maintenance log:', error);
    return [];
  }
}

/**
 * Save app settings.
 */
export async function saveSettings(settings) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
}

/**
 * Load app settings.
 */
export async function loadSettings() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : { notifications: true, units: 'miles' };
  } catch (error) {
    console.error('Error loading settings:', error);
    return { notifications: true, units: 'miles' };
  }
}

/**
 * Check if user has completed onboarding.
 */
export async function hasOnboarded() {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDED);
    return value === 'true';
  } catch (error) {
    return false;
  }
}

/**
 * Mark onboarding as complete.
 */
export async function setOnboarded() {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDED, 'true');
  } catch (error) {
    console.error('Error setting onboarded:', error);
  }
}

/**
 * Clear all app data (for reset/debug).
 */
export async function clearAllData() {
  try {
    const keys = Object.values(STORAGE_KEYS);
    await AsyncStorage.multiRemove(keys);
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
}

export default {
  saveVehicles,
  loadVehicles,
  saveMaintenanceLog,
  loadMaintenanceLog,
  saveSettings,
  loadSettings,
  hasOnboarded,
  setOnboarded,
  clearAllData,
};
