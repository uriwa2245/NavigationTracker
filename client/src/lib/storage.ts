// Client-side storage utilities for data persistence

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  version?: string;
}

export class ClientStorage {
  private static readonly CACHE_VERSION = '1.0.0';
  private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Save data to localStorage with timestamp
   */
  static setItem<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        version: this.CACHE_VERSION
      };
      localStorage.setItem(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn(`Failed to save data to localStorage for key: ${key}`, error);
    }
  }

  /**
   * Get data from localStorage with TTL check
   */
  static getItem<T>(key: string, ttl: number = this.DEFAULT_TTL): T | null {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const cacheItem: CacheItem<T> = JSON.parse(cached);
      const now = Date.now();
      const age = now - cacheItem.timestamp;

      // Check if cache is still valid
      if (age > ttl) {
        localStorage.removeItem(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.warn(`Failed to get data from localStorage for key: ${key}`, error);
      return null;
    }
  }

  /**
   * Remove item from localStorage
   */
  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove item from localStorage for key: ${key}`, error);
    }
  }

  /**
   * Clear all cached data
   */
  static clearCache(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes('-cache') || key.includes('-last-update')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { totalItems: number; totalSize: number } {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => 
        key.includes('-cache') || key.includes('-last-update')
      );
      
      let totalSize = 0;
      cacheKeys.forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          totalSize += new Blob([item]).size;
        }
      });

      return {
        totalItems: cacheKeys.length,
        totalSize
      };
    } catch (error) {
      console.warn('Failed to get cache stats:', error);
      return { totalItems: 0, totalSize: 0 };
    }
  }
}

// Specific storage keys for different data types
export const STORAGE_KEYS = {
  QA_SAMPLES: 'qa-samples-cache',
  QA_SAMPLES_LAST_UPDATE: 'qa-samples-last-update',
  CHEMICALS: 'chemicals-cache',
  CHEMICALS_LAST_UPDATE: 'chemicals-last-update',
  TOOLS: 'tools-cache',
  TOOLS_LAST_UPDATE: 'tools-last-update',
  GLASSWARE: 'glassware-cache',
  GLASSWARE_LAST_UPDATE: 'glassware-last-update',
  DOCUMENTS: 'documents-cache',
  DOCUMENTS_LAST_UPDATE: 'documents-last-update',
  TRAINING: 'training-cache',
  TRAINING_LAST_UPDATE: 'training-last-update',
  MSDS: 'msds-cache',
  MSDS_LAST_UPDATE: 'msds-last-update',
  TASKS: 'tasks-cache',
  TASKS_LAST_UPDATE: 'tasks-last-update',
  DASHBOARD_STATS: 'dashboard-stats-cache',
  DASHBOARD_STATS_LAST_UPDATE: 'dashboard-stats-last-update',
} as const;

// Utility functions for specific data types
export const QaSampleStorage = {
  save: (data: any[]) => ClientStorage.setItem(STORAGE_KEYS.QA_SAMPLES, data),
  load: () => ClientStorage.getItem(STORAGE_KEYS.QA_SAMPLES),
  clear: () => ClientStorage.removeItem(STORAGE_KEYS.QA_SAMPLES),
};

export const ChemicalStorage = {
  save: (data: any[]) => ClientStorage.setItem(STORAGE_KEYS.CHEMICALS, data),
  load: () => ClientStorage.getItem(STORAGE_KEYS.CHEMICALS),
  clear: () => ClientStorage.removeItem(STORAGE_KEYS.CHEMICALS),
};

export const ToolStorage = {
  save: (data: any[]) => ClientStorage.setItem(STORAGE_KEYS.TOOLS, data),
  load: () => ClientStorage.getItem(STORAGE_KEYS.TOOLS),
  clear: () => ClientStorage.removeItem(STORAGE_KEYS.TOOLS),
};

export const GlasswareStorage = {
  save: (data: any[]) => ClientStorage.setItem(STORAGE_KEYS.GLASSWARE, data),
  load: () => ClientStorage.getItem(STORAGE_KEYS.GLASSWARE),
  clear: () => ClientStorage.removeItem(STORAGE_KEYS.GLASSWARE),
};

export const DocumentStorage = {
  save: (data: any[]) => ClientStorage.setItem(STORAGE_KEYS.DOCUMENTS, data),
  load: () => ClientStorage.getItem(STORAGE_KEYS.DOCUMENTS),
  clear: () => ClientStorage.removeItem(STORAGE_KEYS.DOCUMENTS),
};

export const TrainingStorage = {
  save: (data: any[]) => ClientStorage.setItem(STORAGE_KEYS.TRAINING, data),
  load: () => ClientStorage.getItem(STORAGE_KEYS.TRAINING),
  clear: () => ClientStorage.removeItem(STORAGE_KEYS.TRAINING),
};

export const MsdsStorage = {
  save: (data: any[]) => ClientStorage.setItem(STORAGE_KEYS.MSDS, data),
  load: () => ClientStorage.getItem(STORAGE_KEYS.MSDS),
  clear: () => ClientStorage.removeItem(STORAGE_KEYS.MSDS),
};

export const TaskStorage = {
  save: (data: any[]) => ClientStorage.setItem(STORAGE_KEYS.TASKS, data),
  load: () => ClientStorage.getItem(STORAGE_KEYS.TASKS),
  clear: () => ClientStorage.removeItem(STORAGE_KEYS.TASKS),
};

export const DashboardStorage = {
  save: (data: any) => ClientStorage.setItem(STORAGE_KEYS.DASHBOARD_STATS, data),
  load: () => ClientStorage.getItem(STORAGE_KEYS.DASHBOARD_STATS),
  clear: () => ClientStorage.removeItem(STORAGE_KEYS.DASHBOARD_STATS),
}; 