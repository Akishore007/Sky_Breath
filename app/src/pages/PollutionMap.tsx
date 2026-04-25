import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { chennaiHotspots } from '@/lib/mockData';
import { MapPin, Navigation, Layers, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const PollutionMap: React.FC = () => {
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
  const [mapView, setMapView] = useState<'standard' | 'satellite'>('standard');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'bg-success';
      case 'moderate': return 'bg-warning';
      case 'unhealthy': return 'bg-destructive';
      case 'hazardous': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe': return CheckCircle;
      case 'moderate': return Info;
      case 'unhealthy': return AlertTriangle;
      case 'hazardous': return AlertTriangle;
      default: return Info;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="font-display text-3xl lg:text-4xl font-bold mb-2">
          <span className="gradient-text">Pollution</span> Map
        </h1>
        <p className="text-muted-foreground">
          Interactive map of Chennai air quality hotspots
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 glass-card rounded-2xl overflow-hidden"
        >
          {/* Map Controls */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="font-display font-medium">Chennai Region</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMapView('standard')}
                className={`px-3 py-1 rounded-lg text-sm transition-all ${
                  mapView === 'standard' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => setMapView('satellite')}
                className={`px-3 py-1 rounded-lg text-sm transition-all ${
                  mapView === 'satellite' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                <Layers className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mock Map */}
          <div 
            className={`
              relative h-96 lg:h-[500px]
              ${mapView === 'satellite' 
                ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
                : 'bg-gradient-to-br from-secondary via-muted to-secondary'
              }
            `}
          >
            {/* Grid lines */}
            <div className="absolute inset-0 opacity-10">
              {[...Array(10)].map((_, i) => (
                <React.Fragment key={i}>
                  <div 
                    className="absolute w-full h-px bg-foreground" 
                    style={{ top: `${i * 10}%` }} 
                  />
                  <div 
                    className="absolute h-full w-px bg-foreground" 
                    style={{ left: `${i * 10}%` }} 
                  />
                </React.Fragment>
              ))}
            </div>

            {/* Hotspot markers */}
            {chennaiHotspots.map((hotspot, index) => {
              const Icon = getStatusIcon(hotspot.status);
              const isSelected = selectedHotspot === hotspot.id;
              
              // Calculate position based on lat/lng (simplified)
              const x = ((hotspot.lng - 80.15) / 0.15) * 80 + 10;
              const y = ((13.25 - hotspot.lat) / 0.3) * 80 + 10;
              
              return (
                <motion.div
                  key={hotspot.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="absolute cursor-pointer"
                  style={{ left: `${x}%`, top: `${y}%` }}
                  onClick={() => setSelectedHotspot(isSelected ? null : hotspot.id)}
                >
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.5, repeat: isSelected ? Infinity : 0 }}
                    className="relative"
                  >
                    {/* Pulse effect */}
                    <div className={`
                      absolute -inset-4 rounded-full opacity-30 animate-ping
                      ${getStatusColor(hotspot.status)}
                    `} />
                    
                    {/* Marker */}
                    <div className={`
                      relative w-8 h-8 rounded-full flex items-center justify-center
                      ${getStatusColor(hotspot.status)} text-white shadow-lg
                    `}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </motion.div>

                  {/* Tooltip */}
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute left-1/2 -translate-x-1/2 mt-2 z-10"
                    >
                      <div className="glass-card rounded-xl p-3 min-w-[150px] shadow-2xl">
                        <p className="font-display font-bold text-foreground text-sm">{hotspot.name}</p>
                        <p className="text-xs text-muted-foreground">AQI: {hotspot.aqi}</p>
                        <span className={`
                          inline-block px-2 py-0.5 rounded-full text-xs mt-1
                          ${hotspot.status === 'safe' ? 'bg-success/20 text-success' : ''}
                          ${hotspot.status === 'moderate' ? 'bg-warning/20 text-warning' : ''}
                          ${hotspot.status === 'unhealthy' ? 'bg-destructive/20 text-destructive' : ''}
                        `}>
                          {hotspot.status}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}

            {/* Navigation button */}
            <button className="absolute bottom-4 right-4 p-3 bg-primary text-primary-foreground rounded-xl shadow-lg neon-glow hover:scale-105 transition-transform">
              <Navigation className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Hotspots List */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-2xl p-6"
        >
          <h2 className="font-display text-lg font-bold text-foreground mb-4">
            Nearby Hotspots
          </h2>
          
          <div className="space-y-3">
            {chennaiHotspots.map((hotspot) => {
              const Icon = getStatusIcon(hotspot.status);
              const isSelected = selectedHotspot === hotspot.id;
              
              return (
                <motion.button
                  key={hotspot.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedHotspot(isSelected ? null : hotspot.id)}
                  className={`
                    w-full p-4 rounded-xl text-left transition-all
                    ${isSelected 
                      ? 'bg-primary/10 border-primary/30 border' 
                      : 'bg-secondary/50 hover:bg-secondary/80'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${getStatusColor(hotspot.status)}/20`}>
                        <Icon className={`w-4 h-4 ${
                          hotspot.status === 'safe' ? 'text-success' :
                          hotspot.status === 'moderate' ? 'text-warning' : 'text-destructive'
                        }`} />
                      </div>
                      <span className="font-medium text-foreground">{hotspot.name}</span>
                    </div>
                    <span className={`
                      font-display font-bold
                      ${hotspot.status === 'safe' ? 'text-success' :
                        hotspot.status === 'moderate' ? 'text-warning' : 'text-destructive'
                      }
                    `}>
                      {hotspot.aqi}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="capitalize">{hotspot.status}</span>
                    <span>Tap for details</span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-border">
            <h3 className="text-sm font-medium text-foreground mb-3">Legend</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success" />
                <span className="text-muted-foreground">Safe (0-100)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-warning" />
                <span className="text-muted-foreground">Moderate (101-150)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <span className="text-muted-foreground">Unhealthy (151+)</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PollutionMap;
