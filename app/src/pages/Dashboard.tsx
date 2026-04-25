import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import AQIGauge from '@/components/AQIGauge';
import HealthMeter from '@/components/HealthMeter';
import ForecastChart from '@/components/ForecastChart';
import LocationCard from '@/components/LocationCard';
import Recommendations from '@/components/Recommendations';
import { currentWeather } from '@/lib/mockData';
import apiService from '@/services/apiService';
import { useOnWeatherUpdate } from '@/hooks/use-weather-updates';
import { Cloud, Wind, Droplets, Eye, Sun, Tv, Search, MapPin, Loader, AlertCircle } from 'lucide-react';

interface WeatherLocation {
  location: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  weather_condition: string;
  feels_like?: number;
  description?: string;
  icon?: string;
  pressure?: number;
  visibility?: number;
  source?: string;
}

interface ForecastDay {
  forecast_date: string;
  max_temperature: number;
  min_temperature: number;
  weather_condition: string;
  humidity: number;
  wind_speed: number;
  precipitation_chance: number;
  description?: string;
}

const Dashboard: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Chennai');
  const [weatherData, setWeatherData] = useState<WeatherLocation | null>(null);
  const [forecastData, setForecastData] = useState<ForecastDay[]>([]);
  const [availableLocations] = useState<string[]>([
    'Chennai', 'Velachery', 'Anna Nagar', 'T. Nagar', 'Adyar', 'London', 'Paris', 'Tokyo', 'New York'
  ]);
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Refresh weather data when backend notifies of updates
  useOnWeatherUpdate(() => {
    console.log('[Dashboard] Refreshing weather data from backend update');
    // Re-fetch current weather and forecast
    const refreshWeatherAndForecast = async () => {
      try {
        const weatherResponse = await apiService.getCurrentWeather(selectedLocation);
        if (weatherResponse) {
          const data = Array.isArray(weatherResponse) ? weatherResponse[0] : weatherResponse;
          setWeatherData(data as WeatherLocation);
        }

        const forecastResponse = await apiService.getWeatherForecast(selectedLocation, 5);
        if (forecastResponse && Array.isArray(forecastResponse)) {
          setForecastData(forecastResponse);
        }
      } catch (error) {
        console.error('[Dashboard] Error refreshing weather:', error);
      }
    };
    refreshWeatherAndForecast();
  });

  // Fetch weather and forecast data when location changes
  useEffect(() => {
    const fetchWeatherAndForecast = async () => {
      setIsLoading(true);
      setErrorMessage('');
      try {
        // Fetch current weather
        const weatherResponse = await apiService.getCurrentWeather(selectedLocation);
        if (weatherResponse) {
          const data = Array.isArray(weatherResponse) ? weatherResponse[0] : weatherResponse;
          setWeatherData(data as WeatherLocation);
        } else {
          setErrorMessage(`Could not find weather data for ${selectedLocation}`);
          setWeatherData(null);
        }

        // Fetch forecast data
        try {
          const forecastResponse = await apiService.getWeatherForecast(selectedLocation, 5);
          if (forecastResponse && Array.isArray(forecastResponse)) {
            setForecastData(forecastResponse);
          } else {
            setForecastData([]);
          }
        } catch (forecastError) {
          console.warn('Forecast fetch error:', forecastError);
          setForecastData([]);
        }

        // Save selected location to localStorage for News page to use
        localStorage.setItem('lastSelectedLocation', selectedLocation);
      } catch (error) {
        console.error('Error fetching weather:', error);
        setErrorMessage(`Error fetching weather for ${selectedLocation}. Please try again.`);
        setWeatherData(null);
        setForecastData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeatherAndForecast();
  }, [selectedLocation]);

  // Handle search input with dynamic filtering
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setErrorMessage('');
    
    if (value.trim()) {
      // Filter from available locations first
      const filtered = availableLocations.filter(loc =>
        loc.toLowerCase().includes(value.toLowerCase())
      );
      
      // Always show filtered results, but also allow typing any city
      setFilteredLocations(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredLocations([]);
      setShowSuggestions(false);
    }
  };

  // Handle location selection from suggestions
  const handleSelectLocation = (location: string) => {
    setSelectedLocation(location);
    setSearchInput('');
    setShowSuggestions(false);
  };

  // Handle search by pressing Enter (allows searching ANY city)
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchInput.trim()) {
      // Search for the typed city (not just predefined ones)
      setSelectedLocation(searchInput.trim());
      setSearchInput('');
      setShowSuggestions(false);
    }
  };

  const displayWeather = weatherData || {
    location: selectedLocation,
    temperature: currentWeather.temperature,
    feels_like: currentWeather.feelsLike,
    humidity: currentWeather.humidity,
    wind_speed: currentWeather.windSpeed,
    weather_condition: 'Partly Cloudy',
  };

  return (
    <div className="max-w-7xl mx-auto w-full">
      {/* Header with Search */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display text-3xl lg:text-4xl font-bold mb-2">
          <span className="gradient-text">Weather</span> Dashboard
        </h1>
        <p className="text-muted-foreground">
          Real-time weather monitoring via SkyBreath
        </p>

        {/* City Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 relative"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search any city or district (e.g., London, Paris, Tokyo, Chennai...)"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => searchInput && setShowSuggestions(true)}
              className="w-full pl-12 pr-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
            {isLoading && (
              <Loader className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary animate-spin" />
            )}
            <div className="absolute right-4 bottom-1 text-xs text-muted-foreground">
              Press Enter to search
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-sm text-destructive"
            >
              <AlertCircle className="w-4 h-4" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {/* Search Suggestions */}
          <AnimatePresence>
            {showSuggestions && filteredLocations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-xl shadow-lg z-10 overflow-hidden"
              >
                {filteredLocations.map((location, index) => (
                  <motion.button
                    key={location}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSelectLocation(location)}
                    className="w-full px-4 py-3 text-left hover:bg-secondary/50 transition-colors flex items-center gap-2 border-b border-border/50 last:border-0"
                  >
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-foreground">{location}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Available Quick Locations */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 flex flex-wrap gap-2"
        >
          <span className="text-xs text-muted-foreground">Quick access:</span>
          {['Chennai', 'Velachery', 'Anna Nagar', 'London', 'Paris', 'Tokyo'].map((location) => (
            <motion.button
              key={location}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelectLocation(location)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedLocation === location
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary/50 text-muted-foreground hover:bg-secondary border border-border'
              }`}
            >
              {location}
            </motion.button>
          ))}
        </motion.div>

        {/* Current Selected Location */}
        {selectedLocation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 flex items-center gap-2 text-sm"
          >
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-foreground">
              Currently viewing: <span className="font-bold text-primary">{selectedLocation}</span>
            </span>
            {weatherData?.source && (
              <span className="text-xs text-muted-foreground ml-2">
                (Data from {weatherData.source === 'openweathermap' ? 'OpenWeatherMap' : 'Database'})
              </span>
            )}
          </motion.div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weather Metrics */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Cloud className="w-5 h-5 text-primary" />
              <h2 className="font-display text-lg font-bold text-foreground">
                Current Conditions - {selectedLocation}
              </h2>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
                <AQIGauge
                  value={displayWeather.temperature || currentWeather.temperature}
                  max={50}
                  label="Temperature"
                  unit="°C"
                  color="primary"
                  size="md"
                />
                <AQIGauge
                  value={displayWeather.feels_like !== undefined && displayWeather.feels_like !== null ? displayWeather.feels_like : displayWeather.temperature}
                  max={50}
                  label="Feels Like"
                  unit="°C"
                  color="primary"
                  size="md"
                />
                <AQIGauge
                  value={displayWeather.humidity || currentWeather.humidity}
                  max={100}
                  label="Humidity"
                  unit="%"
                  color="primary"
                  size="md"
                />
                <AQIGauge
                  value={displayWeather.wind_speed || currentWeather.windSpeed}
                  max={40}
                  label="Wind Speed"
                  unit="km/h"
                  color="primary"
                  size="md"
                />
                <AQIGauge
                  value={displayWeather.pressure ? (displayWeather.pressure / 100).toFixed(1) : 0}
                  max={12}
                  label="Pressure"
                  unit="mb"
                  color="primary"
                  size="md"
                />
              </div>
            )}
          </motion.div>

          {/* Health Meter */}
          <HealthMeter aqi={displayWeather.temperature} />

          {/* Forecast Chart */}
          {forecastData.length > 0 ? (
            <ForecastChart forecastData={forecastData} location={selectedLocation} />
          ) : (
            <div className="glass-card rounded-2xl p-6 text-center text-muted-foreground">
              Loading forecast data...
            </div>
          )}

          {/* News Section Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/news" className="block">
              <div className="glass-card rounded-2xl p-6 group hover:neon-glow transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Tv className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground group-hover:gradient-text transition-all">
                      Live News
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Watch live news channels
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Right Column - Side Panels */}
        <div className="space-y-6">
          <LocationCard location={selectedLocation} weatherData={weatherData} />
          <Recommendations weatherData={weatherData} />
          
          {/* Additional Weather Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sun className="w-5 h-5 text-primary" />
              <h3 className="font-display text-lg font-bold text-foreground">
                Details
              </h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Precipitation</span>
                </div>
                <span className="font-display font-bold text-primary">{forecastData[0]?.precipitation_chance || 0}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Visibility</span>
                </div>
                <span className="font-display font-bold text-primary">{displayWeather.visibility?.toFixed(1) || 10} km</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Wind Direction</span>
                </div>
                <span className="font-display font-bold text-primary">Variable</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-xl">
                <span className="text-sm text-muted-foreground">Pressure</span>
                <span className="font-display font-bold text-primary">{displayWeather.pressure?.toFixed(0) || '--'} hPa</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-xl">
                <span className="text-sm text-muted-foreground">Condition</span>
                <span className="font-display font-bold text-primary">{displayWeather.weather_condition || 'N/A'}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
