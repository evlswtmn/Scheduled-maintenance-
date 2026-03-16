import { Alert, Platform } from 'react-native';

/**
 * Cross-platform alert that uses Alert.alert on native and window.confirm/alert on web.
 *
 * Supports the standard Alert.alert(title, message, buttons) signature.
 * On web, if there are two buttons (cancel + action), uses window.confirm.
 * If there's only one button or no buttons, uses window.alert.
 */
export function showAlert(title, message, buttons) {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons);
    return;
  }

  // Web fallback
  if (!buttons || buttons.length <= 1) {
    window.alert(message ? `${title}\n\n${message}` : title);
    const btn = buttons?.[0];
    if (btn?.onPress) btn.onPress();
    return;
  }

  // Two or more buttons — use confirm for the non-cancel action
  const cancelBtn = buttons.find((b) => b.style === 'cancel');
  const actionBtn = buttons.find((b) => b.style !== 'cancel') || buttons[buttons.length - 1];

  const confirmed = window.confirm(message ? `${title}\n\n${message}` : title);
  if (confirmed) {
    if (actionBtn?.onPress) actionBtn.onPress();
  } else {
    if (cancelBtn?.onPress) cancelBtn.onPress();
  }
}
