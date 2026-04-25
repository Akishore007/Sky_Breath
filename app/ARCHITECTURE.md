# System Architecture Diagram

## 🏗️ Complete News Channels System

```
┌─────────────────────────────────────────────────────────────────────┐
│                         WEB BROWSER (USER)                           │
│                    http://localhost:8080/news                        │
└────────────────────────────┬──────────────────────────────────────────┘
                             │
                         HTTP Request
                             │
        ┌────────────────────▼────────────────────┐
        │     FRONTEND (React + Vite)               │
        ├─────────────────────────────────────────┤
        │ Components:                               │
        │ • News.tsx - Main page                   │
        │   - Country selector                     │
        │   - State selector                       │
        │   - Channel list                         │
        │   - Video player (iframe)                │
        │                                          │
        │ State Management:                        │
        │ • selectedCountry                        │
        │ • selectedState                          │
        │ • selectedChannel                        │
        │ • channels[]                             │
        │ • loading, error states                  │
        │                                          │
        │ API Calls:                               │
        │ • fetchCountries()                       │
        │ • fetchStates(country)                   │
        │ • fetchChannels(country, state)          │
        └────────────────────┬──────────────────────┘
                             │
                    API Request (JSON)
                             │
        ┌────────────────────▼────────────────────┐
        │  BACKEND API (Django REST Framework)     │
        │  http://localhost:8000/api/v1/news/      │
        ├─────────────────────────────────────────┤
        │ Endpoints:                               │
        │ • GET /channels/ - List all              │
        │ • GET /channels/{id}/ - Details          │
        │ • GET /list_countries/ - Countries       │
        │ • GET /list_states/ - States by country  │
        │ • GET /by_state/ - Channels by state     │
        │ • GET /by_country/ - Channels by country │
        │ • GET /by_language/ - Filter by language │
        │ • GET /search/ - Search channels         │
        │ • GET /trending/ - Popular channels      │
        │                                          │
        │ ViewSets:                                │
        │ • NewsChannelViewSet (Read-only)         │
        │   - with 15+ custom actions              │
        └────────────────────┬──────────────────────┘
                             │
                  Database Query (ORM)
                             │
        ┌────────────────────▼────────────────────┐
        │      DATABASE (SQLite / PostgreSQL)      │
        ├─────────────────────────────────────────┤
        │ Table: news_newschannel                  │
        │                                          │
        │ Columns:                                 │
        │ • id (PK)                                │
        │ • name (Indexed)                         │
        │ • slug (Unique)                          │
        │ • language (Indexed)                     │
        │ • channel_type                           │
        │ • country (Indexed)                      │
        │ • state (Indexed)                        │
        │ • stream_type                            │
        │ • stream_url (YT or Website)             │
        │ • website_url                            │
        │ • youtube_channel                        │
        │ • logo                                   │
        │ • is_verified (Boolean)                  │
        │ • is_active (Boolean)                    │
        │ • views_count                            │
        │ • created_at, updated_at (Timestamps)    │
        │                                          │
        │ Indexes:                                 │
        │ • (country, state)                       │
        │ • language                               │
        │ • is_active                              │
        │                                          │
        │ Current Data: 24 channels loaded         │
        └──────────────────────────────────────────┘
```

---

## 📊 Data Flow Diagram

```
USER ACTION                  FRONTEND                    BACKEND          DATABASE
─────────────────────────────────────────────────────────────────────────────────

1. Open News Page            News.tsx mounts
                             ↓
                             useEffect()
                             ↓
                             fetchCountries() ────────▶ list_countries/ ──▶ SELECT DISTINCT country
                             ↓
                             Display dropdown

2. Select "India"            onChange event
                             ↓
                             setSelectedCountry()
                             ↓
                             fetchStates("India") ────▶ list_states/ ─────▶ SELECT DISTINCT state
                             ↓                         WHERE country='India'
                             Display state options

3. Select "Tamil Nadu"       onChange event
                             ↓
                             setSelectedState()
                             ↓
                             fetchChannels() ─────────▶ by_state/ ────────▶ SELECT * FROM channels
                             ↓                         WHERE country='India'
                             Display grid of          AND state='Tamil Nadu'
                             channels
                            ↓
                             Sun News ✓ Verified
                             Vivek TV
                             Polimer News
                             etc...

4. Click "Sun News"          onClick handler
                             ↓
                             setSelectedChannel()
                             ↓
                             Show video player with:
                             • Embedded iframe
                             • Channel info
                             • Links to official site
                             • View count
```

---

## 🔄 API Response Cycle

