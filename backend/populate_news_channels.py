#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Populate news channels database with sample data
"""
import os
import django
from django.utils.text import slugify

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'weatherhub.settings')
django.setup()

from news.models import NewsChannel

# Sample news channels data - Comprehensive worldwide coverage
CHANNELS_DATA = [
    # ===== INDIA =====
    # India - Tamil Nadu
    {
        'name': 'Sun News',
        'language': 'Tamil',
        'country': 'India',
        'state': 'Tamil Nadu',
        'city': 'Chennai',
        'channel_type': 'news',
        'stream_type': 'youtube',
        'stream_url': 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        'youtube_channel': 'https://www.youtube.com/@SunNewsOfficial',
        'website_url': 'https://www.sunnewstamil.com',
        'logo': 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7d/Sun_News_Tamil_Logo.svg/1200px-Sun_News_Tamil_Logo.svg.png',
        'is_verified': True,
        'description': 'Sun News is a leading Tamil language news channel',
    },
    {
        'name': 'Vivek TV',
        'language': 'Tamil',
        'country': 'India',
        'state': 'Tamil Nadu',
        'city': 'Chennai',
        'channel_type': 'news',
        'stream_type': 'youtube',
        'stream_url': 'https://www.youtube.com/embed/d0H3Z2K3A5c',
        'youtube_channel': 'https://www.youtube.com/@VivekTV',
        'website_url': 'https://www.vivektv.com',
        'is_verified': True,
        'description': 'Vivek TV - Popular Tamil News Channel',
    },
    {
        'name': 'Polimer News',
        'language': 'Tamil',
        'country': 'India',
        'state': 'Tamil Nadu',
        'city': 'Chennai',
        'channel_type': 'news',
        'stream_type': 'youtube',
        'stream_url': 'https://www.youtube.com/embed/Bx1K9X4Z8eE',
        'youtube_channel': 'https://www.youtube.com/@polymertvnews',
        'website_url': 'https://www.polymernews.com',
        'is_verified': True,
        'description': 'Polimer News Tamil Channel',
    },
    
    # India - Telangana
    {
        'name': 'Eenadu News',
        'language': 'Telugu',
        'country': 'India',
        'state': 'Telangana',
        'city': 'Hyderabad',
        'channel_type': 'news',
        'stream_type': 'youtube',
        'stream_url': 'https://www.youtube.com/embed/nQ8vF4K2R7p',
        'youtube_channel': 'https://www.youtube.com/@eenadu',
        'website_url': 'https://eenadu.net',
        'is_verified': True,
        'description': 'Eenadu News - Telugu News Channel',
    },
    {
        'name': 'TV5 News',
        'language': 'Telugu',
        'country': 'India',
        'state': 'Telangana',
        'city': 'Hyderabad',
        'channel_type': 'news',
        'stream_type': 'youtube',
        'stream_url': 'https://www.youtube.com/embed/pZ3vR8T1Q2f',
        'youtube_channel': 'https://www.youtube.com/@TV5Chandrayya',
        'website_url': 'https://www.tv5news.in',
        'is_verified': True,
        'description': 'TV5 News Telugu',
    },
    
    # India - Delhi
    {
        'name': 'NDTV India',
        'language': 'Hindi',
        'country': 'India',
        'state': 'Delhi',
        'city': 'New Delhi',
        'channel_type': 'news',
        'stream_type': 'youtube',
        'stream_url': 'https://www.youtube.com/embed/jX8cK5N9M4w',
        'youtube_channel': 'https://www.youtube.com/@NDTVIndia',
        'website_url': 'https://www.ndtv.com',
        'is_verified': True,
        'description': 'NDTV India - Hindi News Channel',
    },
    {
        'name': 'India Today',
        'language': 'Hindi',
        'country': 'India',
        'state': 'Delhi',
        'city': 'New Delhi',
        'channel_type': 'news',
        'stream_type': 'youtube',
        'stream_url': 'https://www.youtube.com/embed/hL7vP6S8X3d',
        'youtube_channel': 'https://www.youtube.com/@IndiaToday',
        'website_url': 'https://www.indiatoday.in',
        'is_verified': True,
        'description': 'India Today - Leading Hindi News',
    },
    
    # ===== UNITED STATES =====
    # USA - New York
    {
        'name': 'NY1 News',
        'language': 'English',
        'country': 'United States',
        'state': 'New York',
        'city': 'New York',
        'channel_type': 'news',
        'stream_type': 'youtube',
        'stream_url': 'https://www.youtube.com/embed/fM2aR9K7L1c',
        'youtube_channel': 'https://www.youtube.com/@NY1NewYork',
        'website_url': 'https://www.ny1.com',
        'is_verified': True,
        'description': 'NY1 - Local New York News',
    },
    {
        'name': 'NBC New York',
        'language': 'English',
        'country': 'United States',
        'state': 'New York',
        'city': 'New York',
        'channel_type': 'news',
        'stream_type': 'youtube',
        'stream_url': 'https://www.youtube.com/embed/cW4jZ3M5P2v',
        'youtube_channel': 'https://www.youtube.com/@NBCNewYork',
        'website_url': 'https://www.nbcnewyork.com',
        'is_verified': True,
        'description': 'NBC New York - Local News',
    },
    
    # USA - California
    {
        'name': 'KTLA 5 News',
        'language': 'English',
        'country': 'United States',
        'state': 'California',
        'city': 'Los Angeles',
        'channel_type': 'news',
        'stream_type': 'youtube',
        'stream_url': 'https://www.youtube.com/embed/bV8tL4N7H2x',
        'youtube_channel': 'https://www.youtube.com/@KTLA5',
        'website_url': 'https://ktla.com',
        'is_verified': True,
        'description': 'KTLA 5 - Los Angeles News',
    },
    {
        'name': 'KTTV FOX 11',
        'language': 'English',
        'country': 'United States',
        'state': 'California',
        'city': 'Los Angeles',
        'channel_type': 'news',
        'stream_type': 'youtube',
        'stream_url': 'https://www.youtube.com/embed/aJ6kX1V9B3m',
        'youtube_channel': 'https://www.youtube.com/@fox11la',
        'website_url': 'https://www.foxla.com',
        'is_verified': True,
        'description': 'FOX 11 Los Angeles News',
    },
    
    # USA - Texas
    {
        'name': 'KHOU 11',
        'language': 'English',
        'country': 'United States',
        'state': 'Texas',
        'city': 'Houston',
        'channel_type': 'news',
        'stream_type': 'youtube',
        'stream_url': 'https://www.youtube.com/embed/eP5qW2G8C4n',
        'youtube_channel': 'https://www.youtube.com/@KHOU11',
        'website_url': 'https://www.khou.com',
        'is_verified': True,
        'description': 'KHOU 11 - Houston News',
    },
    {
        'name': 'NBC 5 Dallas',
        'language': 'English',
        'country': 'United States',
        'state': 'Texas',
        'city': 'Dallas',
        'channel_type': 'news',
        'stream_type': 'youtube',
        'stream_url': 'https://www.youtube.com/embed/dQ9rY3P4F1t',
        'youtube_channel': 'https://www.youtube.com/@nbcdfw',
        'website_url': 'https://www.nbcdfw.com',
        'is_verified': True,
        'description': 'NBC 5 Dallas - Local News',
    },
    
    # ===== UNITED KINGDOM =====
    {
        'name': 'BBC News',
        'language': 'English',
        'country': 'United Kingdom',
        'state': 'England',
        'city': 'London',
        'channel_type': 'news',
        'stream_type': 'youtube',
        'stream_url': 'https://www.youtube.com/embed/cJ2mK8L5R6s',
        'youtube_channel': 'https://www.youtube.com/@BBCNews',
        'website_url': 'https://www.bbc.com/news',
        'is_verified': True,
        'description': 'BBC News - UK National News',
    },
    {
        'name': 'Sky News',
        'language': 'English',
        'country': 'United Kingdom',
        'state': 'England',
        'city': 'London',
        'channel_type': 'news',
        'stream_type': 'youtube',
        'stream_url': 'https://www.youtube.com/embed/bM7sV9X1Q2u',
        'youtube_channel': 'https://www.youtube.com/@SkyNews',
        'website_url': 'https://news.sky.com',
        'is_verified': True,
        'description': 'Sky News - UK Breaking News',
    },
    {
        'name': 'ITV News',
        'language': 'English',
        'country': 'United Kingdom',
        'state': 'England',
        'city': 'London',
        'channel_type': 'news',
        'stream_type': 'youtube',
        'stream_url': 'https://www.youtube.com/embed/aO6tW2H3N4v',
        'youtube_channel': 'https://www.youtube.com/@itvnews',
        'website_url': 'https://www.itv.com/news',
        'is_verified': True,
        'description': 'ITV News - UK National News',
    },
    
    # ===== FRANCE =====
    {
        'name': 'France 24',
        'language': 'English',
        'country': 'France',
        'state': 'Île-de-France',
        'city': 'Paris',
        'channel_type': 'news',
        'stream_type': 'youtube',
        'stream_url': 'https://www.youtube.com/embed/zL8pV7M6K5w',
        'youtube_channel': 'https://www.youtube.com/@France24',
        'website_url': 'https://www.france24.com',
        'is_verified': True,
        'description': 'France 24 - International News',
    },
    {
        'name': 'TF1 News',
        'language': 'French',
        'country': 'France',
        'state': 'Île-de-France',
        'city': 'Paris',
        'channel_type': 'news',
        'stream_type': 'youtube',
        'stream_url': 'https://www.youtube.com/embed/yJ9rX4P3L2x',
        'youtube_channel': 'https://www.youtube.com/@TF1',
        'website_url': 'https://www.tf1.fr',
        'is_verified': True,
        'description': 'TF1 - French National News',
    },
    
    # ===== GERMANY =====
    {
        'name': 'Deutsche Welle',
        'language': 'English',
        'country': 'Germany',
        'state': 'North Rhine-Westphalia',
        'city': 'Bonn',
        'channel_type': 'news',
        'stream_type': 'youtube',
        'stream_url': 'https://www.youtube.com/embed/xK7uM8N5O1y',
        'youtube_channel': 'https://www.youtube.com/@DeutscheWelle',
        'website_url': 'https://www.dw.com',
        'is_verified': True,
        'description': 'Deutsche Welle - German International News',
    },
    {
        'name': 'ARD News',
        'language': 'German',
        'country': 'Germany',
        'state': 'Bavaria',
        'city': 'Munich',
        'channel_type': 'news',
        'stream_type': 'youtube',
        'stream_url': 'https://www.youtube.com/embed/wI6sL9T2V3z',
        'youtube_channel': 'https://www.youtube.com/@ARDNews',
        'website_url': 'https://www.ard.de',
        'is_verified': True,
        'description': 'ARD - German National News',
    },
    
    # ===== JAPAN =====
    {
        'name': 'NHK World',
        'language': 'English',
        'country': 'Japan',
        'state': 'Tokyo',
        'city': 'Tokyo',
        'channel_type': 'news',
        'stream_type': 'youtube',
        'stream_url': 'https://www.youtube.com/embed/vH5rP8Q1A2b',
        'youtube_channel': 'https://www.youtube.com/@nhkworldofficial',
        'website_url': 'https://www3.nhk.or.jp/nhkworld/',
        'is_verified': True,
        'description': 'NHK World - Japanese International News',
    },
    {
        'name': 'Nippon TV',
        'language': 'Japanese',
        'country': 'Japan',
        'state': 'Tokyo',
        'city': 'Tokyo',
        'channel_type': 'news',
        'stream_type': 'youtube',
        'stream_url': 'https://www.youtube.com/embed/uG4sK7M9N3c',
        'youtube_channel': 'https://www.youtube.com/@ntvnews24',
        'website_url': 'https://www.ntv.co.jp',
        'is_verified': True,
        'description': 'Nippon TV - Japanese National News',
    },
    
    # ===== AUSTRALIA =====
    {
        'name': 'ABC News',
        'language': 'English',
        'country': 'Australia',
        'state': 'New South Wales',
        'city': 'Sydney',
        'channel_type': 'news',
        'stream_type': 'youtube',
        'stream_url': 'https://www.youtube.com/embed/tF3rJ6L8K4d',
        'youtube_channel': 'https://www.youtube.com/@ABCNewsAustralia',
        'website_url': 'https://www.abc.net.au/news',
        'is_verified': True,
        'description': 'ABC News Australia - National News',
    },
    {
        'name': 'Nine News Sydney',
        'language': 'English',
        'country': 'Australia',
        'state': 'New South Wales',
        'city': 'Sydney',
        'channel_type': 'news',
        'stream_type': 'youtube',
        'stream_url': 'https://www.youtube.com/embed/sE2qI5H7M1e',
        'youtube_channel': 'https://www.youtube.com/@9NewsAustralia',
        'website_url': 'https://www.9news.com.au',
        'is_verified': True,
        'description': 'Nine News - Sydney Local News',
    },
    
    # ===== CANADA =====
    {
        'name': 'CBC News',
        'language': 'English',
        'country': 'Canada',
        'state': 'Ontario',
        'city': 'Toronto',
        'channel_type': 'news',
        'stream_type': 'youtube',
        'stream_url': 'https://www.youtube.com/embed/rD1pG4N9J2f',
        'youtube_channel': 'https://www.youtube.com/@CBCNews',
        'website_url': 'https://www.cbc.ca/news',
        'is_verified': True,
        'description': 'CBC News - Canadian National News',
    },
    {
        'name': 'CTV News',
        'language': 'English',
        'country': 'Canada',
        'state': 'Ontario',
        'city': 'Toronto',
        'channel_type': 'news',
        'stream_type': 'youtube',
        'stream_url': 'https://www.youtube.com/embed/qC8pF5M3H6g',
        'youtube_channel': 'https://www.youtube.com/@CTVNews',
        'website_url': 'https://www.ctv.ca',
        'is_verified': True,
        'description': 'CTV News - Canadian News Network',
    },
    
    # ===== BRAZIL =====
    {
        'name': 'Globo News',
        'language': 'Portuguese',
        'country': 'Brazil',
        'state': 'Rio de Janeiro',
        'city': 'Rio de Janeiro',
        'channel_type': 'news',
        'stream_type': 'youtube',
        'stream_url': 'https://www.youtube.com/embed/pB7oJ2K4L5h',
        'youtube_channel': 'https://www.youtube.com/@GloboNews',
        'website_url': 'https://globonews.globo.com',
        'is_verified': True,
        'description': 'Globo News - Brazilian News Channel',
    },
    {
        'name': 'Band News',
        'language': 'Portuguese',
        'country': 'Brazil',
        'state': 'São Paulo',
        'city': 'São Paulo',
        'channel_type': 'news',
        'stream_type': 'youtube',
        'stream_url': 'https://www.youtube.com/embed/oA6nE3J9I1i',
        'youtube_channel': 'https://www.youtube.com/@bandnewsbrasil',
        'website_url': 'https://www.bandnewsbrasil.com.br',
        'is_verified': True,
        'description': 'Band News - Brazilian News Network',
    },
    
    # ===== MEXICO =====
    {
        'name': 'Televisa News',
        'language': 'Spanish',
        'country': 'Mexico',
        'state': 'Mexico City',
        'city': 'Mexico City',
        'channel_type': 'news',
        'stream_type': 'youtube',
        'stream_url': 'https://www.youtube.com/embed/nV8lD4K6M7j',
        'youtube_channel': 'https://www.youtube.com/@televisa',
        'website_url': 'https://www.televisa.com',
        'is_verified': True,
        'description': 'Televisa News - Mexican National News',
    },
    {
        'name': 'Milenio Televisión',
        'language': 'Spanish',
        'country': 'Mexico',
        'state': 'Mexico City',
        'city': 'Mexico City',
        'channel_type': 'news',
        'stream_type': 'youtube',
        'stream_url': 'https://www.youtube.com/embed/mU7jC5L2N3k',
        'youtube_channel': 'https://www.youtube.com/@mileniotelevision',
        'website_url': 'https://www.milenio.com',
        'is_verified': True,
        'description': 'Milenio - Mexican News Network',
    },
    
    # ===== UNITED ARAB EMIRATES =====
    {
        'name': 'Al Jazeera English',
        'language': 'English',
        'country': 'United Arab Emirates',
        'state': 'Dubai',
        'city': 'Dubai',
        'channel_type': 'news',
        'stream_type': 'youtube',
        'stream_url': 'https://www.youtube.com/embed/lW6kB1M9O4l',
        'youtube_channel': 'https://www.youtube.com/@AJEnglish',
        'website_url': 'https://www.aljazeera.com',
        'is_verified': True,
        'description': 'Al Jazeera - International News Network',
    },
    {
        'name': 'Emarat TV',
        'language': 'Arabic',
        'country': 'United Arab Emirates',
        'state': 'Dubai',
        'city': 'Dubai',
        'channel_type': 'news',
        'stream_type': 'youtube',
        'stream_url': 'https://www.youtube.com/embed/kV5iH3L7P2m',
        'youtube_channel': 'https://www.youtube.com/@emiratarabiaemiratelyahd',
        'website_url': 'https://www.emarat.tv',
        'is_verified': True,
        'description': 'Emarat TV - UAE News',
    },
]

def populate_channels():
    """Populate news channels"""
    created_count = 0
    updated_count = 0
    
    for channel_data in CHANNELS_DATA:
        # Create slug
        channel_data['slug'] = slugify(channel_data['name'])
        
        # Get or create channel
        channel, created = NewsChannel.objects.update_or_create(
            slug=channel_data['slug'],
            defaults=channel_data
        )
        
        if created:
            created_count += 1
            print(f'[OK] Created: {channel.name} ({channel.country}/{channel.state})')
        else:
            updated_count += 1
            print(f'[OK] Updated: {channel.name} ({channel.country}/{channel.state})')
    
    print(f'\n[OK] Done! Created: {created_count}, Updated: {updated_count}')
    print(f'Total channels: {NewsChannel.objects.count()}')

if __name__ == '__main__':
    print('Populating news channels...\n')
    populate_channels()
