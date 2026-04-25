import { useEffect, useState, useCallback, useRef } from 'react';
import apiService from '@/services/apiService';

interface UpdateStatus {
  last_update: string | null;
  current_time: string;
  status: 'updating' | 'pending';
}

// Event emitter for cross-component updates
class WeatherUpdateEmitter {
  private listeners: Set<(data: UpdateStatus) => void> = new Set();

  subscribe(callback: (data: UpdateStatus) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  emit(data: UpdateStatus) {
    this.listeners.forEach(callback => callback(data));
  }
}

export const weatherUpdateEmitter = new WeatherUpdateEmitter();

/**
 * Hook for handling periodic weather data updates every 10 minutes
 * Triggers refetch across all pages when new data is available
 */
export function useWeatherUpdates() {
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'checking' | 'updated'>('idle');
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckedRef = useRef<string | null>(null);

  // Check for weather updates
  const checkForUpdates = useCallback(async () => {
    try {
      setUpdateStatus('checking');
      const status = await apiService.getWeatherUpdateStatus();
      
      if (status.last_update) {
        // If this is a new update (different from last time we checked)
        if (lastCheckedRef.current !== status.last_update) {
          setLastUpdate(status.last_update);
          lastCheckedRef.current = status.last_update;
          
          // Emit event to all listeners (all pages)
          weatherUpdateEmitter.emit(status);
          
          // Store in localStorage for cross-tab communication
          localStorage.setItem('weather_update_timestamp', status.last_update);
          
          setUpdateStatus('updated');
          console.log('[Weather Updates] New data available at', status.last_update);
        }
      }
    } catch (error) {
      console.error('[Weather Updates] Failed to check for updates:', error);
    } finally {
      setUpdateStatus('idle');
    }
  }, []);

  // Initialize polling
  useEffect(() => {
    // Check immediately on mount
    checkForUpdates();

    // Set up 10-minute interval (600000 milliseconds)
    pollingIntervalRef.current = setInterval(() => {
      checkForUpdates();
    }, 600000); // 10 minutes

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [checkForUpdates]);

  // Listen for storage changes (cross-tab updates)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'weather_update_timestamp' && e.newValue) {
        console.log('[Weather Updates] Update detected from another tab');
        checkForUpdates();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkForUpdates]);

  return {
    lastUpdate,
    updateStatus,
    checkForUpdates,
    subscribe: (callback: (data: UpdateStatus) => void) => weatherUpdateEmitter.subscribe(callback),
  };
}

/**
 * Hook to listen for weather updates on any page
 * This triggers a callback when weather data is refreshed
 */
export function useOnWeatherUpdate(callback: (data: UpdateStatus) => void) {
  useEffect(() => {
    const unsubscribe = weatherUpdateEmitter.subscribe(callback);
    return unsubscribe;
  }, [callback]);
}
