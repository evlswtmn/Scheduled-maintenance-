import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Colors, Typography } from '../theme';

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.heroSection}>
          <Text style={styles.logoIcon}>&#9881;</Text>
          <Text style={styles.appName}>Maintenance{'\n'}Tracker</Text>
          <View style={styles.divider} />
          <Text style={styles.tagline}>
            Stay ahead of your vehicle's service schedule.{'\n'}
            Built for enthusiasts who care about their machines.
          </Text>
        </View>

        <View style={styles.featureList}>
          <FeatureItem
            icon="&#9679;"
            title="Manufacturer Schedules"
            description="Recommended service intervals from 30+ brands"
          />
          <FeatureItem
            icon="&#9679;"
            title="Smart Tracking"
            description="Know exactly what's due based on your mileage"
          />
          <FeatureItem
            icon="&#9679;"
            title="Service History"
            description="Log completed maintenance and track your records"
          />
        </View>

        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('VehicleSetup')}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Add Your Vehicle</Text>
          </TouchableOpacity>
          <Text style={styles.footnote}>
            Covers 2010 - 2026 model years {'\u2022'} US market vehicles
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function FeatureItem({ icon, title, description }) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingBottom: 24,
  },
  heroSection: {
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: 48,
    color: Colors.accent,
    marginBottom: 12,
  },
  appName: {
    ...Typography.hero,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 38,
  },
  divider: {
    width: 40,
    height: 3,
    backgroundColor: Colors.accent,
    borderRadius: 2,
    marginVertical: 16,
  },
  tagline: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  featureList: {
    paddingVertical: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  featureIcon: {
    fontSize: 8,
    color: Colors.accent,
    marginTop: 6,
    marginRight: 14,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  featureDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  bottomSection: {
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.buttonPrimary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    ...Typography.bodyBold,
    color: Colors.buttonPrimaryText,
    fontSize: 17,
  },
  footnote: {
    ...Typography.small,
    color: Colors.textMuted,
    marginTop: 12,
  },
});
