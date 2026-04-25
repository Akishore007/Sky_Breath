import React from 'react';
import { motion } from 'framer-motion';

interface GaugeProps {
  value: number;
  max: number;
  label: string;
  unit: string;
  color?: 'primary' | 'success' | 'warning' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

const colorClasses = {
  primary: {
    stroke: 'stroke-primary',
    fill: 'fill-primary',
    glow: 'drop-shadow-[0_0_10px_hsl(var(--primary)/0.5)]',
  },
  success: {
    stroke: 'stroke-success',
    fill: 'fill-success',
    glow: 'drop-shadow-[0_0_10px_hsl(var(--success)/0.5)]',
  },
  warning: {
    stroke: 'stroke-warning',
    fill: 'fill-warning',
    glow: 'drop-shadow-[0_0_10px_hsl(var(--warning)/0.5)]',
  },
  destructive: {
    stroke: 'stroke-destructive',
    fill: 'fill-destructive',
    glow: 'drop-shadow-[0_0_10px_hsl(var(--destructive)/0.5)]',
  },
};

const sizes = {
  sm: { size: 100, strokeWidth: 8, fontSize: 'text-lg' },
  md: { size: 140, strokeWidth: 10, fontSize: 'text-2xl' },
  lg: { size: 180, strokeWidth: 12, fontSize: 'text-3xl' },
};

const AQIGauge: React.FC<GaugeProps> = ({
  value,
  max,
  label,
  unit,
  color = 'primary',
  size = 'md',
}) => {
  const { size: svgSize, strokeWidth, fontSize } = sizes[size];
  const radius = (svgSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const strokeDashoffset = circumference * (1 - progress);

  const colors = colorClasses[color];

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: svgSize, height: svgSize }}>
        <svg
          width={svgSize}
          height={svgSize}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/30"
          />
          {/* Progress circle */}
          <motion.circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className={`${colors.stroke} ${colors.glow}`}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`font-display font-bold ${fontSize} ${colors.fill.replace('fill-', 'text-')}`}
          >
            {Math.round(value)}
          </motion.span>
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
      </div>
      <span className="mt-2 text-sm font-medium text-foreground">{label}</span>
    </div>
  );
};

export default AQIGauge;
