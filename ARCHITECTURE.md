# Technical Architecture

This document provides a detailed technical overview of the Pickabook personalization system.

## System Overview

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Browser   │◄───────►│  Next.js App │◄───────►│  Replicate  │
│   (React)   │  HTTP   │  (API Route) │  HTTPS  │  AI Service │
└─────────────┘         └──────────────┘         └─────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │    Sharp     │
                        │   Compositor │
                        └──────────────┘
```

## Component Architecture

### 1. Frontend Layer (`app/page.tsx`)

**Technology**: React with TypeScript, Client-Side Component

**Responsibilities**:
- File upload UI and validation
- Image preview management
- API communication
- Loading state management
- Result display and download

**State Management**:
```typescript
interface UploadState {
  file: File | null;           // Selected file object
  previewUrl: string | null;   // Object URL for preview
  isProcessing: boolean;       // Loading state
  error: string | null;        // Error message
  resultImage: string | null;  // Base64 result image
  success: boolean;            // Success indicator
}
```

**Key Functions**:

1. `handleFileSelect()`: Validates and stores uploaded file
   - Checks file type (image/jpeg, image/png, image/webp)
   - Validates file size (max 10MB)
   - Creates preview URL using `URL.createObjectURL()`

2. `handleGenerate()`: Sends request to backend
   - Creates FormData with image and template selection
   - Calls `/api/personalize` endpoint
   - Handles success/error responses
   - Updates UI state

3. `handleDownload()`: Downloads result image
   - Creates temporary anchor element
   - Triggers download with filename
   - Cleans up DOM

**UI Components Used**:
- `Card`: Container components from shadcn/ui
- `Button`: Action buttons with variants
- `Alert`: Error and success notifications
- Lucide icons: `Upload`, `Sparkles`, `Download`, etc.

### 2. API Layer (`app/api/personalize/route.ts`)

**Technology**: Next.js API Route (App Router)

**Endpoint**: `POST /api/personalize`

**Request Flow**:
```
1. Receive FormData
2. Extract file and template
3. Validate file type and size
4. Convert to Buffer
5. Call AI Service
6. Call Image Compositor
7. Return base64 image
```

**Validation Rules**:
```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
```

**Error Handling**:
- Returns appropriate HTTP status codes (400, 500)
- Includes error message in response
- Logs detailed errors for debugging
- Includes stack trace in development mode

**Response Format**:
```typescript
// Success
{
  success: true,
  image: "data:image/png;base64,iVBORw0KG...",
  message: "Image personalized successfully"
}

// Error
{
  error: "Error message",
  details?: "Stack trace (dev only)"
}
```

### 3. AI Service Layer (`lib/ai-service.ts`)

**Technology**: Replicate SDK

**Model**: `fofr/face-to-sticker`
- Version: `764d4827ea159608a07cdde8ddf1c6000019627515eb02b6b449695fd547e5ef`
- Style: Cartoon/sticker style face generation
- Input: Base64-encoded image
- Output: URL to generated image

**Class Structure**:
```typescript
class AIService {
  private replicate: Replicate;

  constructor(apiToken: string)
  async personalizeImage(options: PersonalizationOptions): Promise<PersonalizationResult>
  async testConnection(): Promise<boolean>
}
```

**Model Parameters**:
```typescript
{
  image: dataUri,                    // Input image as data URI
  steps: 20,                         // Generation steps
  width: 1024,                       // Output width
  height: 1024,                      // Output height
  prompt: "cute cartoon style...",   // Style prompt
  upscale: false,                    // No upscaling
  negative_prompt: "ugly, blurry...", // What to avoid
  prompt_strength: 4.5,              // How strongly to apply prompt
  ip_adapter_noise: 0.5,             // Noise in adaptation
  ip_adapter_weight: 0.2,            // Adapter influence
  instant_id_strength: 0.7,          // Face preservation
}
```

**Why This Model?**:
1. Face preservation: InstantID technology maintains facial features
2. Consistent style: Produces reliable cartoon aesthetics
3. Child-friendly: Soft, colorful, age-appropriate results
4. Speed: ~30-60 seconds processing time
5. Quality: High-resolution 1024x1024 output

**Alternative Models**:
- `tencentarc/photomaker`: Better face preservation, different style
- `lucataco/sdxl-cartoon`: More customizable cartoon styles
- `stability-ai/sdxl`: Base SDXL with custom prompts

### 4. Image Compositor (`lib/image-compositor.ts`)

**Technology**: Sharp (high-performance Node.js image processing)

**Class Structure**:
```typescript
class ImageCompositor {
  async downloadImage(url: string): Promise<Buffer>
  async compositeOnTemplate(options: CompositeOptions): Promise<CompositeResult>
  async getAvailableTemplates(): Promise<string[]>
}
```

**Template Configuration**:
```typescript
interface TemplateConfig {
  name: string;
  facePosition: {
    x: number;      // Pixels from left edge
    y: number;      // Pixels from top edge
    width: number;  // Face area width
    height: number; // Face area height
  };
}
```

**Compositing Process**:
```
1. Download AI-generated image from Replicate URL
2. Load template PNG from public/templates/
3. Resize face to fit template dimensions
4. Composite face onto template at specified position
5. Encode result as base64 PNG
```

**Sharp Operations**:
```typescript
// Resize face
const resizedFace = await sharp(aiImageBuffer)
  .resize(width, height, {
    fit: 'cover',
    position: 'center',
  })
  .toBuffer();

