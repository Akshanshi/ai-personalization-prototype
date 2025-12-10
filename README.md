# Pickabook - AI-Powered Personalized Children's Book Illustrations

A prototype application that transforms a child's photo into a personalized storybook illustration using AI technology.

## Overview

This project demonstrates an end-to-end pipeline for personalizing children's book illustrations:

1. User uploads a child's photo
2. AI converts the photo into a cartoon-style illustration
3. The stylized face is composited onto a storybook template
4. User can preview and download the personalized illustration

## Tech Stack

- **Frontend**: Next.js 13 (App Router), React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Lucide React icons
- **Backend**: Next.js API Routes
- **AI Service**: Replicate API (face-to-sticker model)
- **Image Processing**: Sharp library for compositing
- **Deployment**: Vercel-ready (or any Node.js hosting)

## Architecture

### Frontend Flow
```
User Upload → Preview → Generate Button → Loading State → Result Display → Download
```

### Backend Pipeline
```
API Route receives image
    ↓
Validate file (type, size)
    ↓
Call Replicate API (face-to-sticker)
    ↓
Download AI-generated cartoon face
    ↓
Composite onto template using Sharp
    ↓
Return base64 image to frontend
```

### AI Model Choice

We use **Replicate's "fofr/face-to-sticker"** model because:

- Produces consistent cartoon-style faces suitable for children's books
- Simple API integration
- Good quality for prototypes
- Reasonable processing time (30-60 seconds)
- No need for custom model training

**Alternative models** you could swap in:
- `tencentarc/photomaker` - Better face preservation
- `lucataco/sdxl-cartoon` - Different cartoon styles
- Any SDXL-based model with cartoon LoRA

## Setup & Installation

### Prerequisites

