# API Documentation

Complete API reference for the Pickabook personalization service.

## Base URL

```
Local Development: http://localhost:3000
Production: https://your-domain.com
```

## Authentication

No authentication required for the prototype. For production, consider:
- API keys for rate limiting
- JWT tokens for user sessions
- OAuth for third-party integrations

---

## Endpoints

### POST /api/personalize

Generate a personalized children's book illustration from a photo.

#### Request

**Headers:**
```
Content-Type: multipart/form-data
```

**Body (FormData):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | File | Yes | Image file (JPG, PNG, WebP) |
| `template` | string | No | Template name (default: "template1") |

**Constraints:**
- Maximum file size: 10MB
- Allowed formats: JPEG, PNG, WebP
- Recommended resolution: 1024x1024 or higher
- Face should be clearly visible and forward-facing

**Example (JavaScript):**
```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);
formData.append('template', 'template1');

const response = await fetch('/api/personalize', {
  method: 'POST',
  body: formData,
});

const data = await response.json();
```

**Example (cURL):**
```bash
curl -X POST http://localhost:3000/api/personalize \
  -F "image=@/path/to/photo.jpg" \
  -F "template=template1"
```

**Example (Python):**
```python
import requests

files = {'image': open('photo.jpg', 'rb')}
data = {'template': 'template1'}

response = requests.post(
    'http://localhost:3000/api/personalize',
    files=files,
    data=data
)

result = response.json()
```

#### Response

**Success (200 OK):**
```json
{
  "success": true,
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA...",
  "message": "Image personalized successfully"
}
```

**Field Descriptions:**
- `success`: Boolean indicating operation success
- `image`: Base64-encoded PNG image (data URI format)
- `message`: Human-readable success message

**Validation Error (400 Bad Request):**
```json
{
  "error": "No image file provided"
}
```

**Possible 400 errors:**
- `"No image file provided"`
- `"Invalid file type. Allowed types: image/jpeg, image/png, image/jpg, image/webp"`
- `"File too large. Maximum size: 10MB"`

**Server Error (500 Internal Server Error):**
```json
{
  "error": "Failed to generate personalized image",
  "details": "Stack trace (only in development mode)"
}
```

**Possible 500 errors:**
- `"REPLICATE_API_TOKEN environment variable is not set"`
- `"Failed to generate personalized image"`
- `"Failed to composite image"`
- `"Failed to download image"`

#### Response Headers

```
Content-Type: application/json
Cache-Control: no-cache
```

#### Rate Limits

**Current (Prototype):** None

**Recommended for Production:**
- 10 requests per 15 minutes per IP
- 100 requests per day per user
- 1000 requests per day per API key

#### Processing Time

- **Typical:** 30-60 seconds
- **Range:** 25-90 seconds depending on:
  - Replicate API load
  - Image size
  - Template complexity

**Timeout:** 60 seconds (adjust for your deployment)

---

### GET /api/personalize

Get API information and requirements.

#### Request

No parameters required.

**Example:**
```bash
curl http://localhost:3000/api/personalize
```

#### Response

```json
{
  "message": "Pickabook Personalization API",
  "endpoints": {
    "POST": "/api/personalize - Upload an image for personalization"
  },
  "requirements": {
    "field": "image",
    "allowedTypes": [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp"
    ],
    "maxSize": "10MB"
  }
}
```

---

## Integration Examples

### React Component

```typescript
import { useState } from 'react';

export function PersonalizeButton({ file }: { file: File }) {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const personalize = async () => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/personalize', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.image);
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('Failed to personalize image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={personalize} disabled={loading}>
        {loading ? 'Processing...' : 'Personalize'}
      </button>
      {result && <img src={result} alt="Personalized" />}
    </div>
  );
}
```

### Node.js Script

```javascript
const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function personalizeImage(imagePath) {
  const form = new FormData();
  form.append('image', fs.createReadStream(imagePath));
  form.append('template', 'template1');

  const response = await fetch('http://localhost:3000/api/personalize', {
    method: 'POST',
    body: form,
  });

  const data = await response.json();

  if (data.success) {
    // Extract base64 data
    const base64Data = data.image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Save to file
    fs.writeFileSync('output.png', buffer);
    console.log('Saved to output.png');
  } else {
    console.error('Error:', data.error);
  }
}

personalizeImage('./child-photo.jpg');
```

### Webhook Integration

```typescript
// Receive webhook from external service
app.post('/webhook/photo-uploaded', async (req, res) => {
  const { photoUrl, userId } = req.body;

  // Download photo
  const photoResponse = await fetch(photoUrl);
  const photoBuffer = await photoResponse.buffer();

  // Create FormData
  const form = new FormData();
  form.append('image', photoBuffer, 'photo.jpg');

  // Call personalization API
  const personalizeResponse = await fetch('http://localhost:3000/api/personalize', {
    method: 'POST',
    body: form,
  });

  const result = await personalizeResponse.json();

  // Store result or notify user
  await database.savePersonalization(userId, result.image);

  res.json({ success: true });
});
```

### Batch Processing

