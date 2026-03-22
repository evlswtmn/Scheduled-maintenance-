import MaintenanceTypes, { SeverityLevels } from '../data/maintenanceTypes';

/**
 * Calculate upcoming maintenance items for a vehicle based on current mileage.
 *
 * @param {Object} vehicle - Vehicle object with make, model, year, mileage, drivetrain
 * @param {Array} schedule - Array of maintenance schedule items for this vehicle
 * @param {Array} completedServices - Array of completed service log entries for this vehicle
 * @returns {Array} Sorted array of upcoming maintenance items
 */
export function calculateUpcomingMaintenance(vehicle, schedule, completedServices = []) {
  if (!schedule || !vehicle) return [];

  const { mileage, drivetrain } = vehicle;
  const upcoming = [];

  for (const item of schedule) {
    // Skip items not applicable to this drivetrain
    if (item.drivetrainSpecific && !item.drivetrainSpecific.includes(drivetrain)) {
      continue;
    }

    const typeInfo = MaintenanceTypes[item.type];
    if (!typeInfo) continue;

    // Find the last completed service of this type for this vehicle
    const lastService = getLastCompletedService(vehicle.id, item.type, completedServices);

    // Calculate next due mileage and status
    let nextDueMiles;
    let status;

    if (!item.intervalMiles && item.intervalMonths) {
      // Time-based only item (e.g. brake fluid every 24 months).
      // Status is determined by service date, not mileage.
      const timeStatus = getTimeBasedStatus(lastService, item.intervalMonths);
      status = timeStatus.status;
      // For display: show current mileage as "next due" since there's no mileage target
      nextDueMiles = mileage;
    } else if (lastService) {
      nextDueMiles = lastService.mileage + item.intervalMiles;
    } else {
      // No record of this service - calculate based on interval from 0
      nextDueMiles = getNextIntervalFromZero(mileage, item.intervalMiles);
    }

    // Calculate how many miles until due
    const milesUntilDue = nextDueMiles - mileage;

    // For mileage-based items, calculate status from miles remaining
    if (status === undefined) {
      status = getMaintenanceStatus(milesUntilDue, item.intervalMiles);
    }

    upcoming.push({
      ...item,
      typeInfo,
      nextDueMiles,
      milesUntilDue,
      status,
      lastServiceMileage: lastService ? lastService.mileage : null,
      lastServiceDate: lastService ? lastService.date : null,
      severityInfo: SeverityLevels[typeInfo.severity],
    });
  }

  // Sort by urgency: overdue first, then by miles until due
  upcoming.sort((a, b) => {
    if (a.status === 'overdue' && b.status !== 'overdue') return -1;
    if (b.status === 'overdue' && a.status !== 'overdue') return 1;
    if (a.status === 'due_soon' && b.status === 'upcoming') return -1;
    if (b.status === 'due_soon' && a.status === 'upcoming') return 1;
    return a.milesUntilDue - b.milesUntilDue;
  });

  return upcoming;
}

/**
 * Get the next interval due point assuming service should have been done at
 * every multiple of `interval` starting from 0.  When no service has ever been
 * recorded, the vehicle is overdue once it passes any interval boundary.
 *
 * Examples (interval = 30 000):
 *   mileage  5 000 → next due 30 000 (first interval not yet reached)
 *   mileage 29 000 → next due 30 000
 *   mileage 30 000 → next due 30 000 (exactly at boundary — due now)
 *   mileage 62 000 → next due 60 000 (passed the 60k mark — overdue)
 */
function getNextIntervalFromZero(currentMileage, interval) {
  if (interval <= 0) return currentMileage;
  const intervalsPassed = Math.floor(currentMileage / interval);
  // Haven't reached the first interval yet — next due is the first one
  if (intervalsPassed === 0) return interval;
  // At or past an interval boundary — that boundary is (or was) the due point
  return intervalsPassed * interval;
}

/**
 * Find the last completed service of a given type for a vehicle.
 */
function getLastCompletedService(vehicleId, serviceType, completedServices) {
  const matches = completedServices
    .filter((s) => s.vehicleId === vehicleId && s.type === serviceType)
    .sort((a, b) => {
      // Sort by date first (most recent), then by mileage as tiebreaker
      const dateCompare = new Date(b.date) - new Date(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.mileage - a.mileage;
    });
  return matches.length > 0 ? matches[0] : null;
}

/**
 * Determine status for time-based-only maintenance items (no mileage interval).
 * Compares the last service date + intervalMonths to today.
 */
function getTimeBasedStatus(lastService, intervalMonths) {
  if (!lastService || !lastService.date) {
    // Never serviced — treat as overdue
    return { status: 'overdue' };
  }

  const serviceDate = new Date(lastService.date);
  const now = new Date();

  // Calculate when the next service is due
  const nextDueDate = new Date(serviceDate);
  nextDueDate.setMonth(nextDueDate.getMonth() + intervalMonths);

  const msRemaining = nextDueDate.getTime() - now.getTime();
  const daysRemaining = msRemaining / (1000 * 60 * 60 * 24);
  const totalDays = intervalMonths * 30.44; // average days per month

  if (daysRemaining <= 0) {
    return { status: 'overdue' };
  }

  // "Due soon" if within 20% of the interval or within 30 days
  const threshold = Math.max(totalDays * 0.2, 30);
  if (daysRemaining <= threshold) {
    return { status: 'due_soon' };
  }

  return { status: 'upcoming' };
}

/**
 * Determine maintenance urgency status based on miles until due.
 */
function getMaintenanceStatus(milesUntilDue, intervalMiles) {
  if (milesUntilDue <= 0) {
    return 'overdue';
  }
  // "Due soon" if within 20% of interval or within 1000 miles
  const threshold = Math.max(intervalMiles * 0.2, 1000);
  if (milesUntilDue <= threshold) {
    return 'due_soon';
  }
  return 'upcoming';
}

/**
 * Get a summary of maintenance status for a vehicle.
 */
export function getMaintenanceSummary(upcomingItems) {
  const overdue = upcomingItems.filter((i) => i.status === 'overdue').length;
  const dueSoon = upcomingItems.filter((i) => i.status === 'due_soon').length;
  const upcoming = upcomingItems.filter((i) => i.status === 'upcoming').length;

  let overallStatus = 'good';
  if (overdue > 0) overallStatus = 'attention';
  else if (dueSoon > 0) overallStatus = 'monitor';

  return { overdue, dueSoon, upcoming, overallStatus };
}

/**
 * Format mileage number with commas.
 */
export function formatMileage(miles) {
  if (miles == null) return '--';
  return miles.toLocaleString('en-US');
}

/**
 * Get status display info (color key, label, icon).
 */
export function getStatusDisplay(status) {
  switch (status) {
    case 'overdue':
      return { colorKey: 'danger', label: 'Overdue', icon: 'alert-triangle' };
    case 'due_soon':
      return { colorKey: 'warning', label: 'Due Soon', icon: 'alert-circle' };
    case 'upcoming':
      return { colorKey: 'success', label: 'On Track', icon: 'check-circle' };
    default:
      return { colorKey: 'textSecondary', label: 'Unknown', icon: 'help-circle' };
  }
}
