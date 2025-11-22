# (un)wrapped - Setup Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- (Optional) PostgreSQL database
- (Optional) Redis server
- (Optional) Spotify API credentials

## Quick Start

### 1. Install Dependencies

```bash
# Install all dependencies (root, frontend, and backend)
npm install
```

### 2. Configure Environment Variables

#### Frontend (.env)
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id_optional
```

#### Backend (.env)
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000
```

### 3. Run Development Servers

From the root directory:

```bash
# Run both frontend and backend concurrently
npm run dev
```

Or run them separately:

```bash
# Terminal 1 - Frontend
npm run dev:frontend

# Terminal 2 - Backend
npm run dev:backend
```

### 4. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- WebSocket: ws://localhost:3001

## Project Structure

```
unwrapped/
├── frontend/                 # Next.js React application
│   ├── src/
│   │   ├── app/             # Next.js 14 app directory
│   │   │   ├── page.tsx     # Landing page
│   │   │   ├── enter/       # Username entry
│   │   │   ├── session-choice/  # Create or join
│   │   │   ├── create-session/
│   │   │   ├── join-session/
│   │   │   ├── waiting-room/
│   │   │   ├── activity/    # All 5 activities
│   │   │   ├── processing/  # Pattern generation
│   │   │   └── reveal/      # 10 reveal screens
│   │   ├── components/      # Reusable components
│   │   ├── lib/            # Utilities and helpers
│   │   ├── store/          # Zustand state management
│   │   ├── types/          # TypeScript types
│   │   └── data/           # Static data (questions, prompts)
│   └── package.json
│
├── backend/                  # Express + Socket.io server
│   ├── src/
│   │   ├── index.ts        # Server entry point
│   │   ├── routes/         # REST API routes
│   │   ├── socket/         # WebSocket handlers
│   │   ├── utils/          # Session store and helpers
│   │   └── types/          # TypeScript types
│   └── package.json
│
└── package.json             # Root workspace config
```

## Development Workflow

### Testing the Full Flow

1. **Open two browser windows** (or one normal + one incognito)

2. **User 1:**
   - Visit http://localhost:3000
   - Click "Start Session"
   - Enter a username
   - Click "Start New Session"
   - Copy the 6-digit code

3. **User 2:**
   - Visit http://localhost:3000
   - Click "Start Session"
   - Enter a different username
   - Click "Join Session"
   - Enter the code from User 1

4. **Both users:**
   - Click "I'm Ready!" in the waiting room
   - Complete all 5 activities together
   - View the generated pattern and reveal screens

### Activities Overview

1. **Quick Picks** (3-4 min): 7 rapid binary choice questions with 25s timer
2. **Your Sound** (5-6 min): 5 song selection prompts (mock Spotify for now)
3. **In Your Own Words** (4 min): 3 voice recordings (20s each)
4. **The Moments** (5 min): 5 photo uploads with color extraction
5. **Create Together** (4 min): Collaborative drawing + words + emojis

Total: ~25 minutes

## Features Implemented

### ✅ Core Features
- Session-based pairing with 6-digit codes
- Real-time WebSocket synchronization
- All 5 interactive activities
- Pattern generation algorithm
- 10 reveal screens with animations
- Mobile-first responsive design

### ✅ Frontend
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Framer Motion for animations
- Zustand for state management
- Socket.io client for real-time

### ✅ Backend
- Express server
- Socket.io for WebSockets
- In-memory session store (Redis-ready)
- REST API endpoints
- Session expiry (2 hours)

## Optional Integrations

### Spotify API

1. Create a Spotify app at https://developer.spotify.com/dashboard
2. Get your Client ID and Secret
3. Add to backend `.env`:
   ```env
   SPOTIFY_CLIENT_ID=your_client_id
   SPOTIFY_CLIENT_SECRET=your_client_secret
   ```
4. Implement OAuth flow in `backend/src/services/spotify.ts`

### File Storage (S3/Cloudinary)

For production, replace base64 encoding with proper file uploads:

1. Set up AWS S3 or Cloudinary account
2. Add credentials to backend `.env`
3. Implement upload logic in `backend/src/services/storage.ts`
4. Update activity endpoints to handle file uploads

### Database (PostgreSQL)

For persistent storage:

1. Install PostgreSQL
2. Create database: `createdb unwrapped`
3. Add connection string to `.env`
4. Implement models in `backend/src/models/`
5. Replace session store with database queries

## Building for Production

### Frontend

```bash
cd frontend
npm run build
npm run start
```

### Backend

```bash
cd backend
npm run build
npm run start
```

### Full Build

```bash
npm run build
```

## Deployment

### Frontend (Vercel recommended)

1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Backend (Railway/Render recommended)

1. Connect GitHub repository
2. Set environment variables
3. Configure start command: `npm run start`
4. Enable WebSocket support

### Domain Setup

- Frontend: `wrapped.in`
- Backend API: `api.wrapped.in`
- Update CORS and environment variables accordingly

## Troubleshooting

### WebSocket Connection Fails

- Check that backend is running on port 3001
- Verify `NEXT_PUBLIC_SOCKET_URL` in frontend `.env`
- Check CORS configuration in backend

### Sessions Not Persisting

- Sessions are in-memory and reset on server restart
- Implement Redis or PostgreSQL for persistence
- Check session expiry settings (default 2 hours)

### Pattern Generation Not Working

- Check canvas element is rendering
- Open browser console for errors
- Verify `processing` page is accessible

### Mobile Issues

- Test on actual devices, not just emulators
- Check touch events are working
- Verify responsive breakpoints

## Next Steps

### MVP Enhancements
1. Add session persistence (Redis/PostgreSQL)
2. Implement real Spotify API integration
3. Add proper file storage (S3/Cloudinary)
4. Improve pattern generation algorithm
5. Add download functionality for images
6. Implement optional account creation with OTP

### Future Features
1. Multiple pattern styles
2. Export to Instagram Stories templates
3. Session history for registered users
4. Custom themes and colors
5. More activity types
6. Analytics dashboard

## Support

For issues or questions:
- GitHub Issues: https://github.com/yourusername/unwrapped/issues
- Documentation: See README.md

## License

Private project - All rights reserved
