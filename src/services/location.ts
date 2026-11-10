import * as Location from 'expo-location';

export interface LocationConfig {
  accuracy: Location.Accuracy;
  timeInterval: number;
  distanceInterval: number;
}

export interface LocationState {
  location: Location.LocationObject | null;
  errorMsg: string | null;
}

export const LOCATION_CONFIG: LocationConfig = {
  accuracy: Location.Accuracy.Balanced,
  timeInterval: 5000,
  distanceInterval: 5,
};

export async function requestLocationPermissions() {
  const servicesEnabled =
    await Location.hasServicesEnabledAsync();

  if (!servicesEnabled) {
    throw new Error(
      'Службы геолокации отключены'
    );
  }

  const { status } =
    await Location.requestForegroundPermissionsAsync();

  if (status !== 'granted') {
    throw new Error(
      'Доступ к местоположению не разрешён'
    );
  }
}

export async function startLocationUpdates(
  onLocation: (
    location: Location.LocationObject
  ) => void,
  onError: (message: string) => void
) {
  return await Location.watchPositionAsync(
    LOCATION_CONFIG,
    onLocation,
    onError
  );
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const earthRadius = 6371000;

  const toRadians = (degrees: number) =>
    degrees * (Math.PI / 180);

  const latitude1 = toRadians(lat1);
  const latitude2 = toRadians(lat2);

  const latitudeDifference =
    toRadians(lat2 - lat1);

  const longitudeDifference =
    toRadians(lon2 - lon1);

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(latitude1) *
      Math.cos(latitude2) *
      Math.sin(longitudeDifference / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return earthRadius * c;
}