// Chennai Weather Mock Data
export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  pressure: number;
  visibility: number;
  uvIndex: number;
  precipitation: number;
  condition: string;
  cloudCover: number;
  sunrise: string;
  sunset: string;
  timestamp: Date;
  location: string;
}

export interface Hotspot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  temperature: number;
  condition: string;
}

export interface ForecastData {
  day: string;
  high: number;
  low: number;
  condition: string;
  precipitation: number;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: Date;
  read: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

// Current Weather Data for Chennai
export const currentWeather: WeatherData = {
  temperature: 31,
  feelsLike: 35,
  humidity: 72,
  windSpeed: 12,
  windDirection: 'NE',
  pressure: 1013,
  visibility: 8,
  uvIndex: 7,
  precipitation: 10,
  condition: 'Partly Cloudy',
  cloudCover: 45,
  sunrise: '6:30 AM',
  sunset: '5:45 PM',
  timestamp: new Date(),
  location: "Chennai, Tamil Nadu"
};

// 7-day forecast
export const weeklyForecast: ForecastData[] = [
  { day: "Mon", high: 32, low: 24, condition: "Partly Cloudy", precipitation: 10 },
  { day: "Tue", high: 33, low: 25, condition: "Sunny", precipitation: 5 },
  { day: "Wed", high: 31, low: 23, condition: "Rainy", precipitation: 60 },
  { day: "Thu", high: 30, low: 22, condition: "Cloudy", precipitation: 30 },
  { day: "Fri", high: 32, low: 24, condition: "Sunny", precipitation: 0 },
  { day: "Sat", high: 34, low: 25, condition: "Sunny", precipitation: 0 },
  { day: "Sun", high: 33, low: 24, condition: "Partly Cloudy", precipitation: 15 },
];

// Historical data (24 hours)
export const hourlyData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, '0')}:00`,
  temperature: Math.floor(Math.random() * 8) + 24,
  condition: ['Sunny', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 3)],
}));

// Weather hotspots in Chennai
export const chennaiHotspots: Hotspot[] = [
  { id: "1", name: "Kathivakkam", lat: 13.2167, lng: 80.3167, temperature: 32, condition: "Sunny" },
  { id: "2", name: "Manali", lat: 13.1667, lng: 80.2667, temperature: 30, condition: "Rainy" },
  { id: "3", name: "Velachery", lat: 12.9819, lng: 80.2211, temperature: 31, condition: "Partly Cloudy" },
  { id: "4", name: "T. Nagar", lat: 13.0392, lng: 80.2349, temperature: 31, condition: "Sunny" },
  { id: "5", name: "Adyar", lat: 13.0067, lng: 80.2544, temperature: 32, condition: "Sunny" },
  { id: "6", name: "Anna Nagar", lat: 13.0850, lng: 80.2101, temperature: 30, condition: "Cloudy" },
  { id: "7", name: "Guindy", lat: 13.0067, lng: 80.2206, temperature: 31, condition: "Partly Cloudy" },
  { id: "8", name: "Marina Beach", lat: 13.0499, lng: 80.2824, temperature: 28, condition: "Sunny" },
];

// Mock alerts
export const mockAlerts: Alert[] = [
  {
    id: "1",
    title: "Heavy Rain Alert",
    message: "Heavy rainfall expected in Chennai tomorrow. Plan your outdoor activities accordingly.",
    severity: "warning",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: false,
  },
  {
    id: "2",
    title: "High Temperature",
    message: "Temperature may reach 35°C. Stay hydrated and avoid prolonged sun exposure.",
    severity: "warning",
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    read: false,
  },
  {
    id: "3",
    title: "Good Weather Ahead",
    message: "Perfect weather this weekend! Great time for outdoor activities at Marina Beach.",
    severity: "info",
    timestamp: new Date(Date.now() - 1000 * 60 * 180),
    read: true,
  },
];

// User achievements
export const achievements: Achievement[] = [
  { id: "1", title: "First Breath", description: "Complete your first breathing exercise", icon: "🌬️", unlocked: true, progress: 1, maxProgress: 1 },
  { id: "2", title: "Week Warrior", description: "Complete exercises for 7 consecutive days", icon: "🔥", unlocked: false, progress: 3, maxProgress: 7 },
  { id: "3", title: "Zen Master", description: "Complete 50 breathing sessions", icon: "🧘", unlocked: false, progress: 12, maxProgress: 50 },
  { id: "4", title: "Early Bird", description: "Exercise before 7 AM", icon: "🌅", unlocked: true, progress: 1, maxProgress: 1 },
  { id: "5", title: "Night Owl", description: "Exercise after 10 PM", icon: "🦉", unlocked: false, progress: 0, maxProgress: 1 },
];

// Get weather status
export const getWeatherStatus = (temp: number, condition: string): { status: string; color: string; description: string } => {
  if (condition.includes('Sunny')) return { status: "Sunny", color: "success", description: "Clear skies" };
  if (condition.includes('Cloudy')) return { status: "Cloudy", color: "warning", description: "Mostly cloudy" };
  if (condition.includes('Rainy')) return { status: "Rainy", color: "destructive", description: "Rainfall expected" };
  if (condition.includes('Partly')) return { status: "Partly Cloudy", color: "warning", description: "Mix of sun and clouds" };
  return { status: "Clear", color: "success", description: "Fair weather" };
};

// Get weather recommendations
export const getWeatherRecommendations = (temp: number, condition: string, humidity: number): string[] => {
  const recommendations: string[] = [];
  
  if (condition.includes('Sunny')) {
    recommendations.push('Apply sunscreen before going out');
    recommendations.push('Wear light-colored clothing');
    recommendations.push('Stay hydrated throughout the day');
  }
  
  if (condition.includes('Rainy')) {
    recommendations.push('Carry an umbrella or raincoat');
    recommendations.push('Wear non-slip footwear');
    recommendations.push('Avoid waterlogged areas');
  }
  
  if (temp > 32) {
    recommendations.push('Limit outdoor activities during peak hours (12 PM - 4 PM)');
    recommendations.push('Drink plenty of water');
  }
  
  if (humidity > 70) {
    recommendations.push('Keep yourself dry to prevent fungal infections');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Great weather for outdoor activities!');
    recommendations.push('Enjoy the pleasant conditions');
  }
  
  return recommendations;
};

// Weather-based activity times
export const getActivityTimes = (): { time: string; suitability: 'excellent' | 'good' | 'moderate' }[] => [
  { time: "6 AM - 8 AM", suitability: "excellent" },
  { time: "8 AM - 12 PM", suitability: "good" },
  { time: "12 PM - 4 PM", suitability: "moderate" },
  { time: "4 PM - 6 PM", suitability: "excellent" },
  { time: "6 PM - 9 PM", suitability: "excellent" },
  { time: "9 PM - 6 AM", suitability: "good" },
];
