import Geolocation from 'react-native-geolocation-service';
import { requestLocationPermission } from './permissions';

export type GeoCoords = {
  latitude: number;
  longitude: number;
  accuracy?: number;
};

export type ParsedAddress = {
  address?: string;
  postOffice?: string;
  city?: string;
  landmark?: string;
  state?: string;
  pinCode?: string;
};

export async function getCurrentCoords(): Promise<GeoCoords> {
  const allowed = await requestLocationPermission();
  if (!allowed) {
    throw new Error('Location permission denied. Enable it in Settings.');
  }

  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      pos => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      err => reject(new Error(err.message || 'Could not get location')),
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 60000,
        forceRequestLocation: true,
        showLocationDialog: true,
      },
    );
  });
}

/** Reverse geocode via OpenStreetMap (no API key). */
export async function reverseGeocodeAddress(
  latitude: number,
  longitude: number,
): Promise<ParsedAddress> {
  const url =
    `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}` +
    '&format=json&addressdetails=1';
  const res = await fetch(url, {
    headers: { 'User-Agent': 'EDDVA-Student-App/1.0 (contact@eddva.in)' },
  });
  if (!res.ok) throw new Error('Could not resolve address from location');
  const data = (await res.json()) as {
    display_name?: string;
    address?: Record<string, string>;
  };
  const a = data.address || {};
  const road = [a.house_number, a.road, a.neighbourhood, a.suburb].filter(Boolean).join(', ');
  const city = a.city || a.town || a.village || a.county || a.state_district || '';
  const state = a.state || '';
  const pin = a.postcode || '';

  return {
    address: road || data.display_name?.split(',')[0] || '',
    postOffice: a.suburb || a.neighbourhood || a.city_district || '',
    city,
    landmark: a.county || a.state_district || '',
    state,
    pinCode: pin.replace(/\D/g, '').slice(0, 6),
  };
}

export async function getCurrentAddress(): Promise<{ coords: GeoCoords; address: ParsedAddress }> {
  const coords = await getCurrentCoords();
  const address = await reverseGeocodeAddress(coords.latitude, coords.longitude);
  return { coords, address };
}
