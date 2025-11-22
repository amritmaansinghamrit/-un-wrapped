# Quick Deploy Guide

## Prerequisites
✅ Vercel account connected to GitHub
✅ Railway account connected to GitHub

## Step 1: Deploy Backend to Railway

1. Go to https://railway.app/dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `unwrapped` repository
5. Railway will auto-detect the project

### Configure Environment Variables in Railway:

Click on your service → Variables → Add all these:

```env
PORT=3001
NODE_ENV=production
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
ALLOWED_ORIGINS=https://YOUR_VERCEL_URL.vercel.app
```

### Configure Build Settings:

- **Root Directory**: `backend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`
- **Watch Paths**: `backend/**`

6. Click "Deploy"
7. Copy the Railway URL (e.g., `https://unwrapped-production.up.railway.app`)

## Step 2: Deploy Frontend to Vercel

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your `unwrapped` repository
4. Configure:

### Framework Preset: Next.js

### Root Directory: `frontend`

### Build Settings:
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### Environment Variables:

Add these in Vercel dashboard:

```env
NEXT_PUBLIC_API_URL=https://YOUR_RAILWAY_URL.railway.app
NEXT_PUBLIC_SOCKET_URL=https://YOUR_RAILWAY_URL.railway.app
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id
```

5. Click "Deploy"
6. Wait for deployment to complete

## Step 3: Update CORS

Once you have your Vercel URL, go back to Railway:

1. Edit the `ALLOWED_ORIGINS` variable
2. Update it to: `https://your-vercel-url.vercel.app`
3. Redeploy the backend

## Step 4: Test!

1. Visit your Vercel URL
2. Open it in two browser windows
3. Create a session in one window
4. Join with the code in the other window
5. Complete the experience!

## Troubleshooting

### Backend not connecting?
- Check Railway logs
- Verify all environment variables are set
- Make sure PORT is set to 3001

### WebSocket errors?
- Railway supports WebSockets by default
- Check CORS settings
- Verify NEXT_PUBLIC_SOCKET_URL is correct

### Spotify not working?
- Check credentials are correct
- View backend logs for errors
- Test the `/api/spotify/search` endpoint directly

### Images not uploading?
- Make sure Cloudinary credentials are set
- Check CLOUDINARY_CLOUD_NAME is correct
- View network tab for errors

## Your URLs

After deployment, save these:

- **Frontend**: https://YOUR_APP.vercel.app
- **Backend**: https://YOUR_APP.up.railway.app
- **API**: https://YOUR_APP.up.railway.app/api
- **WebSocket**: wss://YOUR_APP.up.railway.app

## Custom Domain (Optional)

### For Frontend (Vercel):
1. Go to your project settings
2. Domains → Add Domain
3. Enter `wrapped.in`
4. Follow DNS instructions

### For Backend (Railway):
1. Project Settings → Domains
2. Generate Domain or add custom
3. Use `api.wrapped.in`

## Cost Estimate

**Free Tier:**
- Vercel: Free for hobby projects
- Railway: $5/month credit (no card required initially)

This setup should handle thousands of users!
