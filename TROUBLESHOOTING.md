# Troubleshooting Guide

Common issues and their solutions for the Pickabook prototype.

## Installation Issues

### "Cannot find module 'replicate'"

**Problem**: TypeScript can't find installed packages.

**Solution**:
```bash
# Install dependencies first
npm install

# If still failing, clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### "Cannot find module 'sharp'"

**Problem**: Sharp has native dependencies that need to be compiled.

**Solution**:
```bash
# Rebuild Sharp
npm rebuild sharp

# On Windows, you might need windows-build-tools
npm install --global windows-build-tools

# On Mac with M1/M2
arch -x86_64 npm install sharp
```

### "Python not found"

**Problem**: Sharp requires Python for building on some systems.

**Solution**:
- **Windows**: Install Python from python.org
- **Mac**: `brew install python`
- **Linux**: `sudo apt-get install python3`

## Runtime Errors

### "REPLICATE_API_TOKEN is not set"

**Problem**: Environment variable not configured.

**Solution**:
```bash
# 1. Copy example file
cp .env.example .env.local

# 2. Edit .env.local and add your token
# REPLICATE_API_TOKEN=r8_your_token_here

# 3. Restart the dev server
npm run dev
```

### "Failed to connect to Replicate"

**Problem**: API token is invalid or network issue.

**Solution**:
1. Verify your token at [Replicate Account](https://replicate.com/account/api-tokens)
2. Check you have credits available (free tier)
3. Test your internet connection
4. Check Replicate's status page

### "Model timeout" or "Request took too long"

**Problem**: Replicate API is slow or overloaded.

**Solution**:
1. Try again - API speed varies
2. Use a smaller image (resize to 1024x1024 before upload)
3. Check Replicate's status page
4. Consider upgrading to paid tier for faster processing

### "Template not found"

**Problem**: Template file doesn't exist.

**Solution**:
- The app works without templates (returns AI face directly)
- To add templates, create `public/templates/template1.png`
- See `public/templates/README.md` for template requirements

## Build Errors

### "Type error: Cannot find module '@/lib/...'"

**Problem**: TypeScript path mapping issue.

**Solution**:
```bash
# Check tsconfig.json has:
{
  "paths": {
    "@/*": ["./*"]
  }
}

# Clear Next.js cache
rm -rf .next
npm run dev
```

### "Module not found: Can't resolve '@/components/ui/...'"

**Problem**: shadcn/ui components missing.

**Solution**:
- All UI components are already included in the repo
- If you added new components, make sure they exist in `components/ui/`
- Check imports are correct: `@/components/ui/button` not `@/components/button`

### "Error: Export 'default' not found"

**Problem**: Import/export mismatch.

**Solution**:
```typescript
// Wrong
import Button from '@/components/ui/button';

// Correct
import { Button } from '@/components/ui/button';
```

## API Issues

### "Failed to fetch"

**Problem**: Client can't reach API endpoint.

**Solution**:
1. Ensure dev server is running (`npm run dev`)
2. Check console for CORS errors
3. Verify endpoint path: `/api/personalize` not `api/personalize`
4. Check browser network tab for actual error

### "413 Payload Too Large"

**Problem**: Image file is too big.

**Solution**:
1. Compress image before upload
2. Maximum size is 10MB
3. Use image compression tool (TinyPNG, ImageOptim)
4. Or increase limit in `next.config.js`:
```javascript
experimental: {
  serverActions: {
    bodySizeLimit: '20mb', // Increase to 20MB
  },
},
```

### "500 Internal Server Error"

**Problem**: Backend error.

**Solution**:
1. Check terminal logs for error details
2. Verify environment variables are set
3. Test API endpoint directly: `curl http://localhost:3000/api/personalize`
4. Check file permissions on `public/templates/`

## Image Processing Issues

### "Image appears distorted"

**Problem**: Face position doesn't match template.

**Solution**:
- Adjust face position in `lib/image-compositor.ts`:
```typescript
const TEMPLATES = {
  template1: {
    facePosition: {
      x: 300,  // Adjust these
      y: 150,
      width: 400,
      height: 400,
    },
  },
};
```

### "Background color looks wrong"

**Problem**: PNG transparency issues.

**Solution**:
- Ensure template has transparent background
- Or use solid color and adjust blend mode in compositor
- Try different blend modes in Sharp: 'over', 'multiply', 'screen'

### "Face is too large/small"

**Problem**: Face dimensions don't match template.

**Solution**:
- Adjust width/height in template configuration
- Modify Sharp resize options:
```typescript
.resize(width, height, {
  fit: 'cover',    // Try: 'contain', 'fill', 'inside', 'outside'
  position: 'center',
})
```

