import { useState, useEffect } from 'react';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { ClientStorage } from '@/lib/storage';

interface UsePersistentDataOptions<T> extends Omit<UseQueryOptions<T[], Error, T[], string[]>, 'queryKey' | 'queryFn'> {
  queryKey: string[];
  storageKey: string;
  ttl?: number;
  onError?: (error: Error) => void;
}

export function usePersistentData<T>({
  queryKey,
  storageKey,
  ttl = 5 * 60 * 1000, // 5 minutes default
  onError,
  ...queryOptions
}: UsePersistentDataOptions<T>) {
  const [localData, setLocalData] = useState<T[]>([]);

  // Load cached data on mount
  useEffect(() => {
    const cachedData = ClientStorage.getItem<T[]>(storageKey, ttl);
    if (cachedData && Array.isArray(cachedData)) {
      setLocalData(cachedData);
    }
  }, [storageKey, ttl]);

  // Cache data function
  const cacheData = (data: T[]) => {
    ClientStorage.setItem(storageKey, data, ttl);
  };

  const query = useQuery({
    queryKey,
    initialData: localData,
    staleTime: ttl,
    gcTime: ttl * 2, // Keep in memory twice as long as TTL
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    ...queryOptions,
  });

  // Handle successful data fetch
  useEffect(() => {
    if (query.data && Array.isArray(query.data)) {
      setLocalData(query.data);
      cacheData(query.data);
    }
  }, [query.data, storageKey, ttl]);

  // Handle error
  useEffect(() => {
    if (query.error) {
      console.error(`Failed to fetch data for ${storageKey}:`, query.error);
      onError?.(query.error);
    }
  }, [query.error, storageKey, onError]);

  // Update local cache when data changes
  const updateLocalCache = (updater: (data: T[]) => T[]) => {
    const updatedData = updater(localData);
    setLocalData(updatedData);
    cacheData(updatedData);
  };

  // Add item to cache
  const addToCache = (item: T) => {
    updateLocalCache(data => [...data, item]);
  };

  // Update item in cache
  const updateInCache = (id: number, updates: Partial<T>) => {
    updateLocalCache(data => 
      data.map(item => 
        (item as any).id === id ? { ...item, ...updates } : item
      )
    );
  };

  // Remove item from cache
  const removeFromCache = (id: number) => {
    updateLocalCache(data => 
      data.filter(item => (item as any).id !== id)
    );
  };

  // Clear cache
  const clearCache = () => {
    ClientStorage.removeItem(storageKey);
    setLocalData([]);
  };

  return {
    ...query,
    data: query.data || localData,
    localData,
    updateLocalCache,
    addToCache,
    updateInCache,
    removeFromCache,
    clearCache,
  };
}

// Specific hooks for different data types
export function useQaSamples() {
  return usePersistentData({
    queryKey: ['/api/qa-samples'],
    storageKey: 'qa-samples-cache',
  });
}

export function useChemicals() {
  return usePersistentData({
    queryKey: ['/api/chemicals'],
    storageKey: 'chemicals-cache',
  });
}

export function useTools() {
  return usePersistentData({
    queryKey: ['/api/tools'],
    storageKey: 'tools-cache',
  });
}

export function useGlassware() {
  return usePersistentData({
    queryKey: ['/api/glassware'],
    storageKey: 'glassware-cache',
  });
}

export function useDocuments() {
  return usePersistentData({
    queryKey: ['/api/documents'],
    storageKey: 'documents-cache',
  });
}

export function useTraining() {
  return usePersistentData({
    queryKey: ['/api/training'],
    storageKey: 'training-cache',
  });
}

export function useMsds() {
  return usePersistentData({
    queryKey: ['/api/msds'],
    storageKey: 'msds-cache',
  });
}

export function useTasks() {
  return usePersistentData({
    queryKey: ['/api/tasks'],
    storageKey: 'tasks-cache',
  });
}

export function useDashboardStats() {
  return usePersistentData({
    queryKey: ['/api/dashboard-stats'],
    storageKey: 'dashboard-stats-cache',
    ttl: 2 * 60 * 1000, // 2 minutes for dashboard stats
  });
} 