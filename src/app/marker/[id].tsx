import { useEffect, useState } from 'react';

import * as ImagePicker from 'expo-image-picker';

import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import ImageList from '@/components/ImageList';

import { useDatabase } from '@/contexts/DatabaseContext';

import type { MarkerImage } from '@/types';

export default function MarkerDetailsScreen() {
  const { id } = useLocalSearchParams<'/marker/[id]'>();

  const markerId = Number(id);

  const {
    markers,
    addImage,
    deleteImage,
    deleteMarker,
    getMarkerImages,
    isLoading,
  } = useDatabase();

  const [images, setImages] = useState<MarkerImage[]>([]);

  const [isImagesLoading, setIsImagesLoading] = useState(true);

  const marker = markers.find(item => item.id === markerId);

  const loadImages = async () => {
    if (
      !Number.isInteger(
        markerId
      )
    ) {
      setIsImagesLoading(false);
      return;
    }

    try {
      setIsImagesLoading(true);

      const result =
        await getMarkerImages(
          markerId
        );

      setImages(result);
    } catch (error) {
      console.error(error);

      Alert.alert('Ошибка', 'Не удалось загрузить изображения.');
    } finally {
      setIsImagesLoading(false);
    }
  };

  useEffect(() => { void loadImages(); }, [markerId]);

  useEffect(() => {
    const requestPermission =
      async () => {
        try {
          const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

          if (
            !permission.granted
          ) {
            Alert.alert('Нет доступа', 'Для добавления изображений нужен доступ к медиатеке.');
          }
        } catch (error) {
          console.error(error);

          Alert.alert('Ошибка', 'Не удалось запросить доступ к медиатеке.');
        }
      };

    void requestPermission();
  }, []);

  const pickImage =
    async () => {
      try {
        const result =
          await ImagePicker
            .launchImageLibraryAsync(
              {
                mediaTypes: [
                  'images',
                ],
                allowsEditing:
                  false,
                quality: 0.8,
              }
            );

        if (result.canceled) {
          return;
        }

        const image =
          result.assets[0];

        if (!image) {
          Alert.alert(
            'Ошибка',
            'Не удалось получить выбранное изображение.'
          );

          return;
        }

        await addImage(
          markerId,
          image.uri
        );

        await loadImages();
      } catch (error) {
        console.error(error);

        Alert.alert(
          'Ошибка',
          'Не удалось добавить изображение.'
        );
      }
    };

  const handleDeleteImage =
    (imageId: number) => {
      Alert.alert(
        'Удалить изображение',
        'Ты точно хочешь удалить это изображение?',
        [
          {
            text: 'Отмена',
            style: 'cancel',
          },
          {
            text: 'Удалить',
            style:
              'destructive',

            onPress: () => {
              void (async () => {
                try {
                  await deleteImage(
                    imageId
                  );

                  await loadImages();
                } catch (error) {
                  console.error(
                    error
                  );

                  Alert.alert(
                    'Ошибка',
                    'Не удалось удалить изображение.'
                  );
                }
              })();
            },
          },
        ]
      );
    };

  const handleDeleteMarker =
    () => {
      Alert.alert(
        'Удалить маркер',
        'А ты точно хочешь это сделать?',
        [
          {
            text: 'Отмена',
            style: 'cancel',
          },
          {
            text: 'Удалить',
            style:
              'destructive',

            onPress: () => {
              void (async () => {
                try {
                  await deleteMarker(markerId);

                  router.back();
                } catch (error) {
                  console.error(error);

                  Alert.alert('Ошибка', 'Не удалось удалить маркер.');
                }
              })();
            },
          },
        ]
      );
    };

  if (
    isLoading ||
    isImagesLoading
  ) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
        />
      </View>
    );
  }

  if (
    !Number.isInteger(
      markerId
    ) ||
    !marker
  ) {
    return (
      <View style={styles.center}>
        <Text
          style={styles.errorText}
        >
          Маркер не найден.
        </Text>

        <Pressable
          style={styles.button}
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={
              styles.buttonText
            }
          >
            Назад
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.content
      }
    >
      <Text style={styles.title}>
        Твой маркер
      </Text>

      <View
        style={styles.infoCard}
      >
        <Text style={styles.label}>
          Широта
        </Text>

        <Text style={styles.value}>
          {marker.latitude.toFixed(
            6
          )}
        </Text>

        <Text style={styles.label}>
          Долгота
        </Text>

        <Text style={styles.value}>
          {marker.longitude.toFixed(
            6
          )}
        </Text>
      </View>

      <Pressable
        style={styles.button}
        onPress={() => {
          void pickImage();
        }}
      >
        <Text
          style={styles.buttonText}
        >
          Добавить изображение
        </Text>
      </Pressable>

      <Pressable
        style={
          styles.deleteMarkerButton
        }
        onPress={
          handleDeleteMarker
        }
      >
        <Text
          style={styles.buttonText}
        >
          Удалить маркер
        </Text>
      </Pressable>

      <Text
        style={styles.subtitle}
      >
        Изображения (
        {images.length})
      </Text>

      <ImageList
        images={images}
        onDelete={
          handleDeleteImage
        }
      />
    </ScrollView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        '#f4f4f4',
    },

    content: {
      padding: 20,
    },

    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },

    title: {
      fontSize: 26,
      fontWeight: '700',
      marginBottom: 20,
    },

    subtitle: {
      fontSize: 20,
      fontWeight: '600',
      marginTop: 30,
      marginBottom: 15,
    },

    infoCard: {
      backgroundColor:
        '#ffffff',
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
    },

    label: {
      color: '#777',
      marginTop: 8,
    },

    value: {
      fontSize: 18,
      fontWeight: '600',
    },

    button: {
      backgroundColor:
        '#2563eb',
      padding: 16,
      borderRadius: 10,
      alignItems: 'center',
    },

    deleteMarkerButton: {
      backgroundColor:
        '#e53935',
      padding: 16,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 12,
    },

    buttonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },

    errorText: {
      fontSize: 18,
      marginBottom: 20,
    },
  });