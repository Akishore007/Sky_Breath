"""
Groq AI Service for friendly weather chat
Handles intent detection, weather data fetching, and LLM communication
"""

import os
import re
from typing import Optional, Dict, Any
from groq import Groq


class WeatherIntentDetector:
    """Detects weather-related intent from user messages"""
    
    WEATHER_KEYWORDS = {
        'weather', 'temperature', 'temp', 'forecast', 'rain', 'humidity',
        'wind', 'climate', 'hot', 'cold', 'sunny', 'rainy', 'cloudy',
        'condition', 'conditions', 'weather conditions', 'how is weather',
        'what is weather', 'tell weather', 'sunrise', 'sunset', 'cloud',
        'storm', 'snow', 'hail', 'freezing', 'precipitation', 'pressure',
        'dew point', 'visibility', 'weather today', 'weather tomorrow',
        'forecast today', 'forecast tomorrow', 'is it raining', 'will it rain',
        'weather for', 'what to wear', 'wear', 'umbrella', 'jacket',
        'temperature range', 'high temp', 'low temp', 'max temp', 'min temp'
    }
    
    @classmethod
    def detect_weather_intent(cls, message: str) -> bool:
        """Check if message contains weather-related keywords"""
        message_lower = message.lower()
        
        for keyword in cls.WEATHER_KEYWORDS:
            if keyword in message_lower:
                return True
        
        return False
    
    @classmethod
    def extract_location(cls, message: str) -> Optional[str]:
        """Try to extract location from message"""
        # Common patterns: "weather in [location]", "how is [location]", "what is weather in [location]"
        patterns = [
            r'(?:in|for|at|weather in)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
            r'(?:what|how) is (?:the )?(?:weather )?(?:in|at)?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, message)
            if match:
                location = match.group(1).strip()
                # Exclude common words that aren't locations
                exclude_words = {'the', 'today', 'tomorrow', 'right now', 'currently'}
                if location.lower() not in exclude_words:
                    return location
        
        # If no explicit location found, check if message starts with location
        first_word = message.split()[0]
        if first_word[0].isupper() and len(first_word) > 1:
            return first_word
        
        return None


class GroqWeatherAssistant:
    """Friendly weather assistant using Groq AI"""
    
    SYSTEM_PROMPT = """You are a friendly and helpful weather assistant. Your role is to answer weather-related questions in a conversational, natural way.

Key behaviors:
1. Be conversational and friendly - speak like a helpful friend, not a robot
2. Use a natural tone with occasional emojis where appropriate
3. Keep answers concise by default, but provide more detail if asked follow-up questions
4. Always base weather information on real data provided - never invent weather data
5. If location is not specified in the question, politely ask for it
6. When answering weather questions:
   - Include temperature, condition, and other relevant metrics
   - Give practical advice (what to wear, activities, precautions)
   - Mention if data might be unavailable or uncertain
7. For non-weather questions: respond naturally and conversationally
8. If you don't have specific weather data, say "I don't have weather data for that location right now"
9. Always be helpful and encouraging

Remember: You have access to real weather data - use it to give accurate answers."""

    def __init__(self):
        """Initialize Groq client"""
        self.api_key = os.getenv('GROQ_API_KEY')
        if not self.api_key:
            raise ValueError(
                'GROQ_API_KEY environment variable not set. '
                'Please set it in backend/.env or system environment.'
            )
        
        self.client = Groq(api_key=self.api_key)
        self.model = 'llama-3.1-8b-instant'  # Fast and capable model
    
    def generate_response(
        self,
        user_message: str,
        weather_data: Optional[Dict[str, Any]] = None,
        location: Optional[str] = None
    ) -> str:
        """
        Generate friendly AI response with optional weather context
        
        Args:
            user_message: The user's input message
            weather_data: Optional real weather data (from API)
            location: Optional location name
            
        Returns:
            Friendly assistant response
        """
        
        # Build context about weather data if available
        weather_context = ""
        if weather_data and location:
            weather_context = f"\n\nREAL WEATHER DATA FOR {location}:\n"
            weather_context += f"Temperature: {weather_data.get('temperature', 'N/A')}°C\n"
            weather_context += f"Condition: {weather_data.get('weather_condition', 'N/A')}\n"
            weather_context += f"Humidity: {weather_data.get('humidity', 'N/A')}%\n"
            weather_context += f"Wind Speed: {weather_data.get('wind_speed', 'N/A')} km/h\n"
            if weather_data.get('feels_like'):
                weather_context += f"Feels Like: {weather_data.get('feels_like')}°C\n"
            weather_context += "\nUse this real data to answer the user's question."
        elif location and WeatherIntentDetector.detect_weather_intent(user_message):
            weather_context = f"\n\nNote: The user is asking about weather for {location}, but I don't have real weather data available."
        
        # Prepare the message for Groq
        full_message = user_message + weather_context
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": self.SYSTEM_PROMPT
                    },
                    {
                        "role": "user",
                        "content": full_message
                    }
                ],
                max_tokens=500,
                temperature=0.7  # Balanced between creative and consistent
            )
            
            return response.choices[0].message.content
        
        except Exception as e:
            print(f"Groq AI Error: {e}")
            # Fallback response if Groq fails
            return f"I'm having trouble connecting to my AI right now. Here's what I know: {user_message[:100]}..."
    
    def process_message(
        self,
        user_message: str,
        user_location: str = "Chennai",
        weather_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process user message and generate appropriate response
        
        Returns:
        {
            "response": "The assistant's response",
            "weather_intent_detected": bool,
            "location_mentioned": str or None,
            "needs_location": bool,  # User didn't specify location for weather question
            "sources": ["Groq AI", "Weather API"] or ["Groq AI"]
        }
        """
        
        # Check for weather intent
        has_weather_intent = WeatherIntentDetector.detect_weather_intent(user_message)
        
        # Try to extract location from message
        mentioned_location = WeatherIntentDetector.extract_location(user_message)
        
        # Determine effective location and whether we need to ask for it
        location_to_use = mentioned_location or user_location
        needs_location = has_weather_intent and not mentioned_location and not user_location
        
        # Generate response
        response = self.generate_response(
            user_message,
            weather_data=weather_data if location_to_use else None,
            location=location_to_use
        )
        
        # Build sources list
        sources = ["Groq AI"]
        if has_weather_intent and weather_data:
            sources.append("Weather API")
        
        return {
            "response": response,
            "weather_intent_detected": has_weather_intent,
            "location_mentioned": mentioned_location,
            "effective_location": location_to_use,
            "needs_location": needs_location,
            "sources": sources
        }
