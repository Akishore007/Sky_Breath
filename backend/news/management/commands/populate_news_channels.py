"""
Django management command to populate news channels for different locations
"""
from django.core.management.base import BaseCommand
from news.models import NewsChannel


class Command(BaseCommand):
    help = 'Populate news channels for India - Tamil Nadu - Chennai'

    def handle(self, *args, **options):
        # Channels data for Chennai, Tamil Nadu
        channels_data = [
            # Tamil News Channels (Regional)
            {
                'name': 'Puthiya Thalaimurai',
                'slug': 'puthiya-thalaimurai',
                'country': 'India',
                'state': 'Tamil Nadu',
                'city': 'Chennai',
                'language': 'Tamil',
                'channel_type': 'news',
                'stream_type': 'youtube',
                'stream_url': 'https://www.youtube.com/@PuthiyaThalaimuraiNews',
                'website_url': 'https://www.puthiyathalaimurai.com',
                'youtube_channel': '@PuthiyaThalaimuraiNews',
                'description': 'Tamil News Channel - Latest news, breaking news, and updates from Tamil Nadu',
                'is_active': True,
                'is_verified': True,
            },
            {
                'name': 'Thanthi TV',
                'slug': 'thanthi-tv',
                'country': 'India',
                'state': 'Tamil Nadu',
                'city': 'Chennai',
                'language': 'Tamil',
                'channel_type': 'news',
                'stream_type': 'youtube',
                'stream_url': 'https://www.youtube.com/@ThanthiTV',
                'website_url': 'https://www.thanthitv.com',
                'youtube_channel': '@ThanthiTV',
                'description': 'Thanthi TV - Breaking News, Latest News in Tamil',
                'is_active': True,
                'is_verified': True,
            },
            {
                'name': 'Jaya TV',
                'slug': 'jaya-tv',
                'country': 'India',
                'state': 'Tamil Nadu',
                'city': 'Chennai',
                'language': 'Tamil',
                'channel_type': 'news',
                'stream_type': 'youtube',
                'stream_url': 'https://www.youtube.com/@JayaTV',
                'website_url': 'https://www.jayatv.com',
                'youtube_channel': '@JayaTV',
                'description': 'Jaya TV - Tamil News Channel',
                'is_active': True,
                'is_verified': True,
            },
            {
                'name': 'Kalaignar TV',
                'slug': 'kalaignar-tv',
                'country': 'India',
                'state': 'Tamil Nadu',
                'city': 'Chennai',
                'language': 'Tamil',
                'channel_type': 'news',
                'stream_type': 'youtube',
                'stream_url': 'https://www.youtube.com/@KalaignarTV',
                'website_url': 'https://www.kalaignartv.com',
                'youtube_channel': '@KalaignarTV',
                'description': 'Kalaignar TV - Tamil News and Entertainment',
                'is_active': True,
                'is_verified': True,
            },
            {
                'name': 'Makkal TV',
                'slug': 'makkal-tv',
                'country': 'India',
                'state': 'Tamil Nadu',
                'city': 'Chennai',
                'language': 'Tamil',
                'channel_type': 'news',
                'stream_type': 'youtube',
                'stream_url': 'https://www.youtube.com/@MakkalTV',
                'website_url': 'https://www.makkaltv.com',
                'youtube_channel': '@MakkalTV',
                'description': 'Makkal TV - News and Current Affairs',
                'is_active': True,
                'is_verified': True,
            },
            {
                'name': 'Sun News',
                'slug': 'sun-news',
                'country': 'India',
                'state': 'Tamil Nadu',
                'city': 'Chennai',
                'language': 'Tamil',
                'channel_type': 'news',
                'stream_type': 'youtube',
                'stream_url': 'https://www.youtube.com/@SunNews',
                'website_url': 'https://www.sunnewstamil.com',
                'youtube_channel': '@SunNews',
                'description': 'Sun News - Tamil News Channel',
                'is_active': True,
                'is_verified': True,
            },
            {
                'name': 'Sathiyam TV',
                'slug': 'sathiyam-tv',
                'country': 'India',
                'state': 'Tamil Nadu',
                'city': 'Chennai',
                'language': 'Tamil',
                'channel_type': 'news',
                'stream_type': 'youtube',
                'stream_url': 'https://www.youtube.com/@SathiyamTVOfficial',
                'website_url': 'https://www.sathiyamtv.com',
                'youtube_channel': '@SathiyamTVOfficial',
                'description': 'Sathiyam TV - Breaking News and Analysis',
                'is_active': True,
                'is_verified': True,
            },

            # National News Channels (English)
            {
                'name': 'NDTV',
                'slug': 'ndtv',
                'country': 'India',
                'state': 'Tamil Nadu',
                'city': 'Chennai',
                'language': 'English',
                'channel_type': 'news',
                'stream_type': 'youtube',
                'stream_url': 'https://www.youtube.com/@NDTV',
                'website_url': 'https://www.ndtv.com',
                'youtube_channel': '@NDTV',
                'description': 'NDTV - Breaking News, Latest News in India',
                'is_active': True,
                'is_verified': True,
            },
            {
                'name': 'India Today',
                'slug': 'india-today',
                'country': 'India',
                'state': 'Tamil Nadu',
                'city': 'Chennai',
                'language': 'English',
                'channel_type': 'news',
                'stream_type': 'youtube',
                'stream_url': 'https://www.youtube.com/@IndiaToday',
                'website_url': 'https://www.indiatoday.in',
                'youtube_channel': '@IndiaToday',
                'description': 'India Today - News, Analysis, and Features',
                'is_active': True,
                'is_verified': True,
            },
            {
                'name': 'Times Now',
                'slug': 'times-now',
                'country': 'India',
                'state': 'Tamil Nadu',
                'city': 'Chennai',
                'language': 'English',
                'channel_type': 'news',
                'stream_type': 'youtube',
                'stream_url': 'https://www.youtube.com/@TimesNow',
                'website_url': 'https://www.timesnownavbharat.com',
                'youtube_channel': '@TimesNow',
                'description': 'Times Now - Breaking News, Live Coverage',
                'is_active': True,
                'is_verified': True,
            },
            {
                'name': 'CNN News18',
                'slug': 'cnn-news18',
                'country': 'India',
                'state': 'Tamil Nadu',
                'city': 'Chennai',
                'language': 'English',
                'channel_type': 'news',
                'stream_type': 'youtube',
                'stream_url': 'https://www.youtube.com/@CNNNews18',
                'website_url': 'https://www.cnnnews18.com',
                'youtube_channel': '@CNNNews18',
                'description': 'CNN News18 - Latest News and Updates',
                'is_active': True,
                'is_verified': True,
            },
            {
                'name': 'ABP News',
                'slug': 'abp-news',
                'country': 'India',
                'state': 'Tamil Nadu',
                'city': 'Chennai',
                'language': 'English',
                'channel_type': 'news',
                'stream_type': 'youtube',
                'stream_url': 'https://www.youtube.com/@ABPNews',
                'website_url': 'https://www.abpnews.com',
                'youtube_channel': '@ABPNews',
                'description': 'ABP News - Breaking News and Analysis',
                'is_active': True,
                'is_verified': True,
            },

            # Weather & Climate Channels
            {
                'name': 'Weather India',
                'slug': 'weather-india',
                'country': 'India',
                'state': 'Tamil Nadu',
                'city': 'Chennai',
                'language': 'English',
                'channel_type': 'weather',
                'stream_type': 'youtube',
                'stream_url': 'https://www.youtube.com/@WeatherIndia',
                'website_url': 'https://weatherindia.in',
                'youtube_channel': '@WeatherIndia',
                'description': 'Weather India - Weather Forecasts and Updates',
                'is_active': True,
                'is_verified': True,
            },
            {
                'name': 'India Meteorological Department',
                'slug': 'imd-india',
                'country': 'India',
                'state': 'Tamil Nadu',
                'city': 'Chennai',
                'language': 'English',
                'channel_type': 'weather',
                'stream_type': 'youtube',
                'stream_url': 'https://www.youtube.com/@IMD_India',
                'website_url': 'https://www.imd.gov.in',
                'youtube_channel': '@IMD_India',
                'description': 'Official India Meteorological Department - Weather Updates',
                'is_active': True,
                'is_verified': True,
            },

            # International News Channels
            {
                'name': 'BBC News',
                'slug': 'bbc-news',
                'country': 'India',
                'state': 'Tamil Nadu',
                'city': 'Chennai',
                'language': 'English',
                'channel_type': 'news',
                'stream_type': 'youtube',
                'stream_url': 'https://www.youtube.com/@BBCNews',
                'website_url': 'https://www.bbc.com/news',
                'youtube_channel': '@BBCNews',
                'description': 'BBC News - World News and Breaking Stories',
                'is_active': True,
                'is_verified': True,
            },
            {
                'name': 'Reuters',
                'slug': 'reuters',
                'country': 'India',
                'state': 'Tamil Nadu',
                'city': 'Chennai',
                'language': 'English',
                'channel_type': 'news',
                'stream_type': 'youtube',
                'stream_url': 'https://www.youtube.com/@Reuters',
                'website_url': 'https://www.reuters.com',
                'youtube_channel': '@Reuters',
                'description': 'Reuters - International News and Breaking Stories',
                'is_active': True,
                'is_verified': True,
            },
        ]

        # Create or update channels
        created_count = 0
        updated_count = 0

        for channel_data in channels_data:
            slug = channel_data.pop('slug')
            channel, created = NewsChannel.objects.update_or_create(
                slug=slug,
                defaults=channel_data
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created: {channel.name}')
                )
            else:
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'Updated: {channel.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n✅ Successfully created {created_count} and updated {updated_count} news channels!'
            )
        )
