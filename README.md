# Care for the Needy Patients

A React-based web application to help patients find clinical trials in India. This platform simplifies access to CTRI (Clinical Trials Registry - India) data for recruiting studies.

## Features

- **Search Clinical Trials**: Find trials by disease, condition, drug, or location
- **Advanced Filtering**: Filter by condition, state, and trial phase
- **Detailed Trial Information**: View comprehensive trial details including eligibility criteria, outcomes, and contact information
- **Location-Based Results**: Find trials near you with site-specific contact details
- **User-Friendly Interface**: Designed for easy accessibility by common people
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Social Initiative

This is a social initiative in collaboration with **Bharat AI Research Center, Hisar**.

**Purpose**: This website is for **awareness only** - to help patients find clinical trial sites for their disease. It is **not for advertisement** purposes.

## Contact

- **Contact Person**: Ashish Tripathi
- **Email**: Ash.intas@gmail.com
- **Organization**: Bharat AI Research Center, Hisar

## Data Source

All trial data is sourced from the [Clinical Trials Registry - India (CTRI)](https://ctri.nic.in), maintained by the Indian Council of Medical Research (ICMR).

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository or navigate to the project directory:
   ```bash
   cd ctri-explorer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Building for Production

```bash
npm run build
```

## Technology Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router** - Navigation
- **CSS3** - Styling with custom properties
- **Axios** - HTTP client (for future API integration)

## Project Structure

```
ctri-explorer/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Watermark.tsx
│   │   └── TrialCard.tsx
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── SearchPage.tsx
│   │   ├── TrialDetailPage.tsx
│   │   ├── AboutPage.tsx
│   │   └── ContactPage.tsx
│   ├── data/
│   │   └── trials.ts
│   ├── App.tsx
│   ├── App.css
│   ├── index.tsx
│   └── index.css
├── package.json
└── tsconfig.json
```

## Firestore Setup

Trial data and patient queries are stored in **Cloud Firestore**.

1. The backend reads credentials from `backend/.env.backend`
   (see `backend/.env.example`).
2. Set `FIREBASE_PROJECT_ID`, `FIRESTORE_DATABASE_ID` and
   `GOOGLE_APPLICATION_CREDENTIALS` (path to a service-account JSON).
3. Never commit the service-account file, `.env.backend`, or any private key.
   Both are already listed in `.gitignore`.

Collections used by the app:

| Collection | Purpose |
|---|---|
| `trials` | Clinical trial listings shown on the website |
| `patientQueries` | Queries submitted through the patient form |
| `alerts`, `reports`, `users` | Supporting data |

## Admin Panel

The patient-query admin panel is available at `/admin`.

- Sign-in uses **Firebase Authentication** (email + password).
- Access requires the custom claim `role: "admin"`.
- Admins can search queries, update status
  (Pending → Contacted → Closed) and download a CSV for Excel.

Grant admin access to an account:

```bash
cd backend
node scripts/makeAdmin.js someone@example.com
```

The person must sign out and sign in again for the new role to apply.
On first use, click **"Forgot password?"** on the login page to set a password.

## Automated CTRI Sync (every 15 days)

CTRI's public search requires a CAPTCHA and its trial detail pages require a
login, so direct unattended scraping is not possible. The sync therefore uses
the **WHO ICTRP XML export**, which mirrors CTRI registrations and is refreshed
weekly.

Workflow: `.github/workflows/sync-ctri.yml`

- Runs daily at 02:00 UTC and only proceeds when `syncState/ctri.nextRunAt`
  is due, giving a 15-day interval.
- Scans the current and previous registration month.
- Imports only trials with `Recruitment_Status = Recruiting`, upserting by CTRI
  number (`trials` collection).
- `--prune` deletes trials in the scanned months that are no longer recruiting.
- `--refresh-existing --refresh-limit=100` re-checks a rotating slice of stored
  trials on every run and deletes any that have left the recruiting phase.

Manual backfill / testing:

```bash
# GitHub Actions
gh workflow run sync-ctri.yml -f scans="CTRI/2025/01,CTRI/2025/02" -f prune=true

# Local (uses backend/.env.backend credentials)
cd backend
node scripts/syncICTRP.js --scan=CTRI/2026/10 --dry-run
node scripts/syncICTRP.js --scan=CTRI/2026/10 --prune
node scripts/syncICTRP.js --refresh-existing --refresh-limit=50
```

In GitHub Actions, authentication uses Workload Identity Federation
(`github-deployer` service account) - no long-lived key is stored.

## Deployment

```bash
npm run build
firebase deploy --only hosting,functions
```

`firebase.json` rewrites `/api/**` to the `api` Cloud Function, so the
frontend and API are served from the same domain.

## Disclaimer

This platform is for **awareness purposes only**. It is not intended for advertisement or promotion of any specific trial or treatment. Always consult your healthcare provider before making any medical decisions.

## License

This project is created for social welfare purposes.
