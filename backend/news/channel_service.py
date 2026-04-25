"""
News channels service with filtering and fallback logic
Ensures minimum 4 channels per country/state combination
"""

from .channel_data import NEWS_CHANNELS_DATA, COUNTRY_FALLBACK_SOURCES


class NewsChannelService:
    """Service for managing news channels with smart filtering"""

    @staticmethod
    def get_countries():
        """Get all available countries"""
        return list(NEWS_CHANNELS_DATA.keys())

    @staticmethod
    def get_states(country: str):
        """Get all states/regions for a country"""
        if country not in NEWS_CHANNELS_DATA:
            return []
        return list(NEWS_CHANNELS_DATA[country].keys())

    @staticmethod
    def get_channels_by_country_state(country: str, state: str = None):
        """
        Get channels for country and state with smart fallback logic.
        
        Ensures minimum 4 channels are returned:
        1. First: Get all state-specific channels (if state provided)
        2. If < 4: Add country fallback sources
        3. If still < 4: Add other states from same country
        
        Returns list of channels with fallback level labeling
        """
        channels = []

        # Step 1: Get state-specific channels
        if state and country in NEWS_CHANNELS_DATA:
            if state in NEWS_CHANNELS_DATA[country]:
                state_channels = NEWS_CHANNELS_DATA[country][state]
                channels.extend(state_channels)

        # Step 2: If < 4 channels, add country fallback sources
        if len(channels) < 4 and country in COUNTRY_FALLBACK_SOURCES:
            fallback_sources = COUNTRY_FALLBACK_SOURCES[country]
            needed = 4 - len(channels)
            channels.extend(fallback_sources[:needed])

        # Step 3: If still < 4, add channels from other states
        if len(channels) < 4 and country in NEWS_CHANNELS_DATA:
            for st in NEWS_CHANNELS_DATA[country]:
                if st != state:  # Skip current state
                    other_state_channels = NEWS_CHANNELS_DATA[country][st]
                    needed = 4 - len(channels)
                    channels.extend(other_state_channels[:needed])
                    if len(channels) >= 4:
                        break

        # Sort by priority and limit to reasonable number (8 total)
        channels = sorted(channels, key=lambda x: x.get('priority', 999))
        return channels[:8]

    @staticmethod
    def get_channel_by_id(channel_id: int):
        """Get a single channel by ID (when migrated to database)"""
        # This will be used when channels are stored in database
        pass

    @staticmethod
    def search_channels(country: str, query: str):
        """Search channels by name or language"""
        channels = []
        
        if country in NEWS_CHANNELS_DATA:
            for state, state_channels in NEWS_CHANNELS_DATA[country].items():
                for channel in state_channels:
                    if (query.lower() in channel['name'].lower() or
                        query.lower() in channel['language'].lower()):
                        channels.append(channel)
        
        # Add fallback sources too
        if country in COUNTRY_FALLBACK_SOURCES:
            for channel in COUNTRY_FALLBACK_SOURCES[country]:
                if (query.lower() in channel['name'].lower() or
                    query.lower() in channel['language'].lower()):
                    channels.append(channel)
        
        return channels
