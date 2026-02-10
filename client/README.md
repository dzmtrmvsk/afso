# AFSO Frontend

**Adaptive Field Service Orchestrator** - React frontend application built with TypeScript, Material-UI, and React Router.

## Overview

The AFSO frontend is a modern React application providing a user interface for field service management, including ticket management, queue visualization, and real-time updates.

### Technology Stack

- **Framework**: React 18 with TypeScript
- **UI Library**: Material-UI (MUI) 6.x
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Styling**: SCSS/SASS
- **Icons**: Material-UI Icons

## Prerequisites

- Node.js 20.19+ or 22.12+
- npm or yarn

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the root directory based on `.env.example`:

```bash
cp .env.example .env
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:3000/api` | Backend API base URL |

## Running the Application

### Development

```bash
npm run dev
```

Starts the development server with hot module replacement.

### Production Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic components (Button, Input, etc.)
│   ├── layout/         # Layout components (Header, Sidebar, etc.)
│   └── feature/        # Feature-specific components
├── pages/              # Page components (routes)
│   ├── Dashboard.tsx
│   ├── Tickets.tsx
│   └── ...
├── hooks/              # Custom React hooks
├── services/           # API services and utilities
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── styles/             # Global styles and themes
└── assets/             # Static assets (images, icons, etc.)
```

## Key Components (To Be Implemented)

- **Dashboard**: Main overview with statistics and queue status
- **Ticket List**: Queue management and ticket assignment
- **Ticket Detail**: Individual ticket management
- **Analytics**: Reports and performance metrics
- **User Management**: Admin panel for users and roles

## Routing Structure

```
/                    # Dashboard/Home
/dashboard          # Main dashboard
/tickets            # Ticket queue management
/tickets/:id        # Ticket detail view
/analytics          # Reports and analytics
/users             # User management (admin)
```

## Development Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## Code Style

- **Language**: TypeScript (strict mode enabled)
- **Component Style**: Functional components with hooks
- **Styling**: SCSS modules with Material-UI theming
- **State Management**: React hooks (useState, useEffect, etc.)
- **API Calls**: Custom hooks with Axios

## Material-UI Theme

The application uses a custom Material-UI theme with:

- Primary color: Blue (#1976d2)
- Secondary color: Pink (#dc004e)
- Light/dark mode support (to be implemented)

## HTTP Client Configuration

Axios is configured with:

- Base URL from environment variables
- Request/response interceptors
- Error handling
- Authentication headers

## Testing

Testing infrastructure will be added in future sprints.

## Deployment

### Build for Production

```bash
npm run build
```

This creates a `dist/` folder with optimized assets.

### Docker

A Dockerfile will be provided for containerized deployment.

## Contributing

1. Follow TypeScript and React best practices
2. Use Material-UI components when possible
3. Follow the established project structure
4. Ensure code passes linting
5. Test components in multiple browsers

## License

Apache-2.0