## Performance Issues

### "Generation takes longer than 60 seconds"

**Problem**: API timeout.

**Solution**:
1. Default timeout is 60s, some generations take longer
2. On Vercel, upgrade to Pro for longer timeouts
3. Consider using polling instead of waiting:
```typescript
// Submit job
const { id } = await replicate.predictions.create({...});

// Poll for result
while (prediction.status !== 'succeeded') {
  await sleep(1000);
  prediction = await replicate.predictions.get(id);
}
```

### "Page is slow to load"

**Problem**: Large bundle size or slow API.

**Solution**:
1. Run production build: `npm run build && npm start`
2. Analyze bundle: `npm install -D @next/bundle-analyzer`
3. Check Network tab in browser DevTools
4. Consider lazy loading heavy components

### "Memory error during build"

**Problem**: Not enough memory.

**Solution**:
```bash
# Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Or in package.json
"build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
```

## Common Questions

### "Why is the AI result different each time?"

**Answer**: The AI model is non-deterministic. Each generation is unique. To get consistent results, you would need to set a fixed seed (not currently supported in this model).

### "Can I use a different AI model?"

**Answer**: Yes! Edit `lib/ai-service.ts`:
```typescript
const output = await this.replicate.run(
  'your-model-here',  // Change this
  { input: { ...yourParams } }
);
```

### "How do I add more templates?"

**Answer**:
1. Create 1024x1024 PNG file
2. Save in `public/templates/template2.png`
3. Add configuration in `lib/image-compositor.ts`
4. Use in frontend: `formData.append('template', 'template2')`

### "Can I deploy this for free?"

**Answer**:
- **Vercel**: Free tier has 10s timeout (too short)
- **Railway**: Free $5 credit monthly
- **Render**: Free tier available
- **Replicate**: Pay per generation (~$0.005 each)

Best free option: Railway (for testing)

### "Is there a way to preview before generating?"

**Answer**: Not in V1. This would require:
1. Separate "preview" model (faster, lower quality)
2. Or client-side face detection + overlay (no AI)
3. Planned for V2

### "Why doesn't it work with side-facing photos?"

**Answer**: The AI model works best with forward-facing photos. For side profiles:
1. Use a different model (e.g., ControlNet with pose)
2. Or implement face rotation preprocessing
3. Planned for V2

## Debugging Tips

### Enable Verbose Logging

```typescript
// In lib/ai-service.ts
console.log('Input buffer size:', imageBuffer.length);
console.log('Replicate parameters:', input);
console.log('Replicate response:', output);

// In lib/image-compositor.ts
console.log('Template path:', templatePath);
console.log('Face position:', facePosition);
console.log('Downloaded image size:', aiImageBuffer.length);
```

### Test Components Individually

```typescript
// Test AI service
import { createAIService } from '@/lib/ai-service';
const service = createAIService();
const result = await service.testConnection();
console.log('Connection test:', result);

// Test compositor
import { createImageCompositor } from '@/lib/image-compositor';
const compositor = createImageCompositor();
const templates = await compositor.getAvailableTemplates();
console.log('Available templates:', templates);
```

### Check Browser Console

Press F12 and look for:
- Network errors (failed API calls)
- Console errors (JavaScript errors)
- Memory warnings (large images)

### Check Server Logs

Terminal running `npm run dev` shows:
- API route calls
- Error stack traces
- Replicate API responses
- Sharp processing logs

## Getting Help

If you're still stuck:

1. **Check the logs**: Browser console + terminal logs
2. **Search error message**: Google the exact error
3. **Check documentation**:
   - [Next.js Docs](https://nextjs.org/docs)
   - [Replicate Docs](https://replicate.com/docs)
   - [Sharp Docs](https://sharp.pixelplumbing.com/)
4. **Review example code**: Compare with working examples in this repo
5. **Create minimal reproduction**: Isolate the issue
6. **Open an issue**: Include logs, code, and steps to reproduce

## Quick Fixes Checklist

- [ ] Ran `npm install`
- [ ] Created `.env.local` with valid API token
- [ ] Restarted dev server after .env changes
- [ ] Checked browser console for errors
- [ ] Checked terminal for server errors
- [ ] Verified file paths are correct
- [ ] Tested with a different image
- [ ] Cleared `.next` cache
- [ ] Tried in incognito/private mode
- [ ] Checked Replicate account has credits

---

Still need help? Open an issue with:
- Error message (full text)
- Steps to reproduce
- Browser + OS version
- Node.js version (`node --version`)
- Screenshots (if relevant)
