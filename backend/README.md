# Care for the Needy Patients - Backend API

Backend API for the Clinical Trial Finder platform. Built with Node.js, Express, and Firebase Firestore.

## Features

- **Trial Search API** - Search trials by condition, keyword, state, phase, status
- **CTRI Data Sync** - Automated scraping and syncing of CTRI trial data
- **User Management** - Firebase Authentication integration
- **Report System** - Report incorrect or suspicious listings
- **Alert Subscriptions** - Email alerts for new matching trials
- **Geocoding** - Location-based search with distance calculation
- **Rate Limiting** - API protection against abuse
- **Audit Logging** - Complete audit trail for all operations

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your Firebase credentials:

```bash
cp .env.example .env
```

### 3. Run the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 4. Run CTRI Sync

```bash
# Sync recruiting trials
npm run sync:ctri

# Full sync (all trials)
npm run sync:ctri:full
```

### 5. Maintenance Scripts

```bash
# Re-clean the stored `condition` values after an importer change
node scripts/repairConditions.js --dry-run   # preview
node scripts/repairConditions.js             # apply

# Seed the home page image metadata (Firestore `siteImages`)
node scripts/seedSiteImages.js
```

The ICTRP `Condition` field is normalised by `src/utils/condition.js`, which
strips "Health Condition N:" slot labels, ICD-10 codes and WHO study-domain
labels (`O- Medical and Surgical`, `1- Obstetrics`). It is covered by
`npm test` in this folder.

## API Endpoints

### Trials

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trials` | Search trials with filters |
| GET | `/api/trials/recruiting` | Get recruiting trials |
| GET | `/api/trials/stats` | Get trial statistics (conditions ranked by frequency, cached ~10 min) |
| GET | `/api/trials/:id` | Get trial by ID |
| POST | `/api/trials` | Create trial (admin) |
| PUT | `/api/trials/:id` | Update trial (admin) |
| DELETE | `/api/trials/:id` | Delete trial (admin) |

### Images

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/images` | Home page image metadata from the `siteImages` collection |

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/verify` | Verify Firebase token |
| GET | `/api/auth/me` | Get current user |

### Sync

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sync/ctri` | Trigger CTRI sync (admin) |
| GET | `/api/sync/status` | Get sync status |

### Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reports` | Submit a report |
| GET | `/api/reports` | Get all reports (admin) |
| PUT | `/api/reports/:id` | Update report (admin) |

### Alerts

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/alerts` | Create alert subscription |
| DELETE | `/api/alerts/:id` | Unsubscribe |
| GET | `/api/alerts/verify/:token` | Verify subscription |

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Express middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── services/         # Business logic services
│   ├── utils/            # Utility functions
│   └── server.js         # Entry point
├── scripts/              # CLI scripts
├── logs/                 # Log files
├── .env                  # Environment variables
├── .env.example          # Environment template
└── package.json
```

## Data Flow

```
CTRI Website → Scraper Service → Raw Data → Validation → Firestore → API → Frontend
```

## Security

- Firebase Authentication for admin access
- Rate limiting on all API endpoints
- Helmet.js for security headers
- CORS configuration
- Input validation with express-validator

## License

Social initiative project for patient awareness.
