# Deployment Guide

## Overview
This guide covers deploying the Notes Frontend application to various platforms.

---

## Pre-Deployment Checklist

- [ ] All features tested locally
- [ ] Environment variables documented
- [ ] Backend API is deployed and accessible
- [ ] CORS configured on backend
- [ ] Build completes without errors
- [ ] All dependencies up to date
- [ ] `.env.local.example` is up to date
- [ ] README updated with deployment info

---

## Environment Variables

Required for all deployments:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-backend-api.com/api
```

**Important:** The `NEXT_PUBLIC_` prefix makes the variable accessible in the browser.

---

## Option 1: Vercel (Recommended)

Vercel is the company behind Next.js and offers the best integration.

### Quick Deploy

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Set Environment Variables:**
   ```bash
   vercel env add NEXT_PUBLIC_API_BASE_URL production
   ```
   Enter your production API URL when prompted.

5. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

### Via GitHub Integration

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Configure:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. Add environment variables:
   - `NEXT_PUBLIC_API_BASE_URL`
7. Click "Deploy"

### Custom Domain
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

---

## Option 2: Netlify

### Via CLI

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

4. **Set Environment Variables:**
   - Go to Site Settings → Environment Variables
   - Add `NEXT_PUBLIC_API_BASE_URL`

### Via GitHub Integration

1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "New site from Git"
4. Select repository
5. Configure:
   - Build Command: `npm run build`
   - Publish Directory: `.next`
6. Add environment variables
7. Click "Deploy site"

---

## Option 3: AWS Amplify

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Click "New App" → "Host web app"
3. Connect to GitHub
4. Select repository and branch
5. Configure build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```
6. Add environment variables
7. Save and deploy

---

## Option 4: Docker

### Dockerfile

```dockerfile
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_BASE_URL=http://your-backend:8000/api
    restart: unless-stopped
```

### Build and Run

```bash
# Build image
docker build -t notes-frontend .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_BASE_URL=https://your-api.com/api \
  notes-frontend
```

---

## Option 5: Traditional VPS (Ubuntu)

### Prerequisites

- Ubuntu 20.04+ server
- Node.js 18+ installed
- Nginx installed
- Domain name pointed to server

### Setup Steps

1. **Clone repository:**
   ```bash
   cd /var/www
   git clone https://github.com/your-username/notes-frontend.git
   cd notes-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm ci
   ```

3. **Create environment file:**
   ```bash
   nano .env.local
   ```
   Add:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-api.com/api
   ```

4. **Build:**
   ```bash
   npm run build
   ```

5. **Start with PM2:**
   ```bash
   # Install PM2
   npm install -g pm2

   # Start app
   pm2 start npm --name "notes-frontend" -- start

   # Save PM2 config
   pm2 save
   pm2 startup
   ```

6. **Configure Nginx:**
   ```bash
   sudo nano /etc/nginx/sites-available/notes-frontend
   ```

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/notes-frontend /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

7. **Setup SSL with Certbot:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

## Post-Deployment

### Verify Deployment

1. Visit your deployed URL
2. Test user registration
3. Test login
4. Test CRUD operations
5. Test version history
6. Check browser console for errors
7. Test on mobile devices

### Monitoring

1. **Check logs:**
   - Vercel: Project → Deployments → View logs
   - PM2: `pm2 logs notes-frontend`
   - Docker: `docker logs container-id`

2. **Performance monitoring:**
   - Use Vercel Analytics
   - Setup Google Analytics
   - Monitor Core Web Vitals

### Security

1. **HTTPS:** Always use HTTPS in production
2. **CORS:** Configure backend CORS properly
3. **Environment Variables:** Never commit `.env.local`
4. **Dependencies:** Keep packages updated
5. **Headers:** Setup security headers in `next.config.js`

---

## CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        env:
          NEXT_PUBLIC_API_BASE_URL: ${{ secrets.NEXT_PUBLIC_API_BASE_URL }}
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Environment Variables Not Working

- Ensure they start with `NEXT_PUBLIC_`
- Rebuild after changing env vars
- Check platform-specific env var settings

### Backend Connection Issues

- Verify CORS settings on backend
- Check API URL is correct
- Ensure backend is accessible from deployment
- Check network/firewall settings

### Performance Issues

- Enable Next.js caching
- Optimize images
- Use CDN for static assets
- Enable compression in Nginx

---

## Rollback

### Vercel
```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]
```

### PM2
```bash
# Restore previous version
git checkout previous-commit
npm install
npm run build
pm2 restart notes-frontend
```

### Docker
```bash
# Use previous image tag
docker run -p 3000:3000 notes-frontend:previous-tag
```

---

## Best Practices

1. **Use environment variables** for all configuration
2. **Test builds locally** before deploying
3. **Setup monitoring** and alerts
4. **Enable automatic deployments** from main branch
5. **Use staging environment** for testing
6. **Keep dependencies updated**
7. **Monitor performance metrics**
8. **Setup error tracking** (Sentry, LogRocket)
9. **Regular backups** if using VPS
10. **Document deployment process**

---

## Need Help?

- Next.js Deployment Docs: https://nextjs.org/docs/deployment
- Vercel Docs: https://vercel.com/docs
- Contact DevOps team
- Check platform status pages

---

Happy deploying! 🚀
