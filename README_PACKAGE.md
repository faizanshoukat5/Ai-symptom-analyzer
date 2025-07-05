# AI Medical Symptom Checker

## Installation

```bash
# Install dependencies
npm install

# Setup backend dependencies
npm run setup:backend

# Start development server
npm run dev

# Start full stack (frontend + backend)
npm run start:full
```

## Available Scripts

### Development
- `npm run dev` - Start Vite development server
- `npm run start:backend` - Start FastAPI backend
- `npm run start:full` - Start both frontend and backend

### Building
- `npm run build` - Build for production
- `npm run build:production` - Build with linting and type checking
- `npm run preview` - Preview production build

### Testing
- `npm test` - Run tests with Vitest
- `npm run test:coverage` - Run tests with coverage
- `npm run test:ui` - Run tests with UI

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier

### Deployment
- `npm run firebase:deploy` - Deploy to Firebase
- `npm run railway:deploy` - Deploy to Railway

### Maintenance
- `npm run clean` - Clean build artifacts
- `npm run deps:update` - Update dependencies
- `npm run security:audit` - Security audit

## Environment Variables

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=your-firebase-key
VITE_FIREBASE_PROJECT_ID=ai-symptom-analyzer
```

## Project Structure

```
src/
├── components/          # React components
├── services/           # API services
├── utils/             # Utility functions
├── config/            # Configuration
├── types/             # TypeScript types
└── styles/            # CSS and styling
```

## Features

- ✅ AI-powered symptom analysis
- ✅ Multiple medical AI models
- ✅ Real-time analysis
- ✅ Responsive design
- ✅ Dark/light theme
- ✅ PWA support
- ✅ TypeScript support
- ✅ Modern tooling
