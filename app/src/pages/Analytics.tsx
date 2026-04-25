import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Cloud, Droplets, Wind, Calendar, Download, Search, MapPin, Loader, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useOnWeatherUpdate } from "@/hooks/use-weather-updates";
import apiService from "@/services/apiService";

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

interface ForecastDay {
  forecast_date: string;
  max_temperature: number;
  min_temperature: number;
  weather_condition: string;
  humidity: number;
  wind_speed: number;
  precipitation_chance: number;
}

export default function Analytics() {
  const { toast } = useToast();
  const [searchInput, setSearchInput] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Chennai');
  const [weatherData, setWeatherData] = useState<WeatherLocation | null>(null);
  const [forecastData, setForecastData] = useState<ForecastDay[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [availableLocations] = useState<string[]>([
    'Chennai', 'London', 'Paris', 'Tokyo', 'New York', 'Sydney', 'Toronto', 'Dubai'
  ]);

  // Refresh analytics when weather updates from backend
  useOnWeatherUpdate(() => {
    console.log('[Analytics] Refreshing analytics data from backend update');
    const refreshAnalytics = async () => {
      try {
        const weatherResponse = await apiService.getCurrentWeather(selectedLocation);
        if (weatherResponse) {
          const data = Array.isArray(weatherResponse) ? weatherResponse[0] : weatherResponse;
          setWeatherData(data as WeatherLocation);
        }

        const forecastResponse = await apiService.getWeatherForecast(selectedLocation, 7);
        if (forecastResponse && Array.isArray(forecastResponse)) {
          setForecastData(forecastResponse);
        }
      } catch (error) {
        console.error('[Analytics] Error refreshing data:', error);
      }
    };
    refreshAnalytics();
  });

  // Fetch weather data for selected location
  useEffect(() => {
    const fetchWeatherAndAnalytics = async () => {
      setIsLoading(true);
      setErrorMessage('');
      
      try {
        const weatherResponse = await apiService.getCurrentWeather(selectedLocation);
        if (weatherResponse) {
          const data = Array.isArray(weatherResponse) ? weatherResponse[0] : weatherResponse;
          setWeatherData(data as WeatherLocation);
        } else {
          setErrorMessage(`Could not find analytics data for ${selectedLocation}`);
          setWeatherData(null);
        }

        // Fetch forecast data for 7-day trends
        try {
          const forecastResponse = await apiService.getWeatherForecast(selectedLocation, 7);
          if (forecastResponse && Array.isArray(forecastResponse)) {
            setForecastData(forecastResponse);
          } else {
            setForecastData([]);
          }
        } catch (forecastError) {
          console.warn('Forecast fetch error:', forecastError);
          setForecastData([]);
        }

        // Save selected location
        localStorage.setItem('lastSelectedLocation', selectedLocation);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setErrorMessage(`Error fetching analytics for ${selectedLocation}. Please try again.`);
        setWeatherData(null);
        setForecastData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeatherAndAnalytics();
  }, [selectedLocation]);

  // Initialize with last selected location
  useEffect(() => {
    const lastLocation = localStorage.getItem('lastSelectedLocation');
    if (lastLocation) {
      setSelectedLocation(lastLocation);
    }
  }, []);

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

  const handleDownloadReport = () => {
    toast({
      title: "Report Generated",
      description: `Weather analytics report for ${selectedLocation} downloaded successfully`,
    });
  };

  // Calculate analytics from weather data
  const calculateAnalytics = () => {
    if (!weatherData && !forecastData.length) {
      return {
        avg_temp: 0,
        avg_humidity: 0,
        avg_wind: 0,
        observations: 0,
      };
    }

    let totalTemp = weatherData?.temperature || 0;
    let totalHumidity = weatherData?.humidity || 0;
    let totalWind = weatherData?.wind_speed || 0;
    let count = 1;

    forecastData.forEach(day => {
      totalTemp += (day.max_temperature + day.min_temperature) / 2;
      totalHumidity += day.humidity;
      totalWind += day.wind_speed;
      count++;
    });

    return {
      avg_temp: Math.round(totalTemp / count),
      avg_humidity: Math.round(totalHumidity / count),
      avg_wind: Math.round(totalWind / count),
      observations: count,
    };
  };

  const analytics = calculateAnalytics();

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
            <h1 className="text-3xl font-bold">Weather Analytics</h1>
            <p className="text-muted-foreground mt-2">
              Track weather patterns and climate insights for {selectedLocation}
            </p>
          </div>
          <Button onClick={handleDownloadReport} variant="outline" size="lg">
            <Download className="mr-2 h-4 w-4" />
            Download Report
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
              placeholder="Search city for analytics..."
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

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading analytics for {selectedLocation}...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Avg Temperature
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.avg_temp}°C</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <TrendingUp className="inline mr-1 h-3 w-3" />
                    {analytics.observations} observations
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Avg Humidity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.avg_humidity}%</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <Droplets className="inline mr-1 h-3 w-3" />
                    {analytics.avg_humidity > 70 ? 'High' : analytics.avg_humidity > 40 ? 'Moderate' : 'Low'} levels
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Avg Wind Speed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.avg_wind} km/h</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <Wind className="inline mr-1 h-3 w-3" />
                    {analytics.avg_wind > 20 ? 'Strong' : analytics.avg_wind > 10 ? 'Light' : 'Calm'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Data Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.observations}</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <Calendar className="inline mr-1 h-3 w-3" />
                    Days analyzed
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Trends Section */}
          <Card>
            <CardHeader>
              <CardTitle>Weather Trends (7-Day Forecast)</CardTitle>
              <CardDescription>
                Detailed weather metrics for the next week in {selectedLocation}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {forecastData && forecastData.length > 0 ? (
                <div className="space-y-4">
                  {forecastData.slice(0, 7).map((day, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="grid grid-cols-5 gap-4 p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                        <p className="font-semibold">{new Date(day.forecast_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Temperature</p>
                        <p className="font-semibold">{Math.round((day.max_temperature + day.min_temperature) / 2)}°C</p>
                        <p className="text-xs text-muted-foreground">↑ {Math.round(day.max_temperature)}° ↓ {Math.round(day.min_temperature)}°</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Humidity</p>
                        <p className="font-semibold">{day.humidity}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Wind Speed</p>
                        <p className="font-semibold">{day.wind_speed} km/h</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Condition</p>
                        <p className="font-semibold text-sm">{day.weather_condition}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No forecast data available for {selectedLocation}</p>
              )}
            </CardContent>
          </Card>

          {/* Pro Tip */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg p-6 text-white"
          >
            <div className="flex items-start gap-3">
              <Cloud className="h-6 w-6 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-lg">Pro Tip</p>
                <p className="text-sm mt-2 opacity-90">
                  Monitor weather patterns regularly to plan outdoor activities. The 7-day forecast helps you prepare for seasonal changes in {selectedLocation}.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}    </motion.div>
  );
}