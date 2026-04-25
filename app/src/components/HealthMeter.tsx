import React from 'react';
import { motion } from 'framer-motion';
import { Cloud, AlertTriangle, Zap, Sparkles } from 'lucide-react';

interface HealthMeterProps {
  aqi: number;
}

const getWeatherStatus = (temp: number) => {
  if (temp <= 20) return { 
    status: 'Cold', 
    color: 'info',
    icon: Sparkles,
    description: 'Cool weather. Wear a light jacket.',
    gradient: 'from-blue-400/20 to-blue-500/20',
    borderColor: 'border-blue-400/50'
  };
  if (temp <= 28) return { 
    status: 'Comfortable', 
    color: 'success',
    icon: Sparkles,
    description: 'Perfect weather for outdoor activities!',
    gradient: 'from-success/20 to-accent/20',
    borderColor: 'border-success/50'
  };
  if (temp <= 32) return { 
    status: 'Warm', 
    color: 'warning',
    icon: Cloud,
    description: 'Warm weather. Stay hydrated and use sunscreen.',
    gradient: 'from-warning/20 to-warning/10',
    borderColor: 'border-warning/50'
  };
  return { 
    status: 'Very Hot', 
    color: 'destructive',
    icon: Zap,
    description: 'High temperature. Limit outdoor exposure during peak hours (12-4 PM).',
    gradient: 'from-destructive/30 to-destructive/20',
    borderColor: 'border-destructive/50'
  };
};

const HealthMeter: React.FC<HealthMeterProps> = ({ aqi }) => {
  const { status, color, icon: Icon, description, gradient, borderColor } = getWeatherStatus(aqi);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass-card rounded-2xl p-6 bg-gradient-to-br ${gradient} border ${borderColor}`}
    >
      <div className="flex items-start gap-4">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: color === 'success' ? [0, 10, -10, 0] : 0
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            repeatType: 'reverse' 
          }}
          className={`
            p-4 rounded-xl
            ${color === 'success' ? 'bg-success/20 text-success' : ''}
            ${color === 'warning' ? 'bg-warning/20 text-warning' : ''}
            ${color === 'destructive' ? 'bg-destructive/20 text-destructive' : ''}
            ${color === 'info' ? 'bg-blue-400/20 text-blue-400' : ''}
          `}
        >
          <Icon className="w-8 h-8" />
        </motion.div>
        
        <div className="flex-1">
          <h3 className="font-display text-lg font-bold text-foreground mb-1">
            Weather Conditions
          </h3>
          <p className={`
            text-2xl font-display font-bold mb-2
            ${color === 'success' ? 'text-success' : ''}
            ${color === 'warning' ? 'text-warning' : ''}
            ${color === 'destructive' ? 'text-destructive' : ''}
            ${color === 'info' ? 'text-blue-400' : ''}
          `}>
            {status}
          </p>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      {/* Temperature bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Cold</span>
          <span>Comfortable</span>
          <span>Very Hot</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((aqi / 45) * 100, 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`
              h-full rounded-full
              ${aqi <= 20 ? 'bg-blue-400' : ''}
              ${aqi > 20 && aqi <= 28 ? 'bg-gradient-to-r from-blue-400 to-success' : ''}
              ${aqi > 28 && aqi <= 32 ? 'bg-gradient-to-r from-success to-warning' : ''}
              ${aqi > 32 ? 'bg-destructive' : ''}
            `}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default HealthMeter;
