
import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'markers.db';
const DATABASE_VERSION = 1;

export async function initDatabase() {
    let db: SQLite.SQLiteDatabase | null = null;

    try {
        if (__DEV__) {
            console.log('[DB] Opening database...');
        }

        db = await SQLite.openDatabaseAsync(
            DATABASE_NAME
        );

        await db.execAsync(`
      PRAGMA foreign_keys = ON;
      PRAGMA journal_mode = WAL;
    `);

        const versionResult = await db.getFirstAsync<{ user_version: number; }>('PRAGMA user_version');

        const currentVersion = versionResult?.user_version ?? 0;

        if (__DEV__) {
            console.log('[DB] Current version:', currentVersion);
        }

        if (currentVersion < 1) {
            await db.withTransactionAsync(
                async () => {
                    await db!.execAsync(`
            CREATE TABLE IF NOT EXISTS markers (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              latitude REAL NOT NULL,
              longitude REAL NOT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS marker_images (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              marker_id INTEGER NOT NULL,
              uri TEXT NOT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

              FOREIGN KEY (marker_id)
                REFERENCES markers(id)
                ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_marker_images_marker_id ON marker_images(marker_id);

            PRAGMA user_version = 1;
          `);
                }
            );
        }

        if (__DEV__) {
            console.log('[DB] Database initialized successfully');
        }

        return db;
    } catch (error) {
        console.error('[DB] Initialization error:', error);

        if (db) {
            try {
                await db.closeAsync();
            } catch (closeError) {
                console.error('[DB] Close error:', closeError);
            }
        }

        throw error;
    }
}