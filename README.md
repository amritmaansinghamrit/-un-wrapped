# (un)wrapped

A 25-minute interactive experience for two people that creates a unique, algorithmically-generated visual pattern from their shared responses.

## Project Structure

```
unwrapped/
├── frontend/          # Next.js React application
├── backend/           # Express + Socket.io server
└── package.json       # Root package.json (workspace)
```

## Tech Stack

### Frontend
- Next.js 14 with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- Socket.io client for real-time
- P5.js for pattern generation
- Web Audio API for voice recording

### Backend
- Node.js with Express
- Socket.io for WebSockets
- PostgreSQL for data
- Redis for session management
- AWS S3/Cloudinary for media storage

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Run development servers:
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Domain

**Production:** wrapped.in

## Timeline

Available November 15 - February 14

## Development Phases

- **Phase 1 (MVP):** Session management, Quick Picks, basic reveal
- **Phase 2 (Core):** All 5 activities, media upload
- **Phase 3 (Pattern):** Pattern generation algorithm
- **Phase 4 (Polish):** Animations, optimization, testing