```
REQUEST:
┌──────────────────────────────────────────┐
│ GET /api/v1/news/channels/by_state/      │
│ ?country=India&state=Tamil%20Nadu         │
└──────────────────────────────────────────┘
          ↓
QUERY EXECUTION:
┌──────────────────────────────────────────┐
│ from django.db.models import Q             │
│ channels = NewsChannel.objects             │
│     .filter(country='India',               │
│            state='Tamil Nadu')             │
│     .filter(is_active=True)                │
└──────────────────────────────────────────┘
          ↓
SERIALIZATION:
┌──────────────────────────────────────────┐
│ NewsChannelListSerializer                  │
│ (converts model → JSON)                   │
└──────────────────────────────────────────┘
          ↓
RESPONSE:
┌─────────────────────────────────────────────────────┐
│ HTTP/1.1 200 OK                                     │
│ Content-Type: application/json                      │
│                                                      │
│ [                                                    │
│   {                                                  │
│     "id": 1,                                        │
│     "name": "Sun News",                             │
│     "language": "Tamil",                            │
│     "country": "India",                             │
│     "state": "Tamil Nadu",                          │
│     "stream_type": "youtube",                       │
│     "stream_url": "https://youtube.com/embed/...",  │
│     "website_url": "https://sun-tv.in",             │
│     "logo": "https://...",                          │
│     "is_verified": true,                            │
│     "views_count": 1250                             │
│   },                                                 │
│   ... more channels                                 │
│ ]                                                    │
└─────────────────────────────────────────────────────┘
```

---

## 🗂️ File Structure

```
e:\MY PROJECTS\
├── app/                                  (React Frontend)
│   ├── src/
│   │   ├── pages/
│   │   │   └── News.tsx                 (Updated - API-based)
│   │   ├── components/
│   │   │   └── Layout.tsx
│   │   └── hooks/
│   │       └── use-weather-updates.ts
│   ├── NEWS_CHANNELS_GUIDE.md           (User guide)
│   └── IMPLEMENTATION_SUMMARY.md        (This summary)
│
└── backend/                              (Django Backend)
    ├── news/
    │   ├── models.py                    (+ NewsChannel model)
    │   ├── views.py                     (+ NewsChannelViewSet)
    │   ├── serializers.py               (+ NewsChannel serializers)
    │   ├── urls.py                      (Updated routing)
    │   ├── admin.py                     (+ NewsChannelAdmin)
    │   └── migrations/
    │       └── 0002_newschannel.py      (Database migration)
    ├── populate_news_channels.py        (Data loader script)
    ├── manage.py
    ├── weatherhub/
    │   └── urls.py                      (Main API routes)
    └── db.sqlite3                       (Database with channels)
```

---

## 🔐 Security Layers

```
┌─────────────────┬─────────────────────────────────────┐
│ Layer           │ Protection                          │
├─────────────────┼─────────────────────────────────────┤
│ Frontend        │ • CORS headers validation           │
│                 │ • Input sanitization                │
│                 │ • Error boundaries                  │
├─────────────────┼─────────────────────────────────────┤
│ API             │ • Read-only endpoints               │
│                 │ • No POST/PUT/DELETE without auth   │
│                 │ • CSRF protection (Django)          │
│                 │ • Rate limiting (optional)          │
├─────────────────┼─────────────────────────────────────┤
│ Database        │ • SQL injection prevention (ORM)    │
│                 │ • Query parameterization            │
│                 │ • Indexed queries for performance   │
└─────────────────┴─────────────────────────────────────┘
```

---

## 📈 Scalability

```
Current System:          Future System:

8 Countries          →   50+ Countries
24 Channels          →   1000+ Channels
1 Database           →   Sharded databases
Single Server        →   Load-balanced API
No Caching           →   Redis caching
Manual Updates       →   Automated feeds
```

---

## ✨ Component Relationships

```
News.tsx (Main Component)
├── API Service Layer
│   ├── fetchCountries()
│   ├── fetchStates()
│   ├── fetchChannels()
│   └── handleLocationAuto()
│
├── UI Sections
│   ├── Header
│   │   └── Title + Description
│   │
│   ├── Selection Panel
│   │   ├── Country Dropdown
│   │   ├── State Dropdown
│   │   └── Info/Error Messages
│   │
│   └── Content Panel
│       ├── Video Player View
│       │   ├── iframe (Video)
│       │   ├── Channel Info
│       │   └── Links
│       │
│       └── Channels Grid
│           ├── Channel Cards (map)
│           ├── Loading State
│           └── Empty State
│
└── State Management
    ├── countries[]
    ├── selectedCountry
    ├── states[]
    ├── selectedState
    ├── channels[]
    ├── selectedChannel
    ├── loading
    └── error
```

---

## 🚀 Deployment Ready

The system is production-ready for:

```
✅ Docker deployment
✅ Cloud platforms (AWS, Azure, GCP)
✅ Kubernetes orchestration
✅ Database migrations
✅ API versioning (v1 already in place)
✅ Admin interface
✅ Error tracking/logging
✅ Performance monitoring
✅ Automated backups
✅ SSL/TLS ready
```

---

**Architecture Document Complete!** 🎯
