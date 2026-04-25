import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useOnWeatherUpdate } from '@/hooks/use-weather-updates';
import { Newspaper, Play, Loader2, AlertCircle, X, ExternalLink, Volume2, Share2, Heart } from 'lucide-react';

interface NewsChannel {
  id: number;
  name: string;
  language: string;
  stream_url: string;
  stream_type: string;
  logo: string;
  website_url: string;
  youtube_channel: string;
  country: string;
  state: string;
  city: string;
  channel_type: string;
  is_verified: boolean;
  views_count: number;
  description?: string;
  is_active?: boolean;
}

const API_BASE = 'http://localhost:8000/api/v1/news/channels';

const extractYouTubeId = (url: string): string | null => {
  if (!url) return null;

  // Handle different YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,  // youtube.com/watch?v=ID or youtu.be/ID
    /youtube\.com\/embed\/([^&\n?#]+)/,                     // youtube.com/embed/ID
    /youtube\.com\/channel\/([^&\n?#]+)/,                   // youtube.com/channel/ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // If the URL looks like a direct ID (no slashes or special chars except -)
  if (!url.includes('/') && !url.includes('?') && url.length >= 10) {
    return url;
  }

  return null;
};

// Handle YouTube channel/livestream URLs
const getYouTubeEmbedUrl = (url: string): string | null => {
  if (!url) return null;

  // If it's already an embed ID (11+ chars, no slashes), try to embed it
  if (!url.includes('/') && url.length >= 10) {
    // Only attempt to embed if it looks like a valid video ID
    // Otherwise return null to use external link
    return `https://www.youtube.com/embed/${url}`;
  }

  // For direct embed URLs
  if (url.includes('youtube.com/embed/')) {
    return url;
  }

  // Channel URLs should open externally, not embedded
  // Return null so we show the "Watch on YouTube" button instead
  if (url.includes('youtube.com/@') || url.includes('youtube.com/c/') || url.includes('youtube.com/user/') || url.includes('youtube.com/channel/')) {
    return null;
  }

  return null;
};

const News: React.FC<{ currentLocation?: string }> = ({ currentLocation }) => {
  const [countries, setCountries] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [states, setStates] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>('');
  const [channels, setChannels] = useState<NewsChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<NewsChannel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [statesLoading, setStatesLoading] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);

  // Auto-location based on stored location
  useOnWeatherUpdate(() => {
    const locationToUse = localStorage.getItem('lastSelectedLocation') || '';
    if (locationToUse && !selectedCountry) {
      handleLocationAuto(locationToUse);
    }
  });

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('favoriteChannels');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  // Fetch countries on mount
  useEffect(() => {
    fetchCountries();
    const locationToUse = localStorage.getItem('lastSelectedLocation') || '';
    if (locationToUse) {
      handleLocationAuto(locationToUse);
    }
  }, []);

  // Fetch states when country changes
  useEffect(() => {
    if (selectedCountry) {
      fetchStates(selectedCountry);
    }
  }, [selectedCountry]);

  // Fetch channels when state changes
  useEffect(() => {
    if (selectedCountry && selectedState) {
      fetchChannels(selectedCountry, selectedState);
    }
  }, [selectedState]);

  const fetchCountries = async () => {
    try {
      setError(null);
      setCountriesLoading(true);
      const response = await fetch(`${API_BASE}/list_countries/`);
      if (!response.ok) throw new Error('Failed to fetch countries');
      const data = await response.json();
      const uniqueCountries = [...new Set(data.countries || [])].sort() as string[];
      setCountries(uniqueCountries);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load countries';
      setError(errorMsg);
    } finally {
      setCountriesLoading(false);
    }
  };

  const fetchStates = async (country: string) => {
    try {
      setError(null);
      setStatesLoading(true);
      setSelectedState('');
      setChannels([]);
      const response = await fetch(
        `${API_BASE}/list_states/?country=${encodeURIComponent(country)}`
      );
      if (!response.ok) throw new Error(`Failed to fetch states for ${country}`);
      const data = await response.json();
      const uniqueStates = [...new Set(data.states || [])].sort() as string[];
      setStates(uniqueStates);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : `Failed to load states`;
      setError(errorMsg);
    } finally {
      setStatesLoading(false);
    }
  };

  const fetchChannels = async (country: string, state: string) => {
    try {
      setError(null);
      setLoading(true);
      setSelectedChannel(null);
      const response = await fetch(
        `${API_BASE}/by_state/?country=${encodeURIComponent(country)}&state=${encodeURIComponent(state)}`
      );
      if (!response.ok) throw new Error(`Failed to fetch channels`);
      const data = await response.json();

      let channelsList = Array.isArray(data) ? data : data.data || [];
      const uniqueChannelsMap = new Map<number, NewsChannel>();
      channelsList.forEach(channel => {
        if (!uniqueChannelsMap.has(channel.id)) {
          uniqueChannelsMap.set(channel.id, channel);
        }
      });

      const uniqueChannels = Array.from(uniqueChannelsMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      setChannels(uniqueChannels);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load channels';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationAuto = (location: string) => {
    const locationMap: { [key: string]: { country: string; state: string } } = {
      'Chennai': { country: 'India', state: 'Tamil Nadu' },
      'London': { country: 'United Kingdom', state: 'England' },
      'Paris': { country: 'France', state: 'Île-de-France' },
      'Tokyo': { country: 'Japan', state: 'Tokyo' },
      'New York': { country: 'United States', state: 'New York' },
      'Sydney': { country: 'Australia', state: 'New South Wales' },
      'Toronto': { country: 'Canada', state: 'Ontario' },
      'Dubai': { country: 'United Arab Emirates', state: 'Dubai' },
    };

    const mapped = locationMap[location];
    if (mapped) {
      setSelectedCountry(mapped.country);
    }
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountry(e.target.value);
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedState(e.target.value);
  };

  const handleChannelClick = (channel: NewsChannel) => {
    setSelectedChannel(channel);
    channel.is_active ? channel.views_count++ : null;
  };

  const toggleFavorite = (channelId: number) => {
    const newFavorites = favorites.includes(channelId)
      ? favorites.filter(id => id !== channelId)
      : [...favorites, channelId];
    setFavorites(newFavorites);
    localStorage.setItem('favoriteChannels', JSON.stringify(newFavorites));
  };

  const isEmpty = channels.length === 0;
  const youtubeEmbedUrl = selectedChannel ? getYouTubeEmbedUrl(selectedChannel.stream_url || selectedChannel.youtube_channel) : null;

  // Get sorted channels (favorites first)
  const sortedChannels = [...channels].sort((a, b) => {
    const aIsFav = favorites.includes(a.id);
    const bIsFav = favorites.includes(b.id);
    if (aIsFav && !bIsFav) return -1;
    if (!aIsFav && bIsFav) return 1;
    return 0;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3 mb-2">
          <Newspaper className="w-6 h-6 text-primary" />
          <h1 className="font-display text-3xl lg:text-4xl font-bold">
            <span className="gradient-text">News Channels</span>
          </h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Watch live news from channels in your region. Browse by country and state to find local news coverage.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Selection Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="glass-card rounded-2xl p-6 space-y-6 sticky top-6">
            {/* Country Selection */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">
                🌍 Country
              </label>
              <select
                value={selectedCountry}
                onChange={handleCountryChange}
                disabled={countriesLoading}
                className="w-full px-4 py-2 bg-secondary border border-primary/30 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              >
                <option value="">Select...</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            {/* State Selection */}
            {selectedCountry && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <label className="block text-sm font-semibold text-foreground mb-3">
                  📍 State/Region
                </label>
                <select
                  value={selectedState}
                  onChange={handleStateChange}
                  disabled={statesLoading}
                  className="w-full px-4 py-2 bg-secondary border border-primary/30 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                >
                  <option value="">Select...</option>
                  {states.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </motion.div>
            )}

            {/* Favorites */}
            {favorites.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <label className="block text-sm font-semibold text-foreground mb-3">
                  ❤️ Favorites ({favorites.length})
                </label>
                <div className="space-y-2">
                  {channels
                    .filter(c => favorites.includes(c.id))
                    .map(channel => (
                      <button
                        key={channel.id}
                        onClick={() => handleChannelClick(channel)}
                        className="w-full text-left px-3 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors text-sm font-medium text-foreground"
                      >
                        {channel.name}
                      </button>
                    ))}
                </div>
              </motion.div>
            )}

            {/* Loading & Errors */}
            {countriesLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-red-600 mb-1">Error</p>
                  <p className="text-xs text-red-500 leading-tight">{error}</p>
                  <button
                    onClick={fetchCountries}
                    className="mt-2 text-xs px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-600 rounded transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-3 space-y-6">
          {selectedChannel && youtubeEmbedUrl ? (
            // YouTube Player Section
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              {/* Player */}
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="aspect-video bg-black relative">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`${youtubeEmbedUrl}?autoplay=1&modestbranding=1`}
                    title={selectedChannel.name}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </div>

              {/* Channel Info */}
              <div className="glass-card rounded-2xl p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {selectedChannel.logo && (
                      <img
                        src={selectedChannel.logo}
                        alt={selectedChannel.name}
                        className="w-20 h-20 rounded-lg object-cover border border-primary/30"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="font-display text-2xl font-bold text-foreground">
                          {selectedChannel.name}
                        </h2>
                        {selectedChannel.is_verified && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-600 rounded-full text-xs font-semibold">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{selectedChannel.language} • {selectedChannel.state}</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleFavorite(selectedChannel.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      favorites.includes(selectedChannel.id)
                        ? 'bg-red-500/20 text-red-500'
                        : 'bg-secondary hover:bg-primary/10 text-foreground'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${favorites.includes(selectedChannel.id) ? 'fill-current' : ''}`} />
                  </motion.button>
                </div>

                {/* Channel Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Type</p>
                    <p className="text-sm font-semibold capitalize">{selectedChannel.channel_type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Views</p>
                    <p className="text-sm font-semibold">{selectedChannel.views_count.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Location</p>
                    <p className="text-sm font-semibold">{selectedChannel.state}, {selectedChannel.country}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Stream</p>
                    <p className="text-sm font-semibold capitalize">{selectedChannel.stream_type.replace('_', ' ')}</p>
                  </div>
                </div>

                {/* Description */}
                {selectedChannel.description && (
                  <p className="text-sm leading-relaxed text-foreground">{selectedChannel.description}</p>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                  {selectedChannel.website_url && (
                    <a
                      href={selectedChannel.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors text-sm font-semibold"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Website
                    </a>
                  )}
                  {selectedChannel.youtube_channel && (
                    <a
                      href={selectedChannel.youtube_channel.startsWith('http') ? selectedChannel.youtube_channel : `https://youtube.com/@${selectedChannel.youtube_channel}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-semibold"
                    >
                      <ExternalLink className="w-4 h-4" />
                      YouTube Channel
                    </a>
                  )}
                  <button
                    onClick={() => toggleFavorite(selectedChannel.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors text-sm font-semibold"
                  >
                    <Heart className={`w-4 h-4 ${favorites.includes(selectedChannel.id) ? 'fill-current text-red-500' : ''}`} />
                    {favorites.includes(selectedChannel.id) ? 'Favorited' : 'Favorite'}
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedChannel(null)}
                className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                <X className="w-4 h-4" />
                Close Channel
              </motion.button>
            </motion.div>
          ) : selectedChannel && !youtubeEmbedUrl ? (
            // YouTube Channel (Non-embeddable) Section
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              {/* Channel Info */}
              <div className="glass-card rounded-2xl p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {selectedChannel.logo && (
                      <img
                        src={selectedChannel.logo}
                        alt={selectedChannel.name}
                        className="w-20 h-20 rounded-lg object-cover border border-primary/30"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="font-display text-2xl font-bold text-foreground">
                          {selectedChannel.name}
                        </h2>
                        {selectedChannel.is_verified && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-600 rounded-full text-xs font-semibold">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{selectedChannel.language} • {selectedChannel.state}</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleFavorite(selectedChannel.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      favorites.includes(selectedChannel.id)
                        ? 'bg-red-500/20 text-red-500'
                        : 'bg-secondary hover:bg-primary/10 text-foreground'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${favorites.includes(selectedChannel.id) ? 'fill-current' : ''}`} />
                  </motion.button>
                </div>

                {/* Channel Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Type</p>
                    <p className="text-sm font-semibold capitalize">{selectedChannel.channel_type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Views</p>
                    <p className="text-sm font-semibold">{selectedChannel.views_count.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Location</p>
                    <p className="text-sm font-semibold">{selectedChannel.state}, {selectedChannel.country}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Stream</p>
                    <p className="text-sm font-semibold capitalize">{selectedChannel.stream_type.replace('_', ' ')}</p>
                  </div>
                </div>

                {/* Description */}
                {selectedChannel.description && (
                  <p className="text-sm leading-relaxed text-foreground">{selectedChannel.description}</p>
                )}

                {/* Info Message */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-600 mb-2">Watch on YouTube</p>
                    <p className="text-sm text-blue-500 mb-3">
                      Click the button below to watch this news channel on YouTube with full access to its latest content.
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                  {selectedChannel.stream_url && (
                    <a
                      href={selectedChannel.stream_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-semibold"
                    >
                      <Play className="w-4 h-4" />
                      Watch on YouTube
                    </a>
                  )}
                  {selectedChannel.website_url && (
                    <a
                      href={selectedChannel.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors text-sm font-semibold"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Website
                    </a>
                  )}
                  <button
                    onClick={() => toggleFavorite(selectedChannel.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors text-sm font-semibold"
                  >
                    <Heart className={`w-4 h-4 ${favorites.includes(selectedChannel.id) ? 'fill-current text-red-500' : ''}`} />
                    {favorites.includes(selectedChannel.id) ? 'Favorited' : 'Favorite'}
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedChannel(null)}
                className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                <X className="w-4 h-4" />
                Close Channel
              </motion.button>
            </motion.div>
          ) : (
            // Channels List
            <div className="space-y-4">
              {selectedState ? (
                <>
                  <h3 className="font-display text-xl font-bold text-foreground">
                    {selectedCountry && selectedState ? `Channels in ${selectedState}, ${selectedCountry}` : 'Select a location'}
                  </h3>

                  {loading && (
                    <div className="glass-card rounded-2xl p-12 flex items-center justify-center gap-3">
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                      <span className="text-muted-foreground">Loading channels...</span>
                    </div>
                  )}

                  {!loading && isEmpty && (
                    <div className="glass-card rounded-2xl p-12 text-center">
                      <Newspaper className="w-12 h-12 text-primary/50 mx-auto mb-3" />
                      <p className="text-muted-foreground">No channels available for this location</p>
                    </div>
                  )}

                  {!loading && !isEmpty && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {sortedChannels.map((channel, index) => (
                        <motion.button
                          key={channel.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleChannelClick(channel)}
                          className="glass-card rounded-xl p-4 hover:border-primary/50 hover:shadow-lg transition-all duration-200 group text-left relative overflow-hidden"
                        >
                          {/* Background hover effect */}
                          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                          {/* Favorite badge */}
                          {favorites.includes(channel.id) && (
                            <div className="absolute top-2 right-2 z-10">
                              <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                            </div>
                          )}

                          <div className="flex items-center gap-3 relative z-10">
                            {channel.logo && (
                              <img
                                src={channel.logo}
                                alt={channel.name}
                                className="w-14 h-14 object-cover rounded-lg border border-primary/30 flex-shrink-0"
                                onError={(e) => (e.currentTarget.style.display = 'none')}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-display font-bold text-foreground group-hover:text-primary transition-colors truncate">
                                {channel.name}
                              </h4>
                              <p className="text-xs text-muted-foreground mb-2">{channel.language}</p>
                              <div className="flex items-center gap-1 text-primary">
                                <Play className="w-3 h-3" />
                                <span className="text-xs font-medium">Watch</span>
                              </div>
                              {channel.is_verified && (
                                <span className="text-xs text-green-600 mt-1 block">✓ Verified</span>
                              )}
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="glass-card rounded-2xl p-12 text-center">
                  <Newspaper className="w-12 h-12 text-primary/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Select a country and state to view available news channels
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default News;
