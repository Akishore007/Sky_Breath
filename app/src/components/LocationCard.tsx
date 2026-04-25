import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Thermometer, Droplets, Clock } from 'lucide-react';
import { currentWeather } from '@/lib/mockData';

interface WeatherLocation {
  location: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  weather_condition: string;
  feels_like?: number;
}

interface LocationCardProps {
  location?: string;
  weatherData?: WeatherLocation | null;
}

const LocationCard: React.FC<LocationCardProps> = ({ location, weatherData }) => {
  const formatTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Use weatherData if available, otherwise fallback to mock data
  const displayData = weatherData || currentWeather;
  const displayLocation = weatherData?.location || location || currentWeather.location;
  const displayTemp = weatherData?.temperature || currentWeather.temperature;
  const displayHumidity = weatherData?.humidity || currentWeather.humidity;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/20 rounded-lg">
          <MapPin className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-bold text-foreground">{displayLocation}</h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Last updated: {formatTime()}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-xl">
          <Thermometer className="w-5 h-5 text-warning" />
          <div>
            <p className="text-xs text-muted-foreground">Temperature</p>
            <p className="font-display font-bold text-foreground">{displayTemp}°C</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-xl">
          <Droplets className="w-5 h-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Humidity</p>
            <p className="font-display font-bold text-foreground">{displayHumidity}%</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LocationCard;