```typescript
async function batchPersonalize(imageFiles: File[]) {
  const results = [];

  // Process sequentially to avoid rate limits
  for (const file of imageFiles) {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/personalize', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      results.push({ file: file.name, data });

      // Wait 2 seconds between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      results.push({ file: file.name, error: error.message });
    }
  }

  return results;
}
```

---

## Error Handling

### Client-Side Error Handling

```typescript
async function personalizeWithErrorHandling(file: File) {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/personalize', {
      method: 'POST',
      body: formData,
    });

    // Check HTTP status
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    const data = await response.json();

    // Check success field
    if (!data.success) {
      throw new Error(data.error || 'Personalization failed');
    }

    return data.image;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
}
```

### Retry Logic

```typescript
async function personalizeWithRetry(
  file: File,
  maxRetries = 3,
  delay = 2000
) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await personalize(file);
    } catch (error) {
      if (attempt === maxRetries) throw error;

      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));

      // Exponential backoff
      delay *= 2;
    }
  }
}
```

### Timeout Handling

```typescript
async function personalizeWithTimeout(file: File, timeout = 90000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/personalize', {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
```

---

## Advanced Usage

### Custom Prompts (Future)

```typescript
// Extend API to accept custom prompts
formData.append('prompt', 'anime style, vibrant colors, magical atmosphere');
formData.append('style', 'cartoon'); // or 'realistic', 'watercolor', etc.
```

### Multiple Templates

```typescript
// Generate with different templates in parallel
const templates = ['template1', 'template2', 'template3'];

const results = await Promise.all(
  templates.map(async (template) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('template', template);

    const response = await fetch('/api/personalize', {
      method: 'POST',
      body: formData,
    });

    return response.json();
  })
);
```

### Webhook Notifications (Future)

```typescript
// Submit job and receive webhook when complete
formData.append('webhookUrl', 'https://yourapp.com/webhook/personalization-complete');

// API processes asynchronously
const response = await fetch('/api/personalize', {
  method: 'POST',
  body: formData,
});

const { jobId } = await response.json();

// Later, receive webhook:
// POST https://yourapp.com/webhook/personalization-complete
// { jobId, result: "data:image/png;base64,..." }
```

---

## Testing

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest';

describe('POST /api/personalize', () => {
  it('should reject requests without image', async () => {
    const formData = new FormData();

    const response = await fetch('/api/personalize', {
      method: 'POST',
      body: formData,
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('No image file provided');
  });

  it('should reject oversized images', async () => {
    const largeFile = new File([new ArrayBuffer(11 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg',
    });

    const formData = new FormData();
    formData.append('image', largeFile);

    const response = await fetch('/api/personalize', {
      method: 'POST',
      body: formData,
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('too large');
  });

  it('should personalize valid image', async () => {
    const file = await fetch('/test-fixtures/child-photo.jpg')
      .then(r => r.blob());

    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/personalize', {
      method: 'POST',
      body: formData,
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.image).toContain('data:image/png;base64,');
  });
});
```

---

## Performance Optimization

### Image Preprocessing

```typescript
// Resize large images before uploading
async function optimizeImage(file: File): Promise<Blob> {
  const image = await createImageBitmap(file);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  const maxSize = 1024;
  const scale = Math.min(1, maxSize / Math.max(image.width, image.height));

  canvas.width = image.width * scale;
  canvas.height = image.height * scale;

  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  return new Promise(resolve => {
    canvas.toBlob(blob => resolve(blob!), 'image/jpeg', 0.9);
  });
}
```

### Caching Results

```typescript
// Cache personalization results
const cache = new Map<string, string>();

async function getCachedPersonalization(file: File): Promise<string> {
  // Generate hash of file
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hash = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Check cache
  if (cache.has(hash)) {
    return cache.get(hash)!;
  }

  // Generate new
  const result = await personalize(file);
  cache.set(hash, result);

  return result;
}
```

---

## Security Considerations

### Input Validation

```typescript
// Validate file is actually an image
async function validateImage(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(true);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(false);
    };

    img.src = url;
  });
}
```

### Rate Limiting (Server)

```typescript
import { rateLimit } from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many requests, please try again later' },
});

app.use('/api/personalize', limiter);
```

### CSRF Protection

```typescript
// Use Next.js built-in CSRF protection
import { getCsrfToken } from 'next-auth/react';

const csrfToken = await getCsrfToken();

formData.append('csrfToken', csrfToken);
```

---

## Migration Guide

### From V1 to V2 (Future)

When we add user authentication and storage:

**Before (V1):**
```typescript
const response = await fetch('/api/personalize', {
  method: 'POST',
  body: formData,
});
```

**After (V2):**
```typescript
const response = await fetch('/api/personalize', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  body: formData,
});
```

---

## Support

For API issues:
- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- Review [Replicate API Status](https://status.replicate.com/)
- Open an issue with API logs and request details

## Changelog

### v1.0.0 (Current)
- Initial release
- Basic personalization endpoint
- Single template support
- Base64 response format

### v2.0.0 (Planned)
- User authentication
- Multiple template selection
- Webhook notifications
- Result caching
- Custom style options
- Batch processing API

---

**API Version:** 1.0.0
**Last Updated:** 2024-01-01
**License:** MIT
