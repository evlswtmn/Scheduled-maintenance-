import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography } from '../theme';

export default function Header({ title, subtitle, rightAction, onRightAction, leftAction, onLeftAction }) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {leftAction ? (
          <TouchableOpacity onPress={onLeftAction} style={styles.actionButton}>
            <Text style={styles.actionText}>{leftAction}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.actionPlaceholder} />
        )}
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
        </View>
        {rightAction ? (
          <TouchableOpacity onPress={onRightAction} style={styles.actionButton}>
            <Text style={styles.actionText}>{rightAction}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.actionPlaceholder} />
        )}
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    ...Typography.subtitle,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 60,
  },
  actionText: {
    ...Typography.captionBold,
    color: Colors.accent,
  },
  actionPlaceholder: {
    minWidth: 60,
  },
});
