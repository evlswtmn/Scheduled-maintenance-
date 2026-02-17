/**
 * Central data aggregator for all manufacturer maintenance schedules.
 * Combines American, European, Japanese, and Korean vehicle data.
 */

const americanManufacturers = require('./manufacturers/american');
const europeanManufacturers = require('./manufacturers/european');
const japaneseManufacturers = require('./manufacturers/japanese');
const koreanManufacturers = require('./manufacturers/korean');

// Combine all manufacturers and sort alphabetically by name
const allManufacturers = [
  ...americanManufacturers,
  ...europeanManufacturers,
  ...japaneseManufacturers,
  ...koreanManufacturers,
].sort((a, b) => a.name.localeCompare(b.name));

/**
 * Get all manufacturers with their maintenance schedules, sorted alphabetically.
 * @returns {Array} Full list of manufacturer objects
 */
export function getAllManufacturers() {
  return allManufacturers;
}

/**
 * Find a specific manufacturer by name.
 * @param {string} name - Manufacturer name (case-insensitive)
 * @returns {Object|null} Manufacturer object or null
 */
export function getManufacturer(name) {
  return allManufacturers.find(
    (m) => m.name.toLowerCase() === name.toLowerCase()
  ) || null;
}

/**
 * Get the maintenance schedule for a specific vehicle configuration.
 * @param {string} make - Manufacturer name
 * @param {string} model - Model name
 * @param {number} year - Model year
 * @returns {Array} Maintenance schedule items, or empty array
 */
export function getScheduleForVehicle(make, model, year) {
  const manufacturer = getManufacturer(make);
  if (!manufacturer) return [];

  const matchingModel = manufacturer.models.find(
    (m) => m.name === model && year >= m.years.start && year <= m.years.end
  );
  if (!matchingModel) return [];

  return manufacturer.schedules[matchingModel.scheduleGroup] || [];
}

export default {
  getAllManufacturers,
  getManufacturer,
  getScheduleForVehicle,
};