// Composite onto template
const compositedImage = await sharp(templateBuffer)
  .composite([{
    input: resizedFace,
    top: y,
    left: x,
    blend: 'over',
  }])
  .png()
  .toBuffer();
```

**Fallback Behavior**:
If template is missing, returns the AI-generated image directly (resized to 1024x1024).

## Data Flow

### Complete Request Flow

```
1. User selects image
   └─> Frontend validates (type, size)
   └─> Creates preview URL
   └─> Enables Generate button

2. User clicks Generate
   └─> Frontend sends POST to /api/personalize
       └─> FormData: { image: File, template: string }

3. API Route receives request
   └─> Validates file again (server-side)
   └─> Converts File to Buffer
   └─> Calls AIService.personalizeImage()

4. AI Service processes
   └─> Converts Buffer to base64 data URI
   └─> Calls Replicate API
   └─> Waits for generation (30-60s)
   └─> Returns URL to generated image

5. Image Compositor processes
   └─> Downloads image from URL
   └─> Loads template from disk
   └─> Resizes and composites
   └─> Encodes as base64 PNG

6. API Route returns
   └─> { success: true, image: "data:image/png;base64,..." }

7. Frontend receives response
   └─> Displays image in preview
   └─> Enables download button
   └─> Shows success message
```

### Error Flow

```
Error at any stage
   └─> Caught by try/catch
   └─> Logged to console
   └─> Returned as error response
   └─> Frontend displays error alert
   └─> User can retry
```

## File Structure

```
pickabook/
├── app/
│   ├── api/
│   │   └── personalize/
│   │       └── route.ts              # API endpoint (380 lines)
│   ├── page.tsx                      # Main UI (315 lines)
│   ├── layout.tsx                    # Root layout
│   └── globals.css                   # Global styles
│
├── lib/
│   ├── ai-service.ts                 # Replicate integration (98 lines)
│   └── image-compositor.ts           # Sharp compositing (166 lines)
│
├── components/
│   └── ui/                           # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── alert.tsx
│       └── ...
│
├── public/
│   └── templates/
│       ├── template1.png             # User-provided templates
│       ├── template2.png
│       └── README.md                 # Template documentation
│
├── package.json                      # Dependencies
├── next.config.js                    # Next.js configuration
├── tsconfig.json                     # TypeScript configuration
├── tailwind.config.ts                # Tailwind CSS configuration
├── .env.example                      # Environment variables template
├── .env.local                        # Local environment (gitignored)
├── README.md                         # Main documentation
├── SETUP.md                          # Quick start guide
└── ARCHITECTURE.md                   # This file
```

## Performance Considerations

### Current Performance

- **Upload validation**: Instant (client-side)
- **Preview generation**: Instant (Object URL)
- **API request**: ~30-60 seconds total
  - Replicate API call: ~25-50 seconds
  - Image download: ~1-3 seconds
  - Compositing: ~1-2 seconds
  - Base64 encoding: <1 second

### Bottlenecks

1. **Replicate API latency**: Main bottleneck (25-50s)
   - Mitigation: Consider batching or preprocessing
   - Future: Use dedicated GPU instance or self-hosted model

2. **Large image transfers**: Base64 encoding increases size by ~37%
   - Mitigation: Could use blob storage + URLs instead
   - Future: Implement Supabase Storage

3. **No caching**: Each request generates fresh result
   - Mitigation: Add caching layer
   - Future: Store results in database with deduplication

### Optimization Opportunities

1. **Caching Layer**:
   ```typescript
   // Hash input image
   const imageHash = crypto.createHash('sha256')
     .update(imageBuffer)
     .digest('hex');

   // Check cache
   const cached = await supabase
     .from('generations')
     .select('result_url')
     .eq('image_hash', imageHash)
     .single();
   ```

2. **Progressive Results**:
   ```typescript
   // Stream intermediate results
   async function* generateProgressive() {
     yield { stage: 'processing', progress: 0 };
     yield { stage: 'ai_generating', progress: 50 };
     yield { stage: 'compositing', progress: 80 };
     yield { stage: 'complete', progress: 100, image };
   }
   ```

3. **Image Optimization**:
   ```typescript
   // Resize before sending to API
   const optimized = await sharp(buffer)
     .resize(512, 512, { fit: 'cover' })
     .jpeg({ quality: 85 })
     .toBuffer();
   ```

## Security Considerations

### Current Security Measures

1. **File Validation**:
   - Type checking (MIME type)
   - Size limits (10MB)
   - Double validation (client + server)

2. **API Key Security**:
   - Environment variables
   - Never exposed to client
   - .env.local in .gitignore

3. **Error Handling**:
   - No sensitive data in error messages
   - Stack traces only in development
   - Sanitized user inputs

### Security Recommendations for Production

1. **Rate Limiting**:
   ```typescript
   import rateLimit from 'express-rate-limit';

   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 10, // 10 requests per window
   });
   ```

2. **Input Sanitization**:
   ```typescript
   // Verify image content
   const metadata = await sharp(buffer).metadata();
   if (!metadata.format || !['jpeg', 'png', 'webp'].includes(metadata.format)) {
     throw new Error('Invalid image format');
   }
   ```

3. **CSRF Protection**:
   - Use Next.js built-in CSRF tokens
   - Verify origin headers

4. **Content Security Policy**:
   ```typescript
   // next.config.js
   headers: [
     {
       key: 'Content-Security-Policy',
       value: "default-src 'self'; img-src 'self' data: blob: https://replicate.delivery;",
     },
   ],
   ```

## Deployment Considerations

### Vercel Deployment

**Configuration needed**:
```json
{
  "functions": {
    "app/api/personalize/route.ts": {
      "maxDuration": 60
    }
  }
}
```

**Environment Variables**:
- Set `REPLICATE_API_TOKEN` in Vercel dashboard
- Use Vercel's Edge Config for feature flags

**Limitations**:
- Free tier: 10s timeout (need paid plan for 60s)
- Serverless function size: Sharp adds ~50MB
- Cold starts: 2-5s additional latency

### Docker Deployment

**Dockerfile**:
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

### Performance Monitoring

**Recommended Tools**:
- Vercel Analytics (built-in)
- Sentry for error tracking
- LogRocket for session replay
- Replicate dashboard for API metrics

## Testing Strategy

### Unit Tests (Future)

```typescript
// ai-service.test.ts
describe('AIService', () => {
  it('should generate personalized image', async () => {
    const service = new AIService(process.env.REPLICATE_API_TOKEN);
    const result = await service.personalizeImage({ imageBuffer });
    expect(result.imageUrl).toBeDefined();
    expect(result.error).toBeUndefined();
  });
});

