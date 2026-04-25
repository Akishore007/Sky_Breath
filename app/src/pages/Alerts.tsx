import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  X,
  Sliders,
  Settings,
  Loader,
  Search,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useOnWeatherUpdate } from "@/hooks/use-weather-updates";
import { Button } from "@/components/ui/button";
import apiService from "@/services/apiService";

interface Alert {
  id: number;
  title: string;
  message: string;
  severity: "info" | "warning" | "critical";
  alert_type: string;
  location: string;
  is_read: boolean;
  timestamp: string;
}

interface WeatherLocation {
  location: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  weather_condition: string;
  feels_like?: number;
  description?: string;
  pressure?: number;
  visibility?: number;
  source?: string;
}

export default function Alerts() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [searchInput, setSearchInput] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Chennai');
  const [weatherData, setWeatherData] = useState<WeatherLocation | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [generatedAlerts, setGeneratedAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [availableLocations] = useState<string[]>([
    'Chennai', 'London', 'Paris', 'Tokyo', 'New York', 'Sydney', 'Toronto', 'Dubai'
  ]);
  const [thresholds, setThresholds] = useState({
    temperature: user?.temperature_threshold || 35,
    humidity: user?.humidity_threshold || 80,
    windSpeed: user?.wind_speed_threshold || 40,
  });

  // Refresh alerts when weather updates from backend
  useOnWeatherUpdate(() => {
    console.log('[Alerts] Refreshing alerts from backend update');
    const refreshAlerts = async () => {
      try {
        const weatherResponse = await apiService.getCurrentWeather(selectedLocation);
        if (weatherResponse) {
          const data = Array.isArray(weatherResponse) ? weatherResponse[0] : weatherResponse;
          setWeatherData(data as WeatherLocation);
          generateAlerts(data as WeatherLocation);
        }
      } catch (error) {
        console.error('[Alerts] Error refreshing alerts:', error);
      }
    };
    refreshAlerts();
  });

  // Initialize with last selected location
  useEffect(() => {
    const lastLocation = localStorage.getItem('lastSelectedLocation');
    if (lastLocation) {
      setSelectedLocation(lastLocation);
    }
  }, []);

  // Fetch weather data and generate alerts
  useEffect(() => {
    const fetchWeatherAndGenerateAlerts = async () => {
      setIsLoading(true);
      setErrorMessage('');
      
      try {
        const weatherResponse = await apiService.getCurrentWeather(selectedLocation);
        if (weatherResponse) {
          const data = Array.isArray(weatherResponse) ? weatherResponse[0] : weatherResponse;
          setWeatherData(data as WeatherLocation);

          // Generate alerts based on weather thresholds
          const newAlerts = generateAlerts(data as WeatherLocation, selectedLocation);
          setGeneratedAlerts(newAlerts);
        } else {
          setErrorMessage(`Could not find weather data for ${selectedLocation}`);
          setWeatherData(null);
          setGeneratedAlerts([]);
        }

        // Save selected location
        localStorage.setItem('lastSelectedLocation', selectedLocation);
      } catch (error) {
        console.error('Error fetching weather:', error);
        setErrorMessage(`Error fetching weather for ${selectedLocation}`);
        setWeatherData(null);
        setGeneratedAlerts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeatherAndGenerateAlerts();
  }, [selectedLocation, thresholds]);

  // Generate alerts based on weather data and thresholds
  const generateAlerts = (weather: WeatherLocation, location: string): Alert[] => {
    const alerts: Alert[] = [];
    let alertId = 1;

    // Temperature alert
    if (weather.temperature > thresholds.temperature) {
      alerts.push({
        id: alertId++,
        title: 'High Temperature Alert',
        message: `Temperature is ${Math.round(weather.temperature)}°C, exceeding your threshold of ${thresholds.temperature}°C`,
        severity: weather.temperature > thresholds.temperature + 5 ? 'critical' : 'warning',
        alert_type: 'temperature',
        location: location,
        is_read: false,
        timestamp: new Date().toISOString(),
      });
    }

    // Humidity alert
    if (weather.humidity > thresholds.humidity) {
      alerts.push({
        id: alertId++,
        title: 'High Humidity Alert',
        message: `Humidity is ${weather.humidity}%, exceeding your threshold of ${thresholds.humidity}%`,
        severity: weather.humidity > thresholds.humidity + 10 ? 'critical' : 'warning',
        alert_type: 'humidity',
        location: location,
        is_read: false,
        timestamp: new Date().toISOString(),
      });
    }

    // Wind speed alert
    if (weather.wind_speed > thresholds.windSpeed) {
      alerts.push({
        id: alertId++,
        title: 'High Wind Speed Alert',
        message: `Wind speed is ${weather.wind_speed} km/h, exceeding your threshold of ${thresholds.windSpeed} km/h`,
        severity: weather.wind_speed > thresholds.windSpeed + 10 ? 'critical' : 'warning',
        alert_type: 'wind_speed',
        location: location,
        is_read: false,
        timestamp: new Date().toISOString(),
      });
    }

    // Weather condition alerts
    const condition = weather.weather_condition.toLowerCase();
    if (condition.includes('rain') || condition.includes('storm')) {
      alerts.push({
        id: alertId++,
        title: 'Rainfall Alert',
        message: `${weather.weather_condition} conditions detected in ${location}`,
        severity: condition.includes('storm') ? 'critical' : 'warning',
        alert_type: 'weather_condition',
        location: location,
        is_read: false,
        timestamp: new Date().toISOString(),
      });
    }

    // General info alert
    if (alerts.length === 0) {
      alerts.push({
        id: alertId++,
        title: 'Weather Status Normal',
        message: `All weather parameters are within your set thresholds in ${location}`,
        severity: 'info',
        alert_type: 'general',
        location: location,
        is_read: false,
        timestamp: new Date().toISOString(),
      });
    }

    return alerts;
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return AlertTriangle;
      case "warning":
        return Info;
      case "info":
        return CheckCircle;
      default:
        return Bell;
    }
  };

  const getAlertColors = (severity: string) => {
    switch (severity) {
      case "critical":
        return {
          bg: "bg-red-50 dark:bg-red-950",
          border: "border-red-200 dark:border-red-800",
          icon: "text-red-600 dark:text-red-400",
          badge: "bg-red-600 text-white",
        };
      case "warning":
        return {
          bg: "bg-yellow-50 dark:bg-yellow-950",
          border: "border-yellow-200 dark:border-yellow-800",
          icon: "text-yellow-600 dark:text-yellow-400",
          badge: "bg-yellow-600 text-white",
        };
      case "info":
        return {
          bg: "bg-green-50 dark:bg-green-950",
          border: "border-green-200 dark:border-green-800",
          icon: "text-green-600 dark:text-green-400",
          badge: "bg-green-600 text-white",
        };
      default:
        return {
          bg: "bg-gray-50 dark:bg-gray-900",
          border: "border-gray-200 dark:border-gray-800",
          icon: "text-gray-600 dark:text-gray-400",
          badge: "bg-gray-600 text-white",
        };
    }
  };

  const markAsRead = async (id: number) => {
    setGeneratedAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, is_read: true } : alert
      )
    );
  };

  const dismissAlert = async (id: number) => {
    setGeneratedAlerts((prev) => prev.filter((alert) => alert.id !== id));
    toast({
      title: "Alert dismissed",
      description: "Alert removed successfully",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setErrorMessage('');
    
    if (value.trim()) {
      const filtered = availableLocations.filter(loc =>
        loc.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredLocations(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredLocations([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectLocation = (location: string) => {
    setSelectedLocation(location);
    setSearchInput('');
    setShowSuggestions(false);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchInput.trim()) {
      setSelectedLocation(searchInput.trim());
      setSearchInput('');
      setShowSuggestions(false);
    }
  };

  const saveThresholds = async () => {
    try {
      await updateProfile({
        temperature_threshold: thresholds.temperature,
        humidity_threshold: thresholds.humidity,
        wind_speed_threshold: thresholds.windSpeed,
      });
      setShowSettings(false);
      toast({
        title: "Thresholds updated",
        description: "Your weather alert settings have been saved.",
      });
    } catch (error) {
      console.error("Failed to save thresholds:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    }
  };

  const unreadCount = generatedAlerts.filter((a) => !a.is_read).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header with Search */}
      <div className="space-y-4">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Weather Alerts</h1>
            <p className="text-muted-foreground mt-2">
              Stay informed about weather changes in {selectedLocation}
            </p>
          </div>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>

        {/* Location Search */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search city for alerts..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full pl-10 pr-4 py-2 bg-secondary border border-primary/30 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput('');
                  setShowSuggestions(false);
                }}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            )}
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && (
            <div className="absolute z-10 w-full mt-2 bg-secondary border border-primary/30 rounded-lg shadow-lg">
              {filteredLocations.length > 0 ? (
                filteredLocations.map((location, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectLocation(location)}
                    className="w-full text-left px-4 py-2 hover:bg-primary/10 border-b border-primary/10 last:border-b-0 transition-colors"
                  >
                    <MapPin className="inline mr-2 h-4 w-4 text-primary" />
                    {location}
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-muted-foreground text-sm">
                  Press Enter to search "{searchInput}" globally
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Error Message */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400"
          >
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">{errorMessage}</span>
          </motion.div>
        )}
      </div>

      {showSettings && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6"
        >
          <h3 className="font-semibold mb-4 flex items-center">
            <Sliders className="mr-2 h-4 w-4" />
            Your weather alert thresholds for {selectedLocation}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                Temperature Threshold: {thresholds.temperature}°C
              </label>
              <input
                type="range"
                min="25"
                max="50"
                value={thresholds.temperature}
                onChange={(e) =>
                  setThresholds({
                    ...thresholds,
                    temperature: parseInt(e.target.value),
                  })
                }
                className="w-full mt-2"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Current: <span className="font-semibold">{weatherData?.temperature}°C</span>
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">
                Humidity Threshold: {thresholds.humidity}%
              </label>
              <input
                type="range"
                min="30"
                max="100"
                value={thresholds.humidity}
                onChange={(e) =>
                  setThresholds({
                    ...thresholds,
                    humidity: parseInt(e.target.value),
                  })
                }
                className="w-full mt-2"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Current: <span className="font-semibold">{weatherData?.humidity}%</span>
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">
                Wind Speed Threshold: {thresholds.windSpeed} km/h
              </label>
              <input
                type="range"
                min="10"
                max="80"
                value={thresholds.windSpeed}
                onChange={(e) =>
                  setThresholds({
                    ...thresholds,
                    windSpeed: parseInt(e.target.value),
                  })
                }
                className="w-full mt-2"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Current: <span className="font-semibold">{weatherData?.wind_speed} km/h</span>
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={saveThresholds} size="sm">
              Save Changes
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(false)}
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading alerts for {selectedLocation}...</p>
          </div>
        </div>
      ) : (
        <>
          {generatedAlerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg"
            >
              <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                No active alerts
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                You''re all caught up! No weather alerts at the moment for {selectedLocation}.
              </p>
            </motion.div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {unreadCount} unread alert{unreadCount !== 1 ? "s" : ""} • Showing alerts for {selectedLocation}
              </p>
              <AnimatePresence>
                {generatedAlerts.map((alert, index) => {
                  const IconComponent = getAlertIcon(alert.severity);
                  const colors = getAlertColors(alert.severity);

                  return (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                      className={`border rounded-lg p-4 mb-3 ${colors.bg} ${colors.border}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div
                            className={`p-2 rounded-lg flex-shrink-0 ${colors.icon}`}
                          >
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{alert.title}</h4>
                              <span className={`text-xs px-2 py-1 rounded ${colors.badge}`}>
                                {alert.severity.toUpperCase()}
                              </span>
                              {!alert.is_read && (
                                <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {alert.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                              {alert.location}  {formatTime(alert.timestamp)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {!alert.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(alert.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => dismissAlert(alert.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
