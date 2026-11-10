import type {
  SQLiteDatabase,
} from 'expo-sqlite';

import type {
  Marker,
  MarkerImage,
} from '@/types';

export async function createMarker(
  db: SQLiteDatabase,
  latitude: number,
  longitude: number
): Promise<number> {
  const result = await db.runAsync(
    `
      INSERT INTO markers (
        latitude,
        longitude
      )
      VALUES (?, ?)
    `,
    latitude,
    longitude
  );

  if (__DEV__) {
    console.log(
      '[DB] Marker created:',
      result.lastInsertRowId
    );
  }

  return result.lastInsertRowId;
}

export async function getAllMarkers(
  db: SQLiteDatabase
): Promise<Marker[]> {
  return await db.getAllAsync<Marker>(`
    SELECT
      id,
      latitude,
      longitude,
      created_at
    FROM markers
  `);
}

export async function getMarkerById(
  db: SQLiteDatabase,
  id: number
): Promise<Marker | null> {
  const marker =
    await db.getFirstAsync<Marker>(
      `
        SELECT
          id,
          latitude,
          longitude,
          created_at
        FROM markers
        WHERE id = ?
      `,
      id
    );

  return marker ?? null;
}

export async function removeMarker(
  db: SQLiteDatabase,
  id: number
): Promise<void> {
  await db.withTransactionAsync(
    async () => {
      const result =
        await db.runAsync(
          `
            DELETE FROM markers
            WHERE id = ?
          `,
          id
        );

      if (result.changes === 0) {
        throw new Error(
          `Marker with id ${id} not found`
        );
      }
    }
  );

  if (__DEV__) {
    console.log(
      '[DB] Marker deleted:',
      id
    );
  }
}

export async function createImage(
  db: SQLiteDatabase,
  markerId: number,
  uri: string
): Promise<number> {
  const result = await db.runAsync(
    `
      INSERT INTO marker_images (
        marker_id,
        uri
      )
      VALUES (?, ?)
    `,
    markerId,
    uri
  );

  if (__DEV__) {
    console.log(
      '[DB] Image created:',
      result.lastInsertRowId
    );
  }

  return result.lastInsertRowId;
}

export async function getImagesForMarker(
  db: SQLiteDatabase,
  markerId: number
): Promise<MarkerImage[]> {
  return await db.getAllAsync<MarkerImage>(
    `
      SELECT
        id,
        marker_id,
        uri,
        created_at
      FROM marker_images
      WHERE marker_id = ?
      ORDER BY created_at ASC
    `,
    markerId
  );
}

export async function removeImage(
  db: SQLiteDatabase,
  id: number
): Promise<void> {
  const result = await db.runAsync(
    `
      DELETE FROM marker_images
      WHERE id = ?
    `,
    id
  );

  if (result.changes === 0) {
    throw new Error(
      `Image with id ${id} not found`
    );
  }

  if (__DEV__) {
    console.log(
      '[DB] Image deleted:',
      id
    );
  }
}