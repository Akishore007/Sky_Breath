import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useOnWeatherUpdate } from "@/hooks/use-weather-updates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MapPin, Bell, Save, Loader, Search, AlertCircle, Heart, LogOut, Lock, Trash2, Globe, Camera } from "lucide-react";
import apiService from "@/services/apiService";

interface WeatherLocation {
  location: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  weather_condition: string;
  feels_like?: number;
}

interface NewsChannel {
  id: number;
  name: string;
  language: string;
  state?: string;
  country?: string;
}

export default function Profile() {
  const { user, updateProfile, logout, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherLocation | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [availableLocations] = useState<string[]>([
    'Chennai', 'London', 'Paris', 'Tokyo', 'New York', 'Sydney', 'Toronto', 'Dubai'
  ]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [availableChannels, setAvailableChannels] = useState<NewsChannel[]>([]);
  const [favoriteChannels, setFavoriteChannels] = useState<number[]>([]);
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);
  const [profileImage, setProfileImage] = useState<string>(user?.avatar || '');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const LANGUAGE_OPTIONS = [
    { value: 'en', label: 'English' },
    { value: 'ta', label: 'Tamil' },
    { value: 'hi', label: 'Hindi' },
    { value: 'te', label: 'Telugu' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'ja', label: 'Japanese' },
  ];
  
  const [profile, setProfile] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    location: user?.location || "Chennai",
    language_preference: user?.language_preference || "en",
    temperature_threshold: user?.temperature_threshold || 35,
    humidity_threshold: user?.humidity_threshold || 80,
    wind_speed_threshold: user?.wind_speed_threshold || 40,
    notifications_enabled: user?.notifications_enabled || true,
  });

  useEffect(() => {
    if (user) {
      setProfile({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        location: user.location || "Chennai",
        language_preference: user.language_preference || "en",
        temperature_threshold: user.temperature_threshold || 35,
        humidity_threshold: user.humidity_threshold || 80,
        wind_speed_threshold: user.wind_speed_threshold || 40,
        notifications_enabled: user.notifications_enabled || true,
      });
      if (user.favorite_channels) {
        setFavoriteChannels(user.favorite_channels);
      }
      if (user.avatar) {
        setProfileImage(user.avatar);
      }
    }
  }, [user]);

  // Refresh weather when backend sends updates
  useOnWeatherUpdate(() => {
    console.log('[Profile] Refreshing weather data from backend update');
    const refreshWeather = async () => {
      setIsLoadingWeather(true);
      try {
        const weatherResponse = await apiService.getCurrentWeather(profile.location);
        if (weatherResponse) {
          const data = Array.isArray(weatherResponse) ? weatherResponse[0] : weatherResponse;
          setWeatherData(data as WeatherLocation);
        }
      } catch (error) {
        console.error('[Profile] Error refreshing weather:', error);
      } finally {
        setIsLoadingWeather(false);
      }
    };
    refreshWeather();
  });

  // Fetch available news channels
  useEffect(() => {
    const fetchChannels = async () => {
      setIsLoadingChannels(true);
      try {
        const response = await fetch('http://localhost:8000/api/v1/news/channels/');
        if (response.ok) {
          const data = await response.json();
          setAvailableChannels(Array.isArray(data) ? data : data.results || []);
        }
      } catch (error) {
        console.error('Error fetching channels:', error);
      } finally {
        setIsLoadingChannels(false);
      }
    };
    fetchChannels();
  }, []);

  // Fetch weather data for selected location
  useEffect(() => {
    const fetchWeatherData = async () => {
      setIsLoadingWeather(true);
      try {
        const weatherResponse = await apiService.getCurrentWeather(profile.location);
        if (weatherResponse) {
          const data = Array.isArray(weatherResponse) ? weatherResponse[0] : weatherResponse;
          setWeatherData(data as WeatherLocation);
        }
      } catch (error) {
        console.error('Error fetching weather:', error);
      } finally {
        setIsLoadingWeather(false);
      }
    };
    
    fetchWeatherData();
  }, [profile.location]);

  // Initialize with last selected location
  useEffect(() => {
    const lastLocation = localStorage.getItem('lastSelectedLocation');
    if (lastLocation) {
      setProfile(prev => ({ ...prev, location: lastLocation }));
    }
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    
    if (value.trim()) {
      const filtered = availableLocations.filter(loc =>
        loc.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredLocations(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredLocations([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectLocation = (location: string) => {
    setProfile(prev => ({ ...prev, location }));
    setSearchInput('');
    setShowSuggestions(false);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchInput.trim()) {
      setProfile(prev => ({ ...prev, location: searchInput.trim() }));
      setSearchInput('');
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      await updateProfile({
        first_name: profile.first_name,
        last_name: profile.last_name,
        location: profile.location,
        language_preference: profile.language_preference,
        temperature_threshold: profile.temperature_threshold,
        humidity_threshold: profile.humidity_threshold,
        wind_speed_threshold: profile.wind_speed_threshold,
        notifications_enabled: profile.notifications_enabled,
      });
      // Save location to localStorage
      localStorage.setItem('lastSelectedLocation', profile.location);
      toast({
        title: "Success",
        description: "Your weather preferences have been updated.",
      });
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleFavorite = (channelId: number) => {
    setFavoriteChannels(prev => 
      prev.includes(channelId) 
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    );
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      // Call API to delete account
      const response = await fetch('http://localhost:8000/api/v1/users/delete_account/', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        toast({
          title: "Account Deleted",
          description: "Your account has been permanently deleted.",
        });
        logout();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to delete account",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploadingImage(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setProfileImage(result);
      };
      reader.readAsDataURL(file);

      // Mock upload - in production, upload to backend
      setTimeout(() => {
        toast({
          title: "Success",
          description: "Profile picture updated",
        });
      }, 500);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-lg">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Header with Profile Image */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your account and weather preferences
          </p>
        </div>
        
        {/* Profile Image Circle */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative flex-shrink-0"
        >
          <div className="relative w-32 h-32 rounded-full border-4 border-primary/30 overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shadow-lg">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-5xl text-primary/40">
                {user?.first_name && user?.last_name
                  ? `${user.first_name[0]}${user.last_name[0]}`
                  : user?.username?.[0]?.toUpperCase() || '👤'}
              </div>
            )}
          </div>
          
          {/* Upload Button */}
          <label htmlFor="profile-image-upload">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-3 cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
            >
              {isUploadingImage ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                <Camera className="h-5 w-5" />
              )}
            </motion.div>
          </label>
          
          <input
            id="profile-image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isUploadingImage}
            className="hidden"
          />
          
          <p className="text-xs text-center text-gray-600 dark:text-gray-400 mt-3 w-32">
            {user?.first_name} {user?.last_name}
          </p>
        </motion.div>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>View and update your basic information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Username</label>
              <input
                type="text"
                value={user.username}
                disabled
                className="w-full mt-2 px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-900 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full mt-2 px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-900 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-sm font-medium">First Name</label>
              <input
                type="text"
                value={profile.first_name}
                onChange={(e) => handleInputChange("first_name", e.target.value)}
                className="w-full mt-2 px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Last Name</label>
              <input
                type="text"
                value={profile.last_name}
                onChange={(e) => handleInputChange("last_name", e.target.value)}
                className="w-full mt-2 px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Favorite News Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="mr-2 h-5 w-5 text-red-500" />
            Favorite News Channels
          </CardTitle>
          <CardDescription>Save your favorite channels for quick access</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingChannels ? (
            <div className="flex items-center justify-center p-6">
              <Loader className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : availableChannels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {availableChannels.map(channel => (
                <motion.button
                  key={channel.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleToggleFavorite(channel.id)}
                  className={`p-3 border rounded-lg text-left transition-all ${
                    favoriteChannels.includes(channel.id)
                      ? 'bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-700'
                      : 'bg-secondary border-primary/30 hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{channel.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {channel.language}
                        {channel.state && ` • ${channel.state}`}
                        {channel.country && ` • ${channel.country}`}
                      </p>
                    </div>
                    <Heart
                      className={`h-4 w-4 ml-2 ${
                        favoriteChannels.includes(channel.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </div>
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No channels available</p>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-4">
            Selected: <span className="font-semibold text-foreground">{favoriteChannels.length}</span> channels
          </p>
        </CardContent>
      </Card>

      {/* Weather Alert Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle>Weather Alert Thresholds</CardTitle>
          <CardDescription>
            Set the values at which you want to receive weather alerts for {profile.location}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium">
              Temperature Threshold: {profile.temperature_threshold}°C
            </label>
            <input
              type="range"
              min="25"
              max="50"
              value={profile.temperature_threshold}
              onChange={(e) =>
                handleInputChange("temperature_threshold", parseInt(e.target.value))
              }
              className="w-full mt-3 accent-primary"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
              <p>Alert when temperature exceeds {profile.temperature_threshold}°C</p>
              {weatherData && <p>Current: <span className="font-semibold">{Math.round(weatherData.temperature)}°C</span></p>}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">
              Humidity Threshold: {profile.humidity_threshold}%
            </label>
            <input
              type="range"
              min="30"
              max="100"
              value={profile.humidity_threshold}
              onChange={(e) =>
                handleInputChange("humidity_threshold", parseInt(e.target.value))
              }
              className="w-full mt-3 accent-primary"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
              <p>Alert when humidity exceeds {profile.humidity_threshold}%</p>
              {weatherData && <p>Current: <span className="font-semibold">{weatherData.humidity}%</span></p>}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">
              Wind Speed Threshold: {profile.wind_speed_threshold} km/h
            </label>
            <input
              type="range"
              min="10"
              max="80"
              value={profile.wind_speed_threshold}
              onChange={(e) =>
                handleInputChange("wind_speed_threshold", parseInt(e.target.value))
              }
              className="w-full mt-3 accent-primary"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
              <p>Alert when wind speed exceeds {profile.wind_speed_threshold} km/h</p>
              {weatherData && <p>Current: <span className="font-semibold">{weatherData.wind_speed} km/h</span></p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30">
        <CardHeader>
          <CardTitle className="text-red-700 dark:text-red-300">Account Actions</CardTitle>
          <CardDescription>Manage your account security and settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              disabled
            >
              <Lock className="h-4 w-4" />
              Change Password (Coming Soon)
            </Button>
            
            {showDeleteConfirm ? (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg"
              >
                <p className="text-sm font-medium mb-3 text-red-900 dark:text-red-100">
                  Are you sure? This action cannot be undone.
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="flex-1"
                  >
                    {isDeleting ? <Loader className="h-4 w-4 animate-spin" /> : 'Delete'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            ) : (
              <Button
                variant="destructive"
                className="w-full justify-start gap-2"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete Account
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex gap-2">
        <Button
          onClick={handleSaveProfile}
          disabled={isSaving}
          className="gap-2"
          size="lg"
        >
          {isSaving ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </motion.div>
  );
}