- Node.js 18+ and npm
- A Replicate account and API token ([Get it here](https://replicate.com/account/api-tokens))

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd pickabook
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your Replicate API token:
   ```
   REPLICATE_API_TOKEN=your_actual_token_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the app**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
pickabook/
├── app/
│   ├── api/
│   │   └── personalize/
│   │       └── route.ts          # Main API endpoint
│   ├── page.tsx                   # Upload UI & frontend logic
│   ├── layout.tsx
│   └── globals.css
├── lib/
│   ├── ai-service.ts              # Replicate API integration
│   └── image-compositor.ts        # Sharp-based compositing
├── components/
│   └── ui/                        # shadcn/ui components
├── public/
│   └── templates/
│       ├── template1.png          # (Add your templates here)
│       └── README.md              # Template documentation
├── package.json
├── .env.example
└── README.md
```

## How It Works

### 1. Image Upload
- User selects a JPG/PNG/WebP file (max 10MB)
- Frontend validates file type and size
- Preview is shown immediately

### 2. AI Processing
- Image is sent to `/api/personalize` endpoint
- Backend calls Replicate's face-to-sticker model
- Model parameters:
  - Steps: 20
  - Size: 1024x1024
  - Style: Cartoon, colorful, children's book illustration
  - Instant ID strength: 0.7 (preserves facial features)

### 3. Template Compositing
- AI-generated cartoon face is downloaded
- Using Sharp, the face is resized to fit template dimensions
- Face is composited onto template at predefined coordinates
- Final image is encoded as base64 and returned

### 4. Display & Download
- Personalized illustration is displayed in the UI
- User can download as PNG file

## Template System

Templates are stored in `public/templates/` and configured in `lib/image-compositor.ts`:

```typescript
const TEMPLATES = {
  template1: {
    name: 'template1',
    facePosition: {
      x: 300,      // pixels from left
      y: 150,      // pixels from top
      width: 400,  // width of face
      height: 400, // height of face
    },
  },
};
```

To add a new template:
1. Create a 1024x1024 PNG with a designated face area
2. Save as `public/templates/template2.png`
3. Add configuration to `TEMPLATES` object
4. Update API call to use new template name

See `public/templates/README.md` for detailed instructions.

## Limitations (V1 Prototype)

This is a 1-day prototype with intentional simplifications:

### Current Limitations

1. **Fixed Face Positioning**: Face is placed at hardcoded coordinates
   - Doesn't account for template variations
   - No automatic face detection in templates

2. **Single Template Support**: Only one template active at a time
   - No template selection UI
   - Limited variety

3. **No Face Angle Adjustment**: AI output is used as-is
   - Doesn't rotate or transform to match template pose
   - Works best with forward-facing photos

4. **External API Dependency**:
   - Relies on Replicate's availability
   - 30-60 second processing time
   - Costs per API call

5. **No Caching**: Every request generates a new image
   - No storage of previous results
   - Can't retrieve past personalizations

6. **Limited Error Handling**: Basic error messages
   - Could be more user-friendly
   - No retry mechanism

## Version 2 Improvements

### Short Term (Next Sprint)
- [ ] Add face detection to find optimal position in template
- [ ] Multiple template selection UI
- [ ] Caching system using Supabase Storage
- [ ] Better error messages and retry logic
- [ ] Progress indicators with percentage
- [ ] Mobile-responsive template editor

### Medium Term
- [ ] User accounts and personalization history
- [ ] Batch processing (multiple photos)
- [ ] Custom template upload by users
- [ ] Style transfer options (multiple AI models)
- [ ] Preview before full generation
- [ ] Social sharing features

### Long Term
- [ ] Fine-tuned custom model for children's book style
- [ ] Dynamic face positioning using MediaPipe Face Landmarks
- [ ] Pose adjustment and angle correction
- [ ] Multiple characters in one scene
- [ ] Full book generation (multiple pages)
- [ ] Print-ready high-resolution output

## API Documentation

### POST `/api/personalize`

Personalizes an uploaded image.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `image`: File (JPG/PNG/WebP, max 10MB)
  - `template`: String (optional, defaults to "template1")

**Response:**
```json
{
  "success": true,
  "image": "data:image/png;base64,iVBORw0KG...",
  "message": "Image personalized successfully"
}
```

**Error Response:**
```json
{
  "error": "Error message here",
  "details": "Stack trace (development only)"
}
```

### GET `/api/personalize`

Returns API information.

**Response:**
```json
{
  "message": "Pickabook Personalization API",
  "endpoints": {
    "POST": "/api/personalize - Upload an image for personalization"
  },
  "requirements": {
    "field": "image",
    "allowedTypes": ["image/jpeg", "image/png", "image/jpg", "image/webp"],
    "maxSize": "10MB"
  }
}
```

## Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `REPLICATE_API_TOKEN` | Your Replicate API token | Yes | `r8_abc123...` |

Get your token from [Replicate Account Settings](https://replicate.com/account/api-tokens).

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variable: `REPLICATE_API_TOKEN`
4. Deploy

Note: Serverless function timeout may need to be increased for AI processing (60+ seconds).

### Other Platforms

The app works on any Node.js hosting platform:
- Railway
- Render
- DigitalOcean App Platform
- Fly.io

Ensure your platform supports:
- Node.js 18+
- Serverless functions with 60+ second timeout
- Sharp native dependencies (usually automatic)

## Cost Considerations

**Replicate API Pricing** (as of 2024):
- face-to-sticker model: ~$0.005 per generation
- Free tier available for testing
- See [Replicate Pricing](https://replicate.com/pricing) for details

**Estimated costs** for 1000 personalizations: ~$5

## Development

### Running Tests
```bash
npm run typecheck  # TypeScript validation
npm run lint       # ESLint checks
```

### Building for Production
```bash
npm run build
npm run start
```

### Debugging

Enable detailed logs:
- Check browser console for frontend errors
- Check server logs for API errors
- Replicate dashboard shows API call history

Common issues:
- "API token not found": Check `.env.local` file
- "Model timeout": Image too large or API overloaded
- "Compositing failed": Template file missing or corrupt

## Contributing

This is a prototype for demonstration purposes. For production use, consider:

1. Adding comprehensive tests
2. Implementing user authentication
3. Setting up proper error tracking (Sentry)
4. Adding rate limiting
5. Implementing result caching
6. Optimizing image sizes
7. Adding analytics

## License

MIT License - feel free to use for your own projects.

## Acknowledgments

- [Replicate](https://replicate.com/) for AI model hosting
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Sharp](https://sharp.pixelplumbing.com/) for image processing
- face-to-sticker model by [fofr](https://replicate.com/fofr)

## Support

For issues or questions:
- Check the troubleshooting section above
- Review Replicate API documentation
- Open an issue in this repository

---

**Built for Pickabook - Making every child the hero of their own story** 📚✨
<img width="2671" height="1567" alt="Screenshot 2025-12-10 163435" src="https://github.com/user-attachments/assets/a8849a8c-a5f9-469c-b1c9-effe4bd34e7a" />
