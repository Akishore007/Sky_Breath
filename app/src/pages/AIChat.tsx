import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User as UserIcon, Loader, Copy, AlertCircle, MapPin } from 'lucide-react';
import apiService from '@/services/apiService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  sources?: string[];
}

const AIChat: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content:
        "Hey there! 👋 I'm your friendly weather assistant. Ask me anything about the weather, and I'll help you out!\n\nYou can ask things like:\n• What's the weather like?\n• Should I bring an umbrella?\n• What should I wear?\n• Tell me about the weather forecast\n\nJust start typing to get started!",
      timestamp: new Date(),
      sources: [],
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState(user?.location || 'Chennai');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = {
      id: aiMessageId,
      type: 'ai',
      content: '',
      timestamp: new Date(),
      sources: [],
    };

    setMessages((prev) => [...prev, aiMessage]);

    try {
      const response = await apiService.request<{
        status: string;
        response: string;
        weather_intent_detected: boolean;
        needs_location: boolean;
        effective_location: string;
        sources: string[];
      }>('/weather/ai-chat/', {
        method: 'POST',
        body: JSON.stringify({
          message: input,
          location: location,
        }),
      });

      if (response.status === 'success') {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? {
                  ...msg,
                  content: response.response,
                  sources: response.sources || ['Groq AI'],
                }
              : msg
          )
        );

        // If location was needed, prompt for it
        if (response.needs_location) {
          toast({
            title: 'Location needed',
            description: 'Please provide a location for weather information',
          });
          setShowLocationInput(true);
        }
      } else {
        throw new Error(response.status);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to get response';
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? {
                ...msg,
                content: `Sorry, I had trouble processing that. Error: ${errorMsg}. Try rephrasing your question!`,
              }
            : msg
        )
      );
      toast({
        title: 'Error',
        description: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!' });
  };

  const updateLocation = (newLocation: string) => {
    setLocation(newLocation);
    setShowLocationInput(false);
    toast({
      title: 'Location updated',
      description: `Now using: ${newLocation}`,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Bot className="w-6 h-6 text-primary" />
          <h1 className="font-display text-3xl lg:text-4xl font-bold">
            <span className="gradient-text">Weather</span> Assistant
          </h1>
        </div>
        <p className="text-muted-foreground">
          Chat with your friendly AI assistant about weather and get helpful advice
        </p>
      </motion.div>

      {/* Location Info */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="text-foreground">
              Current location: <span className="font-semibold">{location}</span>
            </span>
          </div>
          <button
            onClick={() => setShowLocationInput(!showLocationInput)}
            className="px-3 py-1 text-sm bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors"
          >
            Change
          </button>
        </div>

        {/* Location Change Input */}
        {showLocationInput && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 glass-card rounded-2xl p-4 space-y-3"
          >
            <input
              type="text"
              placeholder="Enter a city name (e.g., Mumbai, Delhi, Bangalore)"
              defaultValue={location}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  updateLocation((e.target as HTMLInputElement).value);
                }
              }}
              className="w-full px-4 py-2 bg-secondary border border-primary/30 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  const input = (e.target as HTMLButtonElement).previousElementSibling as HTMLInputElement;
                  updateLocation(input.value);
                }}
                className="flex-1 px-3 py-2 bg-primary hover:bg-primary/80 text-primary-foreground rounded-lg transition-colors font-medium text-sm"
              >
                Update
              </button>
              <button
                onClick={() => setShowLocationInput(false)}
                className="flex-1 px-3 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors font-medium text-sm"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Chat Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl p-6 flex flex-col h-[600px] border border-primary/20"
      >
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex items-start gap-3 max-w-2xl ${
                    message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary border border-primary/30 text-primary'
                    }`}
                  >
                    {message.type === 'user' ? (
                      <UserIcon className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-secondary text-foreground border border-border rounded-bl-none'
                    }`}
                  >
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>

                    {/* Metadata */}
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/20">
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      {message.type === 'ai' && message.sources && message.sources.length > 0 && (
                        <span className="text-xs opacity-70">
                          • {message.sources.join(', ')}
                        </span>
                      )}

                      {message.type === 'ai' && (
                        <button
                          onClick={() => copyToClipboard(message.content)}
                          className="ml-auto p-1 rounded hover:bg-white/20 opacity-60 hover:opacity-100 transition-opacity"
                          title="Copy message"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex justify-start"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary border border-primary/30 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-secondary border border-border rounded-bl-none">
                    <div className="flex gap-2">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-primary rounded-full"
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.6, delay: i * 0.2, repeat: Infinity }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about the weather..."
            disabled={isLoading}
            rows={1}
            className="flex-1 px-4 py-3 bg-secondary border border-primary/30 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none disabled:opacity-50"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-4 py-3 bg-primary hover:bg-primary/80 text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </motion.button>
        </div>
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-4 border border-primary/20"
      >
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">💡 Tips for better responses:</p>
            <ul className="space-y-1 text-xs">
              <li>• Ask specific questions like "What should I wear?" or "Will it rain?"</li>
              <li>• Mention a location if you want weather for a different city</li>
              <li>• Follow up with more questions for detailed information</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AIChat;
