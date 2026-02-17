import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { saveVehicles, loadVehicles, saveMaintenanceLog, loadMaintenanceLog } from '../utils/storage';

const VehicleContext = createContext();

const initialState = {
  vehicles: [],
  maintenanceLog: [],
  loading: true,
  selectedVehicleId: null,
};

function vehicleReducer(state, action) {
  switch (action.type) {
    case 'LOAD_DATA':
      return {
        ...state,
        vehicles: action.vehicles,
        maintenanceLog: action.maintenanceLog,
        loading: false,
        selectedVehicleId: action.vehicles.length > 0 ? action.vehicles[0].id : null,
      };

    case 'ADD_VEHICLE': {
      const vehicles = [...state.vehicles, action.vehicle];
      return {
        ...state,
        vehicles,
        selectedVehicleId: action.vehicle.id,
      };
    }

    case 'UPDATE_VEHICLE': {
      const vehicles = state.vehicles.map((v) =>
        v.id === action.vehicle.id ? { ...v, ...action.vehicle } : v
      );
      return { ...state, vehicles };
    }

    case 'REMOVE_VEHICLE': {
      const vehicles = state.vehicles.filter((v) => v.id !== action.vehicleId);
      const maintenanceLog = state.maintenanceLog.filter((l) => l.vehicleId !== action.vehicleId);
      return {
        ...state,
        vehicles,
        maintenanceLog,
        selectedVehicleId:
          state.selectedVehicleId === action.vehicleId
            ? vehicles.length > 0
              ? vehicles[0].id
              : null
            : state.selectedVehicleId,
      };
    }

    case 'SELECT_VEHICLE':
      return { ...state, selectedVehicleId: action.vehicleId };

    case 'LOG_SERVICE': {
      const maintenanceLog = [...state.maintenanceLog, action.entry];
      return { ...state, maintenanceLog };
    }

    case 'REMOVE_LOG_ENTRY': {
      const maintenanceLog = state.maintenanceLog.filter((l) => l.id !== action.entryId);
      return { ...state, maintenanceLog };
    }

    case 'UPDATE_MILEAGE': {
      const vehicles = state.vehicles.map((v) =>
        v.id === action.vehicleId ? { ...v, mileage: action.mileage } : v
      );
      return { ...state, vehicles };
    }

    default:
      return state;
  }
}

export function VehicleProvider({ children }) {
  const [state, dispatch] = useReducer(vehicleReducer, initialState);

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      const [vehicles, maintenanceLog] = await Promise.all([
        loadVehicles(),
        loadMaintenanceLog(),
      ]);
      dispatch({ type: 'LOAD_DATA', vehicles, maintenanceLog });
    }
    loadData();
  }, []);

  // Persist vehicles when they change
  useEffect(() => {
    if (!state.loading) {
      saveVehicles(state.vehicles);
    }
  }, [state.vehicles, state.loading]);

  // Persist maintenance log when it changes
  useEffect(() => {
    if (!state.loading) {
      saveMaintenanceLog(state.maintenanceLog);
    }
  }, [state.maintenanceLog, state.loading]);

  const addVehicle = (vehicle) => {
    const newVehicle = {
      ...vehicle,
      id: `vehicle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      addedDate: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_VEHICLE', vehicle: newVehicle });
    return newVehicle;
  };

  const updateVehicle = (vehicle) => {
    dispatch({ type: 'UPDATE_VEHICLE', vehicle });
  };

  const removeVehicle = (vehicleId) => {
    dispatch({ type: 'REMOVE_VEHICLE', vehicleId });
  };

  const selectVehicle = (vehicleId) => {
    dispatch({ type: 'SELECT_VEHICLE', vehicleId });
  };

  const logService = (vehicleId, serviceType, mileage, date, notes) => {
    const entry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      vehicleId,
      type: serviceType,
      mileage,
      date: date || new Date().toISOString(),
      notes: notes || '',
    };
    dispatch({ type: 'LOG_SERVICE', entry });
    return entry;
  };

  const removeLogEntry = (entryId) => {
    dispatch({ type: 'REMOVE_LOG_ENTRY', entryId });
  };

  const updateMileage = (vehicleId, mileage) => {
    dispatch({ type: 'UPDATE_MILEAGE', vehicleId, mileage });
  };

  const getSelectedVehicle = () => {
    return state.vehicles.find((v) => v.id === state.selectedVehicleId) || null;
  };

  const getVehicleLog = (vehicleId) => {
    return state.maintenanceLog
      .filter((l) => l.vehicleId === vehicleId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const value = {
    ...state,
    addVehicle,
    updateVehicle,
    removeVehicle,
    selectVehicle,
    logService,
    removeLogEntry,
    updateMileage,
    getSelectedVehicle,
    getVehicleLog,
  };

  return <VehicleContext.Provider value={value}>{children}</VehicleContext.Provider>;
}

export function useVehicles() {
  const context = useContext(VehicleContext);
  if (!context) {
    throw new Error('useVehicles must be used within a VehicleProvider');
  }
  return context;
}

export default VehicleContext;
