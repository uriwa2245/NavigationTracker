# Navigation Tracker - Laboratory Management System

A comprehensive laboratory management system built with React, TypeScript, and Express.js.

## Features

- **Dashboard**: Overview of laboratory statistics and pending tasks
- **Tools Management**: Track tools, calibration history, and maintenance schedules
- **Glassware Management**: Manage glassware inventory and calibration
- **Chemical Management**: Track chemical inventory and safety information
- **Document Management**: Organize laboratory documents and procedures
- **Training Management**: Track staff training and certifications
- **MSDS Management**: Material Safety Data Sheet management
- **Task Tracker**: Task assignment and approval workflow
- **QA Sample Management**: Quality assurance sample tracking
- **QA Test Results**: Test result recording and analysis

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Radix UI
- **Backend**: Express.js, TypeScript
- **State Management**: TanStack Query (React Query)
- **Form Handling**: React Hook Form with Zod validation
- **Database**: In-memory storage (can be extended to use external databases)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd NavigationTracker
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp env.example .env
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type checking
- `npm run vercel-build` - Build for Vercel deployment

### Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility libraries
│   │   └── pages/         # Page components
│   └── index.html
├── server/                # Backend Express application
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Data storage layer
│   └── vite.ts           # Vite development setup
├── shared/               # Shared TypeScript schemas
├── api/                  # Vercel API functions
└── dist/                 # Build output
```

## Deployment

### Vercel Deployment

This application is configured for deployment on Vercel:

1. **Connect to Vercel**:
   - Install Vercel CLI: `npm i -g vercel`
   - Login: `vercel login`
   - Deploy: `vercel`

2. **Environment Variables**:
   - Set `NODE_ENV=production` in Vercel dashboard
   - Add any additional environment variables as needed

3. **Build Configuration**:
   - The `vercel.json` file is configured for both API and static file serving
   - API routes are served from `/api/*`
   - Static files are served from the root

4. **Automatic Deployment**:
   - Connect your GitHub repository to Vercel
   - Push to main branch triggers automatic deployment

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## API Endpoints

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Tools
- `GET /api/tools` - Get all tools
- `POST /api/tools` - Create new tool
- `GET /api/tools/:id` - Get specific tool
- `PATCH /api/tools/:id` - Update tool
- `DELETE /api/tools/:id` - Delete tool

### QA Samples
- `GET /api/qa-samples` - Get all QA samples
- `POST /api/qa-samples` - Create new QA sample
- `GET /api/qa-samples/:id` - Get specific QA sample
- `PATCH /api/qa-samples/:id` - Update QA sample
- `DELETE /api/qa-samples/:id` - Delete QA sample

### QA Test Results
- `GET /api/qa-test-results` - Get all test results
- `POST /api/qa-test-results` - Create new test result
- `GET /api/qa-test-results/:id` - Get specific test result
- `PUT /api/qa-test-results/:id` - Update test result
- `DELETE /api/qa-test-results/:id` - Delete test result

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details 