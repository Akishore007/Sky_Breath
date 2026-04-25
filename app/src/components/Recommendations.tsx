import React from 'react';
import { motion } from 'framer-motion';
import { getWeatherRecommendations } from '@/lib/mockData';
import { Check, AlertCircle } from 'lucide-react';

interface WeatherLocation {
  location: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  weather_condition: string;
  feels_like?: number;
}

interface RecommendationsProps {
  weatherData?: WeatherLocation | null;
  aqi?: number;
}

const Recommendations: React.FC<RecommendationsProps> = ({ weatherData, aqi = 28 }) => {
  // Use weatherData if available, otherwise use fallback
  const temp = weatherData?.temperature || aqi;
  const condition = weatherData?.weather_condition || 'Partly Cloudy';
  const humidity = weatherData?.humidity || 72;
  
  const recommendations = getWeatherRecommendations(temp, condition, humidity);
  const isGoodWeather = temp <= 28;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card rounded-2xl p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        {isGoodWeather ? (
          <Check className="w-5 h-5 text-success" />
        ) : (
          <AlertCircle className="w-5 h-5 text-warning" />
        )}
        <h3 className="font-display text-lg font-bold text-foreground">
          Recommendations
        </h3>
      </div>
      
      <ul className="space-y-3">
        {recommendations.map((rec, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            className="flex items-start gap-3 p-3 bg-secondary/50 rounded-xl"
          >
            <span className={`
              w-2 h-2 rounded-full mt-2 flex-shrink-0
              ${isGoodWeather ? 'bg-success' : 'bg-warning'}
            `} />
            <span className="text-sm text-foreground">{rec}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
};

export default Recommendations;
