import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import apiService from '@/services/apiService';
import {
  Heart,
  ExternalLink,
  Tv,
  Loader,
  AlertCircle,
  Globe,
  MapPin,
  ChevronDown
} from 'lucide-react';
import NewsViewer from '@/components/NewsViewer';

interface NewsChannel {
  id?: number;
  name: string;
  language: string;
  channel_type: string;
  category: string;
  state: string;
  country: string;
  official_website: string;
  youtube_channel?: string;
  logo_url?: string;
  is_official: boolean;
  priority: number;
  fallback_level: 'state' | 'country' | 'other_state';
  embed_url?: string;
  rss_url?: string;
}

interface FilterResponse {
  status: string;
  country: string;
  state: string;
  channels: NewsChannel[];
  total: number;
  min_requirement: number;
  requirement_met: boolean;
  fallback_used: boolean;
  fallback_explanation: string;
}

const NewsChannelsPage: React.FC = () => {
  const { user } = useAuth();
  const [countries, setCountries] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('India');
  const [selectedState, setSelectedState] = useState<string>('Tamil Nadu');
  const [channels, setChannels] = useState<NewsChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<NewsChannel | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [fallbackUsed, setFallbackUsed] = useState(false);


  // Load initial countries on mount
  useEffect(() => {
    fetchCountries();
  }, []);

  // Fetch states when country changes
  useEffect(() => {
    if (selectedCountry) {
      fetchStates(selectedCountry);
      setSelectedState(''); // Reset state
    }
  }, [selectedCountry]);

  // Fetch channels when country/state changes
  useEffect(() => {
    if (selectedCountry && selectedState) {
      fetchChannels();
    }
  }, [selectedCountry, selectedState]);

  const fetchCountries = async () => {
    try {
      const response = await apiService.request<{ countries: string[] }>(
        '/news/channels/countries/'
      );
      setCountries(response.countries || []);
    } catch (err) {
      console.error('Failed to load countries:', err);
      setError('Failed to load countries');
    }
  };

  const fetchStates = async (country: string) => {
    try {
      const response = await apiService.request<{ states: string[] }>(
        `/news/channels/states/?country=${encodeURIComponent(country)}`
      );
      setStates(response.states || []);
      if (response.states && response.states.length > 0) {
        setSelectedState(response.states[0]);
      }
    } catch (err) {
      console.error('Failed to load states:', err);
      setError('Failed to load states for selected country');
    }
  };

  const fetchChannels = async () => {
    if (!selectedCountry || !selectedState) return;

    try {
      setLoading(true);
      setError('');

      const response = await apiService.request<FilterResponse>(
        `/news/channels/filter/?country=${encodeURIComponent(
          selectedCountry
        )}&state=${encodeURIComponent(selectedState)}`
      );

      if (response.status === 'success') {
        setChannels(response.channels || []);
        setFallbackUsed(response.fallback_used || false);
      } else {
        setError(response.status === 'error' ? 'No channels found' : 'Failed to load channels');
        setChannels([]);
      }

      // Load favorites from localStorage
      const saved = localStorage.getItem('favoriteChannels');
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load channels';
      setError(errorMsg);
      setChannels([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (channelName: string) => {
    const newFavorites = favorites.includes(channelName)
      ? favorites.filter(name => name !== channelName)
      : [...favorites, channelName];
    setFavorites(newFavorites);
    localStorage.setItem('favoriteChannels', JSON.stringify(newFavorites));
  };

  const getFallbackLevelLabel = (level: string): string => {
    switch (level) {
      case 'state':
        return 'State Source';
      case 'country':
        return 'Country Fallback';
      case 'other_state':
        return 'Other State';
      default:
        return 'Source';
    }
  };

  const getFallbackLevelColor = (level: string): string => {
    switch (level) {
      case 'state':
        return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'country':
        return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'other_state':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full space-y-6 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3 mb-2">
          <Tv className="w-6 h-6 text-primary" />
          <h1 className="font-display text-3xl lg:text-4xl font-bold">
            <span className="gradient-text">Official News</span> Channels
          </h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Browse official news channels by region. We guarantee at least 4 channels per
          state, with fallback to national sources when needed.
        </p>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="glass-card rounded-2xl p-6 space-y-6 sticky top-6">
            {/* Country Selector */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Country
              </label>
              <div className="relative">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-4 py-3 bg-secondary border border-primary/30 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none cursor-pointer"
                >
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* State Selector */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                State/Region
              </label>
              <div className="relative">
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full px-4 py-3 bg-secondary border border-primary/30 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none cursor-pointer"
                >
                  {states.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Info Box */}
            {channels.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary/10 border border-primary/30 rounded-lg p-4"
              >
                <p className="text-sm font-semibold text-foreground mb-2">✓ Channels Found</p>
                <p className="text-xs text-muted-foreground">
                  {channels.length} official news channel{channels.length !== 1 ? 's' : ''} available
                </p>
                {fallbackUsed && (
                  <p className="text-xs text-primary mt-2">
                    📌 Includes fallback sources to ensure minimum 4 channels
                  </p>
                )}
              </motion.div>
            )}

            {/* Favorites Section */}
            {favorites.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <label className="block text-sm font-semibold text-foreground mb-3">
                  ❤️ Favorites ({favorites.length})
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {channels
                    .filter((c) => favorites.includes(c.name))
                    .map((channel) => (
                      <button
                        key={channel.name}
                        onClick={() => setSelectedChannel(channel)}
                        className="w-full text-left px-3 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors text-sm font-medium text-foreground truncate"
                        title={channel.name}
                      >
                        {channel.name}
                      </button>
                    ))}
                </div>
              </motion.div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-red-600 mb-1">Error</p>
                  <p className="text-xs text-red-500 leading-tight">{error}</p>
                  <button
                    onClick={fetchChannels}
                    className="mt-2 text-xs px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-600 rounded transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Main Content Area */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-3 space-y-6">
          {/* Channel Viewer */}
          {selectedChannel && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-3"
            >
              <NewsViewer channel={selectedChannel} onClose={() => setSelectedChannel(null)} />
            </motion.div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 glass-card rounded-2xl">
              <Loader className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Loading news channels...</p>
            </div>
          ) : channels.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <Tv className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">No channels available</p>
              <p className="text-sm text-muted-foreground mt-2">
                Try selecting a different country or state
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {channels.map((channel, index) => (
                <motion.div
                  key={channel.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedChannel(channel)}
                  className="glass-card rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer border border-border"
                >
                  {/* Channel Banner */}
                  <div className="relative h-32 bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center overflow-hidden">
                    {channel.logo_url ? (
                      <img
                        src={channel.logo_url}
                        alt={channel.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3C/svg%3E';
                        }}
                      />
                    ) : (
                      <Tv className="w-12 h-12 text-primary opacity-30" />
                    )}
                  </div>

                  {/* Channel Info */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="font-semibold text-foreground text-lg mb-1 line-clamp-2">
                        {channel.name}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs px-2 py-1 bg-secondary rounded text-muted-foreground">
                          {channel.language}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded border ${getFallbackLevelColor(
                            channel.fallback_level
                          )}`}
                        >
                          {getFallbackLevelLabel(channel.fallback_level)}
                        </span>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>📍 {channel.state}</p>
                      <p>🏷️ {channel.category}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2 border-t border-border">
                      <a
                        href={channel.official_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1"
                      >
                        <button className="w-full px-3 py-2 bg-primary hover:bg-primary/80 text-primary-foreground text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
                          <ExternalLink className="w-4 h-4" />
                          Visit
                        </button>
                      </a>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(channel.name);
                        }}
                        className={`px-3 py-2 rounded-lg border transition-colors ${
                          favorites.includes(channel.name)
                            ? 'bg-red-500/20 border-red-500/30 text-red-500'
                            : 'bg-secondary border-border text-muted-foreground hover:border-primary/30'
                        }`}
                      >
                        <Heart
                          className="w-4 h-4"
                          fill={favorites.includes(channel.name) ? 'currentColor' : 'none'}
                        />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default NewsChannelsPage;
