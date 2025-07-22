# Lab Management System

## Overview

This is a comprehensive laboratory internal operations management system built with React (frontend) and Express (backend). The application manages various aspects of laboratory operations including equipment, glassware, chemicals, documents, training, MSDS, task tracking, and quality assurance samples. The system features a modern web interface with Thai language support and is designed for laboratory environments requiring compliance with quality standards.

## User Preferences

Preferred communication style: Simple, everyday language.
UI Theme: Soft green, minimal design theme requested for entire website.

## System Architecture

The application follows a full-stack architecture with:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful API with JSON responses
- **Validation**: Zod schemas shared between frontend and backend

## Key Components

### Database Schema
The system manages eight core entities:
- **Tools**: Equipment tracking with comprehensive calibration management and results recording
- **Glassware**: Laboratory glassware inventory with calibration tracking and results recording
- **Chemicals**: Chemical inventory with expiry and safety tracking
- **Documents**: Document management with categorization
- **Training**: Staff training and assessment records
- **MSDS**: Material Safety Data Sheets management
- **Tasks**: Task tracking and project management
- **QA Samples**: Quality assurance sample tracking

### Key Features Added (July 2025)
- **Calibration Results Recording**: Both Tools and Glassware modules now include detailed calibration result tracking:
  - Calibration result status (ผ่าน/ไม่ผ่าน/ปรับเทียบ)
  - Certificate numbers and responsible parties
  - Calibration methods and detailed remarks
  - Integrated into form interfaces with organized sections

- **Advanced Tool & Glassware Details with Calibration History (July 21, 2025)**:
  - **Enhanced ViewDetailsModal**: Comprehensive information display for tools and glassware with proper field organization
  - **5-Year Calibration History**: Historical tracking of calibration results with pass/fail status visualization
  - **Repair Status Tracking**: Clear indication when equipment is sent for repair with color-coded badges
  - **Database Schema Enhancement**: Added dedicated calibration history tables for both tools and glassware
  - **API Integration**: Complete backend support for calibration history retrieval and management

- **Automatic Calibration History Creation (July 22, 2025)**:
  - **Auto History Records**: System automatically creates calibration history records when tools/glassware are added or updated with calibration data
  - **Historical Tracking**: All calibration changes are automatically logged with timestamps and details
  - **Visual History Display**: CalibrationHistoryTable component displays complete calibration history with color-coded status indicators
  - **Data Integrity**: Prevents duplicate history entries and maintains chronological order

- **Task Tracker DateTime Fix & Work Step Approval System (July 22, 2025)**:
  - **DateTime Validation Fix**: Resolved "Invalid datetime" error when editing tasks by implementing proper form schema with string dates and API transformation
  - **Form Schema Separation**: Created separate form schema for frontend (string dates) and API schema transformation for backend compatibility
  - **Work Step Approval**: Added comprehensive work step display with individual approval buttons and date tracking in task details view
  - **Enhanced Task Details**: Task details modal now shows all subtasks with approval status, responsible parties, and approval timestamps
  - **QA Test Results Fix**: Corrected schema validation issues for QA test result entry and editing functionality

- **Enhanced Status Management System (July 21, 2025)**:
  - **Multi-select Chip Filtering**: Users can now select multiple status filters simultaneously across all data tables
  - **Color-coded Status Display**: Comprehensive color system with both badges and row background colors:
    - Red: Expired items, failed tests, cancelled tasks
    - Yellow/Orange: Items nearing expiry, pending tasks, inactive equipment
    - Green: Normal status, passed tests, completed tasks, active equipment
    - Blue: In-progress items, received samples, equipment under repair
  - **Consistent Status Mapping**: Standardized status values across all modules (tools, glassware, chemicals, training, documents, MSDS, tasks, QA samples)
  - **Dark Mode Support**: All color schemes work seamlessly in both light and dark themes
  - **Simplified Document Interface**: Removed chip filters from documents page, maintaining only dropdown category selection

### Frontend Components
- **Dashboard**: Central overview with statistics and quick access
- **Data Tables**: Advanced reusable table component with:
  - Multi-select status filtering with chip interface
  - Color-coded row backgrounds based on item status
  - Search, pagination, and CRUD operations
  - Status-based visual indicators and badges
- **Modal Forms**: Form modals for creating and editing records
- **Navigation**: Sidebar navigation with collapsible menu items
- **UI Components**: Complete set of accessible UI components from shadcn/ui with custom lab-specific styling

### Backend Services
- **Storage Layer**: Abstract storage interface with CRUD operations
- **Route Handlers**: Express routes for each entity with proper error handling
- **Validation**: Request validation using Zod schemas
- **Development Server**: Vite integration for seamless development experience

## Data Flow

1. **Client Requests**: React components use TanStack Query to make API calls
2. **API Layer**: Express routes handle requests and validate input
3. **Data Layer**: Storage interface abstracts database operations
4. **Database**: Drizzle ORM manages PostgreSQL interactions
5. **Response**: JSON responses are returned to the client
6. **State Management**: TanStack Query caches and manages server state

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL driver
- **drizzle-orm**: TypeScript ORM for PostgreSQL
- **@tanstack/react-query**: Server state management
- **react-hook-form**: Form handling and validation
- **zod**: Runtime type validation
- **wouter**: Lightweight React router

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **date-fns**: Date manipulation utilities

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **esbuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Development
- **Frontend**: Vite development server with hot module replacement
- **Backend**: Node.js with tsx for TypeScript execution
- **Database**: Neon Database with connection pooling
- **Environment**: Environment variables for database configuration

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Static Serving**: Express serves frontend assets in production
- **Database**: PostgreSQL migrations managed by Drizzle Kit

### Configuration
- **Database**: Uses `DATABASE_URL` environment variable
- **Build**: Separate build commands for frontend and backend
- **Deployment**: Single Node.js process serves both frontend and API

The system is designed for modern laboratory environments requiring digital transformation of manual processes while maintaining compliance with quality management standards like ISO 17025.