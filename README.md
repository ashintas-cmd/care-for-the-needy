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

## Disclaimer

This platform is for **awareness purposes only**. It is not intended for advertisement or promotion of any specific trial or treatment. Always consult your healthcare provider before making any medical decisions.

## License

This project is created for social welfare purposes.
