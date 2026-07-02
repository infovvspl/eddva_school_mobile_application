import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import Icon from './Icon';
import { Colors } from '../constants/theme';
import { getCurrentAddress, type ParsedAddress, type GeoCoords } from '../utils/location';
import { deviceService } from '../services/device.service';
import { font, hs, ms, vs } from '../utils/responsive';

type Props = {
  onResolved: (address: ParsedAddress, coords: GeoCoords) => void;
  label?: string;
  syncToServer?: boolean;
};

const UseCurrentLocationButton: React.FC<Props> = ({
  onResolved,
  label = 'Use current location',
  syncToServer = false,
}) => {
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    setLoading(true);
    try {
      const { coords, address } = await getCurrentAddress();
      onResolved(address, coords);
      if (syncToServer) {
        await deviceService.reportLocation(coords);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not get location';
      Alert.alert('Location', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.btn}
      onPress={handlePress}
      disabled={loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator size="small" color={Colors.primary} />
      ) : (
        <Icon name="map-marker-alt" size={ms(14)} color={Colors.primary} solid />
      )}
      <Text style={styles.text}>{loading ? 'Getting location…' : label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: hs(8),
    paddingVertical: vs(10),
    paddingHorizontal: hs(12),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${Colors.primary}40`,
    backgroundColor: `${Colors.primary}08`,
    marginBottom: vs(12),
  },
  text: {
    fontSize: font.caption,
    fontWeight: '700',
    color: Colors.primary,
  },
});

export default UseCurrentLocationButton;
