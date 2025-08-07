import * as Haptics from 'expo-haptics';

export const haptics = {
  // Light impact for button presses, selections
  light: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },

  // Medium impact for important actions, form submissions
  medium: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },

  // Heavy impact for critical actions, errors
  heavy: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },

  // Success notification
  success: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  // Warning notification
  warning: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },

  // Error notification
  error: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },

  // Selection feedback for pickers, toggles
  selection: () => {
    Haptics.selectionAsync();
  },
};

// Convenience functions for common app interactions
export const hapticFeedback = {
  // Button press feedback
  buttonPress: () => haptics.light(),

  // Form submission feedback
  formSubmit: () => haptics.medium(),

  // Success feedback
  success: () => haptics.success(),

  // Error feedback
  error: () => haptics.error(),

  // Warning feedback
  warning: () => haptics.warning(),

  // Toggle/selection feedback
  toggle: () => haptics.selection(),

  // Critical action feedback (like logging a fall)
  critical: () => haptics.heavy(),
}; 