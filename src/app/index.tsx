import {
  useEffect,
  useState,
} from 'react';

import type * as Location
  from 'expo-location';

import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { router } from 'expo-router';

import Map from '@/components/Map';

import {
  useDatabase,
} from '@/contexts/DatabaseContext';

import {
  calculateDistance,
  requestLocationPermissions,
  startLocationUpdates,
} from '@/services/location'

import type {
  LocationState,
} from '@/services/location'

import {
  notificationManager,
  requestNotificationPermissions,
} from '@/services/notifications';

import type {
  Marker,
} from '@/types';

const PROXIMITY_THRESHOLD = 100;

export default function HomeScreen() {
  const {
    markers,
    addMarker,
    isLoading,
    error,
    retryInitialization,
  } = useDatabase();

  const [
    locationState,
    setLocationState,
  ] = useState<LocationState>({
    location: null,
    errorMsg: null,
  });

  const [
    notificationError,
    setNotificationError,
  ] = useState<string | null>(
    null
  );

  const openMarker = (
    id: number
  ) => {
    try {
      router.push({
        pathname:
          '/marker/[id]',
        params: {
          id: id.toString(),
        },
      });
    } catch (error) {
      console.error(error);

      Alert.alert(
        'Ошибка',
        'Не удалось открыть маркер.'
      );
    }
  };

  useEffect(() => {
    let locationSubscription:
      Location.LocationSubscription
        | undefined;

    const setupLocation =
      async () => {
        try {
          await requestLocationPermissions();

          locationSubscription =
            await startLocationUpdates(
              location => {
                setLocationState({
                  location,
                  errorMsg: null,
                });
              },
              message => {
                setLocationState(
                  current => ({
                    ...current,
                    errorMsg: message,
                  })
                );
              }
            );
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : 'Ошибка геолокации';

          console.error(error);

          setLocationState({
            location: null,
            errorMsg: message,
          });
        }
      };

    void setupLocation();

    return () => {
      if (
        locationSubscription
      ) {
        locationSubscription
          .remove();
      }
    };
  }, []);

  useEffect(() => {
    const setupNotifications =
      async () => {
        try {
          await requestNotificationPermissions();

          setNotificationError(
            null
          );
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : 'Ошибка уведомлений';

          console.error(error);

          setNotificationError(
            message
          );
        }
      };

    void setupNotifications();
  }, []);

  useEffect(() => {
    if (!locationState.location) {
      return;
    }

    const checkProximity =
      async () => {
        const userLatitude =
          locationState.location!
            .coords.latitude;

        const userLongitude =
          locationState.location!
            .coords.longitude;

        for (
          const marker of markers
        ) {
          const distance =
            calculateDistance(
              userLatitude,
              userLongitude,
              marker.latitude,
              marker.longitude
            );

          try {
            if (
              distance <=
              PROXIMITY_THRESHOLD
            ) {
              await notificationManager
                .showNotification(
                  marker
                );
            } else {
              await notificationManager
                .removeNotification(
                  marker.id
                );
            }
          } catch (error) {
            console.error(
              '[Notification]',
              error
            );
          }
        }
      };

    void checkProximity();
  }, [
    locationState.location,
    markers,
  ]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
        />

        <Text
          style={styles.infoText}
        >
          Загрузка базы данных...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text
          style={styles.errorText}
        >
          Ошибка базы данных:
          {'\n'}
          {error.message}
        </Text>

        <Pressable
          style={
            styles.retryButton
          }
          onPress={() => {
            void retryInitialization();
          }}
        >
          <Text
            style={
              styles.retryButtonText
            }
          >
            Попробовать снова
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Map
        markers={markers}
        showsUserLocation={
          locationState.location !==
          null
        }
        onAddMarker={
          addMarker
        }
        onMarkerPress={
          openMarker
        }
      />

      {locationState.errorMsg && (
        <View
          style={
            styles.messageContainer
          }
        >
          <Text
            style={
              styles.errorText
            }
          >
            {
              locationState.errorMsg
            }
          </Text>
        </View>
      )}

      {notificationError && (
        <View
          style={
            styles.notificationError
          }
        >
          <Text
            style={
              styles.errorText
            }
          >
            {notificationError}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
    },

    center: {
      flex: 1,
      justifyContent:
        'center',
      alignItems: 'center',
      padding: 20,
      gap: 16,
    },

    infoText: {
      fontSize: 16,
    },

    errorText: {
      textAlign: 'center',
      color: '#b91c1c',
      fontSize: 16,
    },

    retryButton: {
      backgroundColor:
        '#2563eb',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 10,
    },

    retryButtonText: {
      color: '#ffffff',
      fontWeight: '600',
    },

    messageContainer: {
      position: 'absolute',
      top: 20,
      left: 20,
      right: 20,
      backgroundColor:
        '#ffffff',
      padding: 12,
      borderRadius: 10,
    },

    notificationError: {
      position: 'absolute',
      bottom: 20,
      left: 20,
      right: 20,
      backgroundColor:
        '#ffffff',
      padding: 12,
      borderRadius: 10,
    },
  });