// image-compositor.test.ts
describe('ImageCompositor', () => {
  it('should composite image onto template', async () => {
    const compositor = new ImageCompositor();
    const result = await compositor.compositeOnTemplate({
      aiGeneratedImageUrl: 'https://example.com/image.png',
      templateName: 'template1',
    });
    expect(result.base64Image).toContain('data:image/png;base64,');
  });
});
```

### Integration Tests

```typescript
// api.test.ts
describe('POST /api/personalize', () => {
  it('should return personalized image', async () => {
    const formData = new FormData();
    formData.append('image', testImage);

    const response = await fetch('/api/personalize', {
      method: 'POST',
      body: formData,
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.image).toBeDefined();
  });
});
```

### E2E Tests (Playwright)

```typescript
test('complete personalization flow', async ({ page }) => {
  await page.goto('/');
  await page.setInputFiles('input[type="file"]', 'test-image.jpg');
  await page.click('button:has-text("Generate")');
  await page.waitForSelector('img[alt="Personalized illustration"]');
  const downloadButton = page.locator('button:has-text("Download")');
  await expect(downloadButton).toBeVisible();
});
```

## Future Architecture Improvements

### 1. Microservices Architecture

```
┌─────────────┐
│   Frontend  │
└──────┬──────┘
       │
┌──────▼──────────────┐
│   API Gateway       │
└──────┬──────────────┘
       │
   ┌───┴────┐
   │        │
┌──▼──┐  ┌─▼───┐
│ AI  │  │ Img │
│ Svc │  │ Svc │
└─────┘  └─────┘
```

### 2. Event-Driven Architecture

```typescript
// User uploads image
emit('image.uploaded', { imageId, userId, buffer });

// AI service listens
on('image.uploaded', async (event) => {
  const result = await generateCartoon(event.buffer);
  emit('cartoon.generated', { imageId, cartoonUrl });
});

// Compositor listens
on('cartoon.generated', async (event) => {
  const final = await compositeOnTemplate(event.cartoonUrl);
  emit('personalization.complete', { imageId, finalUrl });
});

// Frontend receives via WebSocket
websocket.on('personalization.complete', (event) => {
  displayResult(event.finalUrl);
});
```

### 3. Caching & Storage Layer

```
┌──────────┐
│ CDN      │ ← Cached final images
└────┬─────┘
     │
┌────▼──────┐
│ Supabase  │
│ Storage   │ ← Original uploads & results
└────┬──────┘
     │
┌────▼──────┐
│ PostgreSQL│ ← Metadata & user data
└───────────┘
```

### 4. ML Model Hosting

**Current**: Replicate API (external)
**Future**:
- Self-hosted on Modal.com or Banana.dev
- GPU instance on AWS/GCP
- Edge deployment with ONNX Runtime

**Benefits**:
- Lower latency (5-10s vs 30-60s)
- Lower cost at scale
- Custom fine-tuning
- Full control over model versions

---

This architecture is designed for rapid prototyping and easy iteration. For production, consider the scaling strategies outlined above.
