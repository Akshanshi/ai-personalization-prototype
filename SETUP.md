# Quick Setup Guide

This is a step-by-step guide to get the Pickabook prototype running in under 5 minutes.

## Prerequisites Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] A Replicate account (free tier available)

## Step 1: Get Your Replicate API Token

1. Go to [https://replicate.com/](https://replicate.com/)
2. Sign up for a free account (if you haven't already)
3. Navigate to [Account Settings → API Tokens](https://replicate.com/account/api-tokens)
4. Click "Create token" or copy your existing token
5. Keep this token handy - you'll need it in Step 3

## Step 2: Install Dependencies

```bash
npm install
```

This will install:
- Next.js and React
- Replicate SDK
- Sharp (image processing)
- Tailwind CSS and UI components
- All other dependencies

**Note**: Sharp has native dependencies. If you encounter installation issues:
```bash
npm rebuild sharp
```

## Step 3: Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env.local

# Open .env.local in your text editor
# Replace 'your_replicate_api_token_here' with your actual token from Step 1
```

Your `.env.local` should look like:
```
REPLICATE_API_TOKEN=r8_abc123def456ghi789...
```

## Step 4: Run the Development Server

```bash
npm run dev
```

You should see:
```
  ▲ Next.js 13.5.1
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

 ✓ Ready in 2.3s
```

## Step 5: Test the Application

1. Open [http://localhost:3000](http://localhost:3000) in your browser
2. You should see the Pickabook interface
3. Click "Click to upload an image"
4. Select a photo of a child's face (or any face for testing)
5. Click "Generate Personalized Illustration"
6. Wait 30-60 seconds for AI processing
7. See your personalized illustration!

## Troubleshooting

### "REPLICATE_API_TOKEN is not set"
- Check that `.env.local` exists in the project root
- Verify the token is correctly pasted (no extra spaces)
- Restart the dev server after changing environment variables

### "Module not found: sharp"
```bash
npm rebuild sharp
# or
npm install --force
```

### "Failed to connect to Replicate"
- Check your internet connection
- Verify your API token is valid
- Check Replicate's status page

### "Image too large" error
- Maximum file size is 10MB
- Compress your image or use a smaller file

### Server won't start
```bash
# Clear Next.js cache and reinstall
rm -rf .next node_modules
npm install
npm run dev
```

## Optional: Add Templates

The app works without templates (it will return the AI-generated face directly), but for the full experience:

1. Create or download 1024x1024 PNG template images
2. Save them in `public/templates/` as `template1.png`, `template2.png`, etc.
3. Update `lib/image-compositor.ts` with face positions for each template

See `public/templates/README.md` for detailed instructions.

## Next Steps

- Read the main [README.md](./README.md) for full documentation
- Check [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
- Review the code in `app/page.tsx` for frontend logic
- Explore `lib/ai-service.ts` to see how the AI API is called

## Testing Checklist

- [ ] App loads without errors
- [ ] Can upload an image
- [ ] Preview shows correctly
- [ ] Generate button works
- [ ] Loading state appears
- [ ] Result image is displayed
- [ ] Download button works

## Common First-Time Questions

**Q: Is this free to use?**
A: Replicate offers a free tier for testing. Each generation costs approximately $0.005 after the free tier.

**Q: How long does generation take?**
A: Typically 30-60 seconds, depending on Replicate's server load.

**Q: Can I use my own AI model?**
A: Yes! Modify `lib/ai-service.ts` to use any Replicate model or external API.

**Q: Where is the data stored?**
A: Currently, nothing is stored. Each generation is ephemeral. For V2, we'll add Supabase storage.

**Q: Can I customize the cartoon style?**
A: Yes, modify the `prompt` in `app/api/personalize/route.ts` or try different Replicate models.

## Getting Help

If you're stuck:
1. Check the troubleshooting section above
2. Review the console logs (both browser and terminal)
3. Check [Replicate's documentation](https://replicate.com/docs)
4. Open an issue in the repository

---

**Ready to build?** Start with `npm run dev` and have fun creating personalized illustrations! 🎨
