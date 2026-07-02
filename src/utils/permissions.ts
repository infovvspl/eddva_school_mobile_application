import { Platform, PermissionsAndroid } from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  type Permission,
} from 'react-native-permissions';

export async function checkNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    if (Platform.Version < 33) return true;
    const result = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return result;
  }
  const perm = PERMISSIONS.IOS.NOTIFICATIONS;
  const current = await check(perm);
  return current === RESULTS.GRANTED || current === RESULTS.LIMITED;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    if (Platform.Version >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  }

  const perm = PERMISSIONS.IOS.NOTIFICATIONS;
  const current = await check(perm);
  if (current === RESULTS.GRANTED || current === RESULTS.LIMITED) return true;
  if (current === RESULTS.BLOCKED) return false;
  const next = await request(perm);
  return next === RESULTS.GRANTED || next === RESULTS.LIMITED;
}

export async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    const fine = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    if (fine === PermissionsAndroid.RESULTS.GRANTED) return true;
    const coarse = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    );
    return coarse === PermissionsAndroid.RESULTS.GRANTED;
  }

  const perm: Permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
  const current = await check(perm);
  if (current === RESULTS.GRANTED || current === RESULTS.LIMITED) return true;
  if (current === RESULTS.BLOCKED) return false;
  const next = await request(perm);
  return next === RESULTS.GRANTED || next === RESULTS.LIMITED;
}
