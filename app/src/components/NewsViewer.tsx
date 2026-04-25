import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ExternalLink, Loader, AlertCircle } from 'lucide-react';

interface NewsChannel {
  name: string;
  official_website: string;
  youtube_channel?: string;
  embed_url?: string;
  rss_url?: string;
  language: string;
  state: string;
}

interface NewsViewerProps {
  channel: NewsChannel;
  onClose: () => void;
}

const NewsViewer: React.FC<NewsViewerProps> = ({ channel, onClose }) => {
  const [displayMode, setDisplayMode] = useState<'iframe' | 'website' | 'headlines'>('iframe');
  const [loading, setLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);

  useEffect(() => {
    // Attempt to load iframe
    const timer = setTimeout(() => {
      if (!iframeError) {
        setLoading(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [iframeError]);

  const handleIframeError = () => {
    setIframeError(true);
    setDisplayMode('website');
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass-card rounded-2xl overflow-hidden border border-primary/20"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-6 flex justify-between items-start border-b border-border">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{channel.name}</h2>
          <p className="text-sm text-muted-foreground">
            {channel.language} • {channel.state}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-primary/20 rounded-lg transition-colors"
        >
          <X className="w-6 h-6 text-foreground" />
        </button>
      </div>

      {/* Display Mode Tabs */}
      <div className="bg-secondary/50 p-4 flex gap-2 border-b border-border overflow-x-auto">
        <button
          onClick={() => setDisplayMode('iframe')}
          className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all ${
            displayMode === 'iframe'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary hover:bg-secondary/80 text-foreground'
          }`}
        >
          In-App View
        </button>
        <button
          onClick={() => setDisplayMode('headlines')}
          className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all ${
            displayMode === 'headlines'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary hover:bg-secondary/80 text-foreground'
          }`}
        >
          Headlines
        </button>
        <button
          onClick={() => setDisplayMode('website')}
          className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all ${
            displayMode === 'website'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary hover:bg-secondary/80 text-foreground'
          }`}
        >
          Open Website
        </button>
      </div>

      {/* Content Area */}
      <div className="p-6 min-h-[400px]">
        {displayMode === 'iframe' && (
          <div className="space-y-4">
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Attempting to load in-app viewer...</p>
                </div>
              </div>
            )}

            {iframeError ? (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
                <div className="flex gap-4">
                  <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-yellow-700 mb-2">
                      In-App Viewing Not Available
                    </h3>
                    <p className="text-sm text-yellow-600 mb-4">
                      This channel doesn't allow embedding in other websites. You can view their content
                      directly on their official website.
                    </p>
                    <a
                      href={channel.official_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Official Website
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <iframe
                src={channel.embed_url || channel.official_website}
                className="w-full h-[500px] rounded-lg border border-border"
                allowFullScreen
                onError={handleIframeError}
              />
            )}
          </div>
        )}

        {displayMode === 'headlines' && (
          <div className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
              <div className="flex gap-4">
                <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-700 mb-2">Headlines Feature</h3>
                  <p className="text-sm text-blue-600 mb-4">
                    RSS feed headlines and article cards will appear here. This feature loads the latest
                    news articles from the channel's official feed.
                  </p>
                  <a
                    href={channel.official_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visit Channel for Latest Updates
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {displayMode === 'website' && (
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
              <div className="flex gap-4">
                <AlertCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-700 mb-2">Visit Official Website</h3>
                  <p className="text-sm text-green-600 mb-4">
                    Click the button below to visit {channel.name}'s official website in a new window.
                    You'll get access to their complete content, live streams, and more features.
                  </p>
                  <a
                    href={channel.official_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open {channel.name} Website
                  </a>
                </div>
              </div>
            </div>

            {channel.youtube_channel && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
                <div className="flex gap-4">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-red-700 mb-2">YouTube Channel</h3>
                    <p className="text-sm text-red-600 mb-4">
                      You can also watch {channel.name} on their YouTube channel.
                    </p>
                    <a
                      href={channel.youtube_channel}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Visit YouTube Channel
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default NewsViewer;
