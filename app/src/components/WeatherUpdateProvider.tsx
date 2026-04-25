import React from 'react';
import { useWeatherUpdates } from '@/hooks/use-weather-updates';

/**
 * Provider component that manages periodic weather updates
 * Polls the backend every 10 minutes and notifies all pages when new data is available
 */
const WeatherUpdateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize the polling mechanism
  useWeatherUpdates();

  return <>{children}</>;
};

export default WeatherUpdateProvider;
