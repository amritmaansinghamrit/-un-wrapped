# Deployment Guide for (un)wrapped

## Production Deployment Checklist

### Frontend (Next.js)

#### Recommended: Vercel

1. **Connect Repository**
   - Go to vercel.com
   - Import your GitHub repository
   - Select the `frontend` directory as root

2. **Environment Variables**
   ```env
   NEXT_PUBLIC_API_URL=https://api.wrapped.in
   NEXT_PUBLIC_SOCKET_URL=https://api.wrapped.in
   NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_production_key
   ```

3. **Build Settings**
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Custom Domain**
   - Add custom domain: `wrapped.in`
   - Configure DNS records as instructed

#### Alternative: Self-Hosted

```bash
# Build
cd frontend
npm run build

# Start with PM2
pm2 start npm --name "unwrapped-frontend" -- start

# Or with Docker
docker build -t unwrapped-frontend .
docker run -p 3000:3000 unwrapped-frontend
```

### Backend (Express + Socket.io)

#### Recommended: Railway or Render

**Railway:**

1. **New Project**
   - Connect GitHub repository
   - Add PostgreSQL and Redis databases (optional)

2. **Environment Variables**
   ```env
   PORT=3001
   NODE_ENV=production
   ALLOWED_ORIGINS=https://wrapped.in
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   REDIS_URL=${{Redis.REDIS_URL}}
   ```

3. **Start Command**
   ```
   npm run start
   ```

4. **Enable WebSockets**
   - Railway supports WebSockets by default
   - No additional configuration needed

**Render:**

1. **New Web Service**
   - Connect repository
   - Root Directory: `backend`
   - Environment: Node

2. **Environment Variables** (same as above)

3. **Start Command**: `npm run start`

#### Alternative: Self-Hosted

```bash
# Build
cd backend
npm run build

# Start with PM2
pm2 start dist/index.js --name "unwrapped-backend"

# Or with Docker
docker build -t unwrapped-backend .
docker run -p 3001:3001 unwrapped-backend
```

### Database Setup (Optional but Recommended)

#### PostgreSQL

**Railway/Render:**
- Add PostgreSQL plugin/add-on
- Connection string automatically added to env

**Self-Hosted:**
```bash
# Install PostgreSQL
sudo apt-get install postgresql

# Create database
createdb unwrapped

# Run migrations (when implemented)
npm run migrate
```

#### Redis

**Railway/Render:**
- Add Redis plugin/add-on
- Connection string automatically added to env

**Self-Hosted:**
```bash
# Install Redis
sudo apt-get install redis-server

# Start Redis
redis-server
```

### File Storage

#### AWS S3

1. **Create S3 Bucket**
   ```bash
   # AWS CLI
   aws s3 mb s3://unwrapped-media
   ```

2. **Configure CORS**
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "POST", "PUT"],
       "AllowedOrigins": ["https://wrapped.in"],
       "ExposeHeaders": []
     }
   ]
   ```

3. **Add Environment Variables**
   ```env
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   AWS_BUCKET_NAME=unwrapped-media
   AWS_REGION=us-east-1
   ```

#### Alternative: Cloudinary

```env
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### Domain Configuration

#### DNS Records

**For wrapped.in:**

```
Type: A
Name: @
Value: [Vercel IP]

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**For api.wrapped.in:**

```
Type: CNAME
Name: api
Value: [Railway/Render domain]
```

#### SSL/TLS

- Vercel provides free SSL automatically
- Railway/Render provide free SSL
- For self-hosted: Use Let's Encrypt

### Monitoring & Logging

#### Error Tracking

**Sentry:**

```bash
npm install @sentry/nextjs @sentry/node
```

Frontend `sentry.client.config.js`:
```javascript
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

#### Analytics

**Vercel Analytics:**
```javascript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <>
      {children}
      <Analytics />
    </>
  )
}
```

### Performance Optimization

#### Frontend

1. **Enable Compression**
   - Vercel handles automatically
   - For self-hosted: Enable gzip in Next.js config

2. **Image Optimization**
   - Use Next.js Image component
   - Configure image domains in `next.config.js`

3. **Caching**
   - Configure `Cache-Control` headers
   - Use Vercel Edge Caching

#### Backend

1. **Rate Limiting**
   ```bash
   npm install express-rate-limit
   ```

   ```javascript
   import rateLimit from 'express-rate-limit'

   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 100
   })

   app.use('/api/', limiter)
   ```

2. **Compression**
   ```bash
   npm install compression
   ```

   ```javascript
   import compression from 'compression'
   app.use(compression())
   ```

### Security

#### Environment Variables

- Never commit `.env` files
- Use platform-specific secret management
- Rotate keys regularly

#### CORS

```javascript
// backend/src/index.ts
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true,
}))
```

#### Rate Limiting

- Implement on all API endpoints
- Different limits for different routes
- Consider IP-based and session-based limits

#### Input Validation

```bash
npm install joi
```

```javascript
import Joi from 'joi'

const schema = Joi.object({
  username: Joi.string().min(2).max(20).required(),
  code: Joi.string().length(6).required(),
})
```

### Backup Strategy

#### Database Backups

**Railway/Render:**
- Enable automatic backups
- Configure retention period

**Self-Hosted:**
```bash
# Daily backup cron
0 2 * * * pg_dump unwrapped > /backups/unwrapped-$(date +\%Y\%m\%d).sql
```

#### Media Backups

**S3:**
- Enable versioning
- Configure lifecycle policies
- Set up cross-region replication

### Monitoring

#### Uptime Monitoring

- Use UptimeRobot or Pingdom
- Monitor both frontend and backend
- Set up WebSocket endpoint monitoring

#### Performance Monitoring

- Vercel Analytics for frontend
- New Relic or DataDog for backend
- Monitor WebSocket connection stability

### CI/CD Pipeline

#### GitHub Actions

`.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./frontend

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway up
```

### Launch Checklist

- [ ] All environment variables configured
- [ ] Database migrations run
- [ ] SSL certificates active
- [ ] Custom domains configured
- [ ] Monitoring and logging set up
- [ ] Error tracking configured
- [ ] Backups scheduled
- [ ] Performance tested
- [ ] Security audit completed
- [ ] Load testing performed
- [ ] Documentation updated
- [ ] Team access configured

### Post-Launch

1. **Monitor first 24 hours closely**
2. **Check error logs frequently**
3. **Monitor WebSocket connection stability**
4. **Verify session management working**
5. **Test pattern generation at scale**
6. **Monitor file upload performance**

### Scaling Considerations

#### Horizontal Scaling

- Backend can be scaled horizontally
- Use sticky sessions for Socket.io
- Consider Redis adapter for Socket.io clustering

#### Database Scaling

- Connection pooling
- Read replicas for queries
- Caching layer (Redis)

#### CDN

- Use for static assets
- CloudFlare for DDoS protection
- Edge caching for API responses

### Cost Estimates

**Minimal (100 sessions/day):**
- Vercel Hobby: Free
- Railway: ~$5/month
- Total: ~$5/month

**Medium (1,000 sessions/day):**
- Vercel Pro: $20/month
- Railway: ~$20/month
- S3: ~$5/month
- PostgreSQL: Included
- Redis: Included
- Total: ~$45/month

**High (10,000+ sessions/day):**
- Vercel Enterprise: Custom
- Railway: ~$100/month or self-hosted
- AWS services: ~$100/month
- Total: ~$200+/month
