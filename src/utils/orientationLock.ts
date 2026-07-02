import { NativeModules, Platform } from 'react-native';

type OrientationLockNative = {
  lockLandscape: () => void;
  unlockPortrait: () => void;
};

const native = NativeModules.OrientationLock as OrientationLockNative | undefined;

/** Lock the app to landscape while watching fullscreen video (Android). */
export function lockVideoLandscape(): void {
  if (Platform.OS === 'android' && native?.lockLandscape) {
    native.lockLandscape();
  }
}

/** Return to portrait after exiting fullscreen video (Android). */
export function unlockVideoPortrait(): void {
  if (Platform.OS === 'android' && native?.unlockPortrait) {
    native.unlockPortrait();
  }
}
