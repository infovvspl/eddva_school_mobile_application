import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  type ImageStyle,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mediaUrlNeedsAuth, resolveMediaUrl } from '../utils/mediaUrl';

type Props = {
  uri?: string | null;
  name?: string;
  size: number;
  borderColor?: string;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  textStyle?: StyleProp<TextStyle>;
};

function initialsFromName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'S';
}

/** Profile photo with URL fix-up, optional API auth header, and initials fallback. */
const ProfileAvatar: React.FC<Props> = ({
  uri,
  name = 'Student',
  size,
  borderColor = '#0066cc',
  style,
  imageStyle,
  textStyle,
}) => {
  const [failed, setFailed] = useState(false);
  const [authHeader, setAuthHeader] = useState<Record<string, string> | undefined>();
  const [authChecked, setAuthChecked] = useState(false);

  const resolved = useMemo(() => resolveMediaUrl(uri), [uri]);
  const needsAuth = !!resolved && mediaUrlNeedsAuth(resolved);
  const authReady = !needsAuth || authChecked;
  const initials = initialsFromName(name);

  useEffect(() => {
    setFailed(false);
  }, [resolved]);

  useEffect(() => {
    if (!needsAuth) {
      setAuthHeader(undefined);
      setAuthChecked(true);
      return;
    }
    let cancelled = false;
    setAuthChecked(false);
    AsyncStorage.getItem('accessToken').then(token => {
      if (cancelled) return;
      setAuthHeader(token ? { Authorization: `Bearer ${token}` } : undefined);
      setAuthChecked(true);
    });
    return () => {
      cancelled = true;
    };
  }, [needsAuth, resolved]);

  const showPhoto =
    !!resolved && !failed && authReady && (!needsAuth || !!authHeader);
  const radius = size / 2;

  return (
    <View
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: radius,
          borderColor,
        },
        style,
      ]}
    >
      {showPhoto ? (
        <Image
          key={`${resolved}-${needsAuth ? 'auth' : 'public'}`}
          source={
            authHeader
              ? { uri: resolved!, headers: authHeader }
              : { uri: resolved! }
          }
          style={[
            styles.image,
            { width: size, height: size, borderRadius: radius },
            imageStyle,
          ]}
          onError={() => setFailed(true)}
        />
      ) : (
        <View style={[styles.fallback, { backgroundColor: `${borderColor}20` }]}>
          <Text style={[styles.initials, { color: borderColor, fontSize: size * 0.32 }, textStyle]}>
            {initials}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderWidth: 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { fontWeight: '800' },
});

export default ProfileAvatar;
