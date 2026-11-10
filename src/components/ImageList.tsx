import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type {
  MarkerImage,
} from '@/types';

type Props = {
  images: MarkerImage[];

  onDelete: (
    id: number
  ) => void;
};

export default function ImageList({
  images,
  onDelete,
}: Props) {
  if (images.length === 0) {
    return (
      <Text
        style={styles.emptyText}
      >
        Изображения не добавлены
      </Text>
    );
  }

  return (
    <View style={styles.list}>
      {images.map(item => (
        <View
          key={item.id}
          style={
            styles.imageContainer
          }
        >
          <Image
            source={{
              uri: item.uri,
            }}
            style={styles.image}
          />

          <Pressable
            style={
              styles.deleteButton
            }
            onPress={() =>
              onDelete(item.id)
            }
          >
            <Text
              style={
                styles.deleteText
              }
            >
              Удалить изображение
            </Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles =
  StyleSheet.create({
    list: {
      gap: 16,
    },

    imageContainer: {
      backgroundColor:
        '#ffffff',
      borderRadius: 12,
      padding: 10,
    },

    image: {
      width: '100%',
      height: 220,
      borderRadius: 8,
    },

    deleteButton: {
      marginTop: 10,
      backgroundColor:
        '#e53935',
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
    },

    deleteText: {
      color: '#ffffff',
      fontWeight: '600',
    },

    emptyText: {
      color: '#777',
      textAlign: 'center',
      marginTop: 30,
    },
  });