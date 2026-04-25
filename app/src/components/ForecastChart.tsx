import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { weeklyForecast } from '@/lib/mockData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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

interface ForecastChartProps {
  forecastData?: ForecastDay[];
  location?: string;
}

const ForecastChart: React.FC<ForecastChartProps> = ({ forecastData, location }) => {
  // Use provided forecast data or fallback to mock data
  const displayData = forecastData && forecastData.length > 0 ? forecastData : weeklyForecast;
  
  // Convert forecast data to chart format
  const chartData = displayData.map((d: any) => ({
    day: d.forecast_date || d.day,
    high: d.max_temperature || d.high,
    low: d.min_temperature || d.low,
  }));

  const data = {
    labels: chartData.map(d => d.day),
    datasets: [
      {
        label: 'High Temperature',
        data: chartData.map(d => d.high),
        borderColor: 'hsl(0, 84%, 60%)',
        backgroundColor: 'hsla(0, 84%, 60%, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'hsl(0, 84%, 60%)',
        pointBorderColor: 'hsl(0, 84%, 60%)',
        pointHoverBackgroundColor: 'hsl(0, 100%, 70%)',
        pointHoverBorderColor: 'hsl(0, 100%, 70%)',
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Low Temperature',
        data: chartData.map(d => d.low),
        borderColor: 'hsl(217, 91%, 60%)',
        backgroundColor: 'hsla(217, 91%, 60%, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'hsl(217, 91%, 60%)',
        pointBorderColor: 'hsl(217, 91%, 60%)',
        pointHoverBackgroundColor: 'hsl(217, 100%, 70%)',
        pointHoverBorderColor: 'hsl(217, 100%, 70%)',
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: 'hsl(215, 20%, 65%)',
          font: {
            family: 'Orbitron',
          },
        },
      },
      tooltip: {
        backgroundColor: 'hsla(222, 47%, 8%, 0.9)',
        titleColor: 'hsl(210, 40%, 98%)',
        bodyColor: 'hsl(210, 40%, 98%)',
        borderColor: 'hsla(173, 80%, 45%, 0.5)',
        borderWidth: 1,
        cornerRadius: 12,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context: any) => `${context.dataset.label}: ${context.raw}°C`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'hsl(215, 20%, 65%)',
          font: {
            family: 'Orbitron',
          },
        },
      },
      y: {
        min: 15,
        max: 40,
        grid: {
          color: 'hsla(217, 33%, 17%, 0.5)',
        },
        ticks: {
          color: 'hsl(215, 20%, 65%)',
          stepSize: 5,
          callback: (value: any) => `${value}°C`,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="font-display text-lg font-bold text-foreground mb-4">
        7-Day Weather Forecast
      </h3>
      <div className="h-64">
        <Line data={data} options={options} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {weeklyForecast.map((day) => (
          <div
            key={day.day}
            className={`
              px-3 py-1 rounded-full text-xs font-medium
              ${day.condition.includes('Sunny') ? 'bg-yellow-500/20 text-yellow-500' : ''}
              ${day.condition.includes('Rainy') ? 'bg-blue-500/20 text-blue-500' : ''}
              ${day.condition.includes('Cloudy') || day.condition.includes('Partly') ? 'bg-gray-400/20 text-gray-400' : ''}
            `}
          >
            {day.day}: {day.condition} ({day.high}°C/{day.low}°C)
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForecastChart;
