# Deployment Guide

Instructions for deploying Pickabook to production.

## Pre-Deployment Checklist

- [x] Build succeeds locally: `npm run build`
- [x] No TypeScript errors: `npm run typecheck`
- [x] All dependencies installed: `npm install`
- [x] Environment variables documented: `.env.example`
- [x] API integration tested
- [x] UI responsive on mobile

## Environment Variables Required

```bash
REPLICATE_API_TOKEN=your_token_here
```

Get your token from: https://replicate.com/account/api-tokens

## Platform-Specific Instructions

### Vercel (Recommended)

**Deployment Steps:**

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Select your GitHub repository
5. Configure:
   - **Framework**: Next.js
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**: Add `REPLICATE_API_TOKEN`
6. Click "Deploy"

**Configuration:**

Add to `vercel.json`:
```json
{
  "functions": {
    "app/api/personalize/route.ts": {
      "maxDuration": 60
    }
  }
}
```

**Required Plan**: Pro ($20/month) for 60-second function timeout
- Free tier has 10-second limit (too short for AI processing)
- Pro tier allows up to 60 seconds

**Post-Deployment:**
- Test with sample photo
- Verify timeout is sufficient
- Monitor function execution times

---

### Railway (Best Free Option)

**Deployment Steps:**

1. Go to [railway.app](https://railway.app)
2. Create new project
3. Select "Deploy from GitHub"
4. Select your repository
5. Configure:
   - **Environment Variables**: Add `REPLICATE_API_TOKEN`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
6. Deploy

**Advantages:**
- $5 free monthly credit
- Generous timeout limits
- Good performance

**Post-Deployment:**
- Access via Railway dashboard URL
- Monitor usage in Railway dashboard

---

### Render

**Deployment Steps:**

1. Go to [render.com](https://render.com)
2. Click "New +"
3. Select "Web Service"
4. Connect GitHub
5. Configure:
   - **Name**: pickabook
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**: Add `REPLICATE_API_TOKEN`
6. Create Web Service

**Advantages:**
- Free tier available
- Good uptime
- Easy management

---

### Docker (Any Cloud Provider)

**Dockerfile:**
```dockerfile
FROM node:18-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

**Build and Run Locally:**
```bash
docker build -t pickabook .
docker run -p 3000:3000 -e REPLICATE_API_TOKEN=your_token pickabook
```

**Deploy to Cloud:**
- AWS ECS
- Google Cloud Run
- Azure Container Instances
- DigitalOcean App Platform

---

## Performance Optimization

### Build Optimization (Already Configured)

```javascript
// next.config.js
{
  swcMinify: true,           // Faster minification
  compress: true,             // Gzip compression
  productionBrowserSourceMaps: false, // Reduce bundle size
}
```

### Runtime Optimization

**Database Caching (Future):**
```typescript
// Cache generated images to reduce API costs
const cacheKey = generateHash(imageBuffer);
const cached = await supabase
  .from('personalizations')
  .select('result_url')
  .eq('image_hash', cacheKey)
  .single();
```

**Image Preprocessing:**
```typescript
// Resize large images before sending to AI
const optimized = await sharp(buffer)
  .resize(1024, 1024, { fit: 'cover' })
  .jpeg({ quality: 85 })
  .toBuffer();
```

---

## Monitoring & Debugging

### Application Monitoring

**Recommended Tools:**
- Vercel Analytics (built-in)
- Sentry (error tracking)
- LogRocket (session replay)
- New Relic (performance)

**Setup Sentry:**
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### Log Analysis

**Check server logs for:**
```
"Calling Replicate API" - AI service called
"AI generation successful" - Model completed
"Compositing onto template" - Image processing working
"Personalization completed" - Success
```

**Common errors to watch:**
- "REPLICATE_API_TOKEN not set" - Env var missing
- "Request timeout" - API taking too long
- "File too large" - Upload size limit exceeded

### Performance Monitoring

**Key Metrics to Track:**
- API response time (target: 30-60 seconds)
- Frontend response time (target: <100ms)
- Error rate (target: <1%)
- Cost per generation (track Replicate spend)

---

## Cost Estimation

### Monthly Costs

**Replicate API** (1,000 generations/month):
- Face-to-sticker model: ~$5
- Reasonable for prototype usage

**Hosting:**
| Platform | Cost | Notes |
|----------|------|-------|
| Vercel Pro | $20 | Required for 60s timeout |
| Railway | $0-5 | Free tier + pay per use |
| Render | $0-10 | Free tier available |

**Total Minimum:** ~$5/month (Railway free tier)
**Recommended:** ~$25/month (Vercel Pro + Replicate)

### Scaling Costs

| Scale | Replicate | Hosting | Monthly |
|-------|-----------|---------|---------|
| 1K/month | $5 | $0-20 | $5-25 |
| 10K/month | $50 | $20-50 | $70-100 |
| 100K/month | $500 | $100-200 | $600-700 |

---

## Security Checklist

Before deploying to production:

- [ ] Never commit `.env.local` to git
- [ ] Environment variables set on deployment platform
- [ ] No API keys in source code
- [ ] Enable HTTPS (automatic on all platforms)
- [ ] Add rate limiting (future enhancement)
- [ ] Monitor for suspicious activity
- [ ] Regular security updates

**Rate Limiting Setup (Future):**
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
});

// Apply to API route
app.use('/api/personalize', limiter);
```

---

## Deployment Troubleshooting

### Build Fails During Deployment

**Solution:**
1. Check build locally: `npm run build`
2. Clear deployment cache
3. Increase build timeout if available
4. Check Node.js version (need 18+)

### Application Times Out

**Solution:**
1. Verify `REPLICATE_API_TOKEN` is set
2. Check Replicate API status
3. Increase function timeout to 60+ seconds
4. Test with smaller image

### API Returns 500 Error

**Solution:**
1. Check deployment logs
2. Verify environment variables
3. Test API endpoint directly
4. Check Replicate API availability

### Memory Issues During Build

**Solution:**
```bash
# Local fix
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Deployment (add to build command)
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

---

## Post-Deployment

### Verification Steps

1. **Test API endpoint:**
   ```bash
   curl https://your-domain.com/api/personalize
   ```

2. **Upload test photo:**
   - Navigate to app
   - Upload sample image
   - Generate personalization
   - Download result

3. **Monitor performance:**
   - Check response times
   - Verify no errors
   - Monitor costs

### Continuous Monitoring

**Daily:**
- Check error logs
- Monitor uptime

**Weekly:**
- Review performance metrics
- Check cost trends
- Test with different images

**Monthly:**
- Analyze usage patterns
- Plan optimizations
- Review security logs

---

## Updating Deployed Application

### Rolling Updates

**On Vercel:**
1. Push to GitHub
2. Vercel auto-deploys
3. Zero-downtime update

**On Railway/Render:**
1. Connect to GitHub
2. Auto-redeploy on push
3. View deployment history

### Emergency Rollback

If deployment breaks:
1. Identify failing commit
2. Revert to previous commit
3. Push to trigger redeploy
4. Verify rollback successful

---

## Troubleshooting Deployment Issues

| Error | Cause | Solution |
|-------|-------|----------|
| "Build timeout" | Build takes >30min | Increase timeout, check dependencies |
| "Memory error" | Not enough RAM | Use `NODE_OPTIONS=--max-old-space-size=4096` |
| "Module not found" | Dependencies missing | Run `npm install` before build |
| "API errors" | Invalid token | Verify `REPLICATE_API_TOKEN` in env |
| "404 Not Found" | Routes not deployed | Check `app/` directory structure |

---

## Next Steps

1. Choose deployment platform (recommend Vercel or Railway)
2. Set up environment variables
3. Deploy application
4. Test with sample photo
5. Monitor performance
6. Plan for V2 features

---

**For detailed setup instructions, see:**
- [README.md](./README.md) - Overview
- [SETUP.md](./SETUP.md) - Local setup
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical details
