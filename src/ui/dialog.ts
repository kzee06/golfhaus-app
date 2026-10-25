// Cross-platform dialogs. React Native's Alert is a no-op on web (react-native-
// web ships an empty implementation), so on web we use the browser's own
// confirm/alert, and native Alert everywhere else.

import { Alert, Platform } from 'react-native';

export function confirmAction(opts: { title: string; message?: string; confirmLabel?: string; destructive?: boolean; onConfirm: () => void }) {
  const { title, message, confirmLabel = 'OK', destructive, onConfirm } = opts;
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm(message ? `${title}\n\n${message}` : title)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: confirmLabel, style: destructive ? 'destructive' : 'default', onPress: onConfirm },
  ]);
}

export function notify(title: string, message?: string) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}
