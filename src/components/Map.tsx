import { useRef } from 'react';
import type { ElementRef } from 'react';

import {
  Alert,
  StyleSheet,
} from 'react-native';

import MapView, {
  LongPressEvent,
  Marker,
} from 'react-native-maps';

import type {
  Marker as MarkerType,
} from '@/types';

type Props = {
  markers: MarkerType[];

  showsUserLocation: boolean;

  onAddMarker: (
    latitude: number,
    longitude: number
  ) => Promise<number>;

  onMarkerPress: (
    id: number
  ) => void;
};

export default function Map({
  markers,
  showsUserLocation,
  onAddMarker,
  onMarkerPress,
}: Props) {
  const markerRefs =
    useRef<
      Record<
        number,
        ElementRef<typeof Marker> | null
      >
    >({});

  const handleLongPress = async (
    event: LongPressEvent
  ) => {
    try {
      const {
        latitude,
        longitude,
      } =
        event.nativeEvent.coordinate;

      await onAddMarker(
        latitude,
        longitude
      );
    } catch (error) {
      console.error(error);

      Alert.alert(
        'Ошибка',
        'Не удалось создать маркер.'
      );
    }
  };

  const handleMarkerPress = (
    id: number
  ) => {
    markerRefs.current[id]
      ?.hideCallout();

    setTimeout(() => {
      onMarkerPress(id);
    }, 50);
  };

  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: 55.752,
        longitude: 37.617,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }}
      showsUserLocation={
        showsUserLocation
      }
      onLongPress={
        handleLongPress
      }
      onPress={() => {
        Object.values(
          markerRefs.current
        ).forEach(markerRef => {
          markerRef?.hideCallout();
        });
      }}
    >
      {markers.map(marker => (
        <Marker
          key={marker.id}
          ref={ref => {
            markerRefs.current[
              marker.id
            ] = ref;
          }}
          coordinate={{
            latitude:
              marker.latitude,
            longitude:
              marker.longitude,
          }}
          onPress={() =>
            handleMarkerPress(
              marker.id
            )
          }
        />
      ))}
    </MapView>
  );
}

const styles =
  StyleSheet.create({
    map: {
      flex: 1,
    },
  });