import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import { VehicleProvider } from './src/context/VehicleContext';
import { Colors } from './src/theme';

import WelcomeScreen from './src/screens/WelcomeScreen';
import VehicleSetupScreen from './src/screens/VehicleSetupScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import GarageScreen from './src/screens/GarageScreen';
import MaintenanceDetailScreen from './src/screens/MaintenanceDetailScreen';
import ServiceHistoryScreen from './src/screens/ServiceHistoryScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ label, focused }) {
  const icons = {
    Dashboard: focused ? '\u25C9' : '\u25CB',
    Garage: focused ? '\u25A3' : '\u25A2',
    History: focused ? '\u25B6' : '\u25B7',
  };
  return (
    <Text style={{ fontSize: 20, color: focused ? Colors.tabBarActive : Colors.tabBarInactive }}>
      {icons[label] || '\u25CB'}
    </Text>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.tabBarBackground,
          borderTopColor: Colors.borderLight,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarActiveTintColor: Colors.tabBarActive,
        tabBarInactiveTintColor: Colors.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ focused }) => <TabIcon label="Dashboard" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Garage"
        component={GarageScreen}
        options={{
          tabBarLabel: 'Garage',
          tabBarIcon: ({ focused }) => <TabIcon label="Garage" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="History"
        component={ServiceHistoryScreen}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ focused }) => <TabIcon label="History" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <VehicleProvider>
      <NavigationContainer
        theme={{
          dark: true,
          colors: {
            primary: Colors.accent,
            background: Colors.background,
            card: Colors.surface,
            text: Colors.textPrimary,
            border: Colors.borderLight,
            notification: Colors.accent,
          },
        }}
      >
        <StatusBar style="light" />
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen
            name="VehicleSetup"
            component={VehicleSetupScreen}
            options={{ animation: 'slide_from_bottom' }}
          />
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen
            name="MaintenanceDetail"
            component={MaintenanceDetailScreen}
            options={{ animation: 'slide_from_right' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </VehicleProvider>
  );
}
