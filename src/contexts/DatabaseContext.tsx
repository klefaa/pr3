import { createContext, PropsWithChildren, useContext, useEffect, useRef, useState, } from 'react';

import type { SQLiteDatabase, } from 'expo-sqlite';

import type { Marker, MarkerImage } from '@/types';

import { initDatabase, } from '@/database/schema';

import { createImage, createMarker, getAllMarkers, getImagesForMarker, getMarkerById as getMarkerByIdFromDb, removeImage, removeMarker, } from '@/database/operations';

type DatabaseContextType = {
    markers: Marker[];

    addMarker: (latitude: number, longitude: number) => Promise<number>;

    deleteMarker: (id: number) => Promise<void>;

    getMarkers: () => Promise<Marker[]>;

    getMarkerById: (
        id: number
    ) => Promise<Marker | null>;

    addImage: (
        markerId: number,
        uri: string
    ) => Promise<void>;

    deleteImage: (
        id: number
    ) => Promise<void>;

    getMarkerImages: (
        markerId: number
    ) => Promise<MarkerImage[]>;

    refreshMarkers: () => Promise<void>;

    retryInitialization:
    () => Promise<void>;

    isLoading: boolean;
    error: Error | null;
};

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

function normalizeError(
    error: unknown
): Error {
    if (error instanceof Error) {
        return error;
    }

    return new Error(
        'Unknown database error'
    );
}

export function DatabaseProvider({
    children,
}: PropsWithChildren) {
    const [db, setDb] = useState<SQLiteDatabase | null>(null);

    const dbRef = useRef<SQLiteDatabase | null>(null);

    const [markers, setMarkers] = useState<Marker[]>([]);

    const [isLoading, setIsLoading] = useState(true);

    const [error, setError] = useState<Error | null>(null);

    const initializeDatabase =
        async () => {
            setIsLoading(true);
            setError(null);

            try {
                if (dbRef.current) {
                    await dbRef.current.closeAsync();

                    dbRef.current = null;
                    setDb(null);
                }

                const database = await initDatabase();

                dbRef.current = database;
                setDb(database);

                const loadedMarkers = await getAllMarkers(database);
                setMarkers(loadedMarkers);
            } catch (caughtError) {
                const databaseError = normalizeError(caughtError);

                console.error('[DB] Initialization failed:',databaseError);
                setError(databaseError);
            } finally {
                setIsLoading(false);
            }
        };

    useEffect(() => {
        void initializeDatabase();

        return () => {
            const database =
                dbRef.current;

            dbRef.current = null;

            if (database) {
                void database
                    .closeAsync()
                    .catch(closeError => {
                        console.error(
                            '[DB] Close error:',
                            closeError
                        );
                    });
            }
        };
    }, []);

    const requireDatabase = () => {
        if (!db) {
            throw new Error(
                'Database is not initialized'
            );
        }

        return db;
    };

    const getMarkers =
        async (): Promise<Marker[]> => {
            try {
                setError(null);

                const database = requireDatabase();

                return await getAllMarkers(
                    database
                );
            } catch (caughtError) {
                const databaseError = normalizeError(caughtError);

                setError(databaseError);

                throw databaseError;
            }
        };

    const refreshMarkers =
        async () => {
            const result =
                await getMarkers();

            setMarkers(result);
        };

    const addMarker = async (
        latitude: number,
        longitude: number
    ): Promise<number> => {
        try {
            setError(null);

            const database =
                requireDatabase();

            const id =
                await createMarker(
                    database,
                    latitude,
                    longitude
                );

            await refreshMarkers();

            return id;
        } catch (caughtError) {
            const databaseError =
                normalizeError(caughtError);

            console.error(
                '[DB] Add marker error:',
                databaseError
            );

            setError(databaseError);

            throw databaseError;
        }
    };

    const deleteMarker = async (
        id: number
    ): Promise<void> => {
        try {
            setError(null);

            const database =
                requireDatabase();

            await removeMarker(
                database,
                id
            );

            await refreshMarkers();
        } catch (caughtError) {
            const databaseError =
                normalizeError(caughtError);

            console.error(
                '[DB] Delete marker error:',
                databaseError
            );

            setError(databaseError);

            throw databaseError;
        }
    };

    const getMarkerById = async (
        id: number
    ): Promise<Marker | null> => {
        try {
            setError(null);

            const database =
                requireDatabase();

            return await getMarkerByIdFromDb(
                database,
                id
            );
        } catch (caughtError) {
            const databaseError =
                normalizeError(caughtError);

            setError(databaseError);

            throw databaseError;
        }
    };

    const addImage = async (
        markerId: number,
        uri: string
    ): Promise<void> => {
        try {
            setError(null);

            const database =
                requireDatabase();

            await createImage(
                database,
                markerId,
                uri
            );
        } catch (caughtError) {
            const databaseError =
                normalizeError(caughtError);

            console.error(
                '[DB] Add image error:',
                databaseError
            );

            setError(databaseError);

            throw databaseError;
        }
    };

    const deleteImage = async (
        id: number
    ): Promise<void> => {
        try {
            setError(null);

            const database =
                requireDatabase();

            await removeImage(
                database,
                id
            );
        } catch (caughtError) {
            const databaseError =
                normalizeError(caughtError);

            console.error(
                '[DB] Delete image error:',
                databaseError
            );

            setError(databaseError);

            throw databaseError;
        }
    };

    const getMarkerImages = async (
        markerId: number
    ): Promise<MarkerImage[]> => {
        try {
            setError(null);

            const database =
                requireDatabase();

            return await getImagesForMarker(
                database,
                markerId
            );
        } catch (caughtError) {
            const databaseError =
                normalizeError(caughtError);

            console.error(
                '[DB] Get images error:',
                databaseError
            );

            setError(databaseError);

            throw databaseError;
        }
    };

    return (
        <DatabaseContext.Provider
            value={{
                markers,
                addMarker,
                deleteMarker,
                getMarkers,
                getMarkerById,
                addImage,
                deleteImage,
                getMarkerImages,
                refreshMarkers,
                retryInitialization:
                    initializeDatabase,
                isLoading,
                error,
            }}
        >
            {children}
        </DatabaseContext.Provider>
    );
}

export function useDatabase() {
    const context =
        useContext(DatabaseContext);

    if (!context) {
        throw new Error(
            'useDatabase must be used inside DatabaseProvider'
        );
    }

    return context;
}