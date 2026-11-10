import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import {
  DatabaseProvider,
} from '@/contexts/DatabaseContext';

export default function RootLayout() {
  return (
    <DatabaseProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: 'Map',
          }}
        />

        <Stack.Screen
          name="marker/[id]"
          options={{
            title: 'Marker details',
          }}
        />
      </Stack>

      <StatusBar style="dark" />
    </DatabaseProvider>
  );
}