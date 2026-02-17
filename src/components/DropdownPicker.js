import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors, Typography } from '../theme';

export default function DropdownPicker({
  label,
  placeholder,
  value,
  options,
  onSelect,
  disabled,
  searchable,
}) {
  const [visible, setVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  const filteredOptions = searchable && searchText
    ? options.filter((opt) => {
        const optLabel = typeof opt === 'string' ? opt : opt.label;
        return optLabel.toLowerCase().includes(searchText.toLowerCase());
      })
    : options;

  const handleSelect = (option) => {
    const val = typeof option === 'string' ? option : option.value;
    onSelect(val);
    setVisible(false);
    setSearchText('');
  };

  const displayValue = () => {
    if (!value) return null;
    const found = options.find((opt) => {
      const val = typeof opt === 'string' ? opt : opt.value;
      return val === value;
    });
    if (found) {
      return typeof found === 'string' ? found : found.label;
    }
    return value;
  };

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TouchableOpacity
        style={[styles.selector, disabled && styles.selectorDisabled]}
        onPress={() => !disabled && setVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.selectorText, !value && styles.placeholderText]}>
          {displayValue() || placeholder || 'Select...'}
        </Text>
        <Text style={styles.arrow}>&#9662;</Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Select'}</Text>
              <TouchableOpacity onPress={() => { setVisible(false); setSearchText(''); }}>
                <Text style={styles.closeButton}>Done</Text>
              </TouchableOpacity>
            </View>

            {searchable ? (
              <TextInput
                style={styles.searchInput}
                placeholder="Search..."
                placeholderTextColor={Colors.textMuted}
                value={searchText}
                onChangeText={setSearchText}
                autoCorrect={false}
                autoCapitalize="none"
              />
            ) : null}

            <FlatList
              data={filteredOptions}
              keyExtractor={(item, index) => {
                const val = typeof item === 'string' ? item : item.value;
                return `${val}_${index}`;
              }}
              renderItem={({ item }) => {
                const itemValue = typeof item === 'string' ? item : item.value;
                const itemLabel = typeof item === 'string' ? item : item.label;
                const isSelected = itemValue === value;
                return (
                  <TouchableOpacity
                    style={[styles.option, isSelected && styles.optionSelected]}
                    onPress={() => handleSelect(item)}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {itemLabel}
                    </Text>
                    {isSelected ? (
                      <Text style={styles.checkmark}>&#10003;</Text>
                    ) : null}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No options found</Text>
                </View>
              }
              style={styles.list}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectorDisabled: {
    opacity: 0.5,
  },
  selectorText: {
    ...Typography.body,
    color: Colors.textPrimary,
    flex: 1,
  },
  placeholderText: {
    color: Colors.textMuted,
  },
  arrow: {
    fontSize: 14,
    color: Colors.textMuted,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  modalTitle: {
    ...Typography.subtitle,
    color: Colors.textPrimary,
  },
  closeButton: {
    ...Typography.captionBold,
    color: Colors.accent,
  },
  searchInput: {
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...Typography.body,
    color: Colors.textPrimary,
  },
  list: {
    paddingHorizontal: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  optionSelected: {
    backgroundColor: Colors.accentMuted,
  },
  optionText: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  optionTextSelected: {
    color: Colors.accent,
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: Colors.accent,
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textMuted,
  },
});
