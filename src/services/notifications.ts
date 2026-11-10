import { Platform } from 'react-native';

import * as Notifications
  from 'expo-notifications';

import type {
  Marker,
} from '@/types';

export interface ActiveNotification {
  markerId: number;
  notificationId: string;
  timestamp: number;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(
      'marker-proximity',
      {
        name: 'Marker proximity',
        importance:
          Notifications.AndroidImportance.DEFAULT,
      }
    );
  }

  const permission =
    await Notifications.requestPermissionsAsync();

  if (!permission.granted) {
    throw new Error(
      'Доступ к уведомлениям не разрешён'
    );
  }
}

class NotificationManager {
  private activeNotifications:
    Map<number, ActiveNotification>;

  constructor() {
    this.activeNotifications =
      new Map();
  }

  async showNotification(
    marker: Marker
  ): Promise<void> {
    if (
      this.activeNotifications.has(
        marker.id
      )
    ) {
      return;
    }

    const notificationId =
      await Notifications
        .scheduleNotificationAsync({
          content: {
            title:
              'Вы рядом с меткой!',
            body:
              'Вы находитесь рядом с сохранённой точкой.',
          },
          trigger: null,
        });

    this.activeNotifications.set(
      marker.id,
      {
        markerId: marker.id,
        notificationId,
        timestamp: Date.now(),
      }
    );
  }

  async removeNotification(
    markerId: number
  ): Promise<void> {
    const notification =
      this.activeNotifications.get(
        markerId
      );

    if (!notification) {
      return;
    }

    await Notifications
      .cancelScheduledNotificationAsync(
        notification.notificationId
      );

    this.activeNotifications.delete(
      markerId
    );
  }
}

export const notificationManager =
  new NotificationManager();