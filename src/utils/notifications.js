import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFIED_KEY = '@maintenance_tracker_notified';
const DEFAULT_THRESHOLD_MILES = 500;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Request notification permissions from the user.
 */
export async function requestPermissions() {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing !== 'granted') {
      await Notifications.requestPermissionsAsync();
    }
  } catch (error) {
    console.warn('Notification permissions request failed:', error);
  }
}

/**
 * Schedule an immediate local notification for a maintenance item.
 */
export async function scheduleMaintenanceReminder(vehicleName, serviceName, milesUntilDue) {
  try {
    const body =
      milesUntilDue <= 0
        ? `${serviceName} is overdue by ${Math.abs(milesUntilDue).toLocaleString()} miles!`
        : `${serviceName} is due within ${milesUntilDue.toLocaleString()} miles.`;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${vehicleName} - Maintenance Reminder`,
        body,
        sound: true,
      },
      trigger: null, // fire immediately
    });
  } catch (error) {
    console.warn('Failed to schedule notification:', error);
  }
}

/**
 * Load the set of already-notified keys from storage.
 * Keys have the form "vehicleId:serviceType:nextDueMiles".
 */
async function loadNotifiedSet() {
  try {
    const data = await AsyncStorage.getItem(NOTIFIED_KEY);
    return data ? new Set(JSON.parse(data)) : new Set();
  } catch {
    return new Set();
  }
}

/**
 * Persist the notified set to storage.
 */
async function saveNotifiedSet(set) {
  try {
    await AsyncStorage.setItem(NOTIFIED_KEY, JSON.stringify([...set]));
  } catch {
    // best-effort
  }
}

/**
 * Check upcoming maintenance items and send notifications for any that are
 * within the threshold. Won't re-notify for the same item until serviced
 * or the due-mileage changes (i.e. the user logs service).
 */
export async function checkAndNotify(
  vehicle,
  upcomingItems,
  thresholdMiles = DEFAULT_THRESHOLD_MILES,
) {
  if (!vehicle || !upcomingItems || upcomingItems.length === 0) return;

  const notified = await loadNotifiedSet();
  const vehicleName = vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  let changed = false;

  for (const item of upcomingItems) {
    if (item.milesUntilDue > thresholdMiles) continue;

    const key = `${vehicle.id}:${item.type}:${item.nextDueMiles}`;
    if (notified.has(key)) continue;

    await scheduleMaintenanceReminder(
      vehicleName,
      item.typeInfo?.name || item.type,
      item.milesUntilDue,
    );

    notified.add(key);
    changed = true;
  }

  if (changed) {
    await saveNotifiedSet(notified);
  }
}
