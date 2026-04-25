import sys
import os

# Reconfigure stdout to utf-8 to handle emojis in terminal
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

from dotenv import load_dotenv
load_dotenv(os.path.abspath('backend/.env'))

from backend.weather.groq_service import GroqWeatherAssistant

try:
    assistant = GroqWeatherAssistant()
    print("Assistant initialized successfully")
    response = assistant.generate_response("hi")
    print(f"Response: {response}")
except Exception as e:
    print(f"Test failed: {e}")
