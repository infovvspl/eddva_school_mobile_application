import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function resetToMain(): void {
  if (!navigationRef.isReady()) return;
  navigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    }),
  );
}

/** Wait until root navigator is ready (e.g. after onboarding stack unmounts). */
export function resetToMainWhenReady(maxAttempts = 25, intervalMs = 80): void {
  const attempt = (left: number) => {
    if (navigationRef.isReady()) {
      resetToMain();
      return;
    }
    if (left > 0) setTimeout(() => attempt(left - 1), intervalMs);
  };
  attempt(maxAttempts);
}

/** After logout — land on login (intro only if not yet seen). */
export function resetToAuth(): void {
  if (!navigationRef.isReady()) return;
  navigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Auth' }],
    }),
  );
}

export function navigateRoot<RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params?: RootStackParamList[RouteName],
): void {
  if (!navigationRef.isReady()) return;
  // @ts-expect-error — param list union is narrow enough at call sites
  navigationRef.navigate(name, params);
}
