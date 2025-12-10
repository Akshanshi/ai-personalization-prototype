import { NextRequest, NextResponse } from 'next/server';
import { createAIService } from '@/lib/ai-service';
import { createImageCompositor } from '@/lib/image-compositor';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

export async function POST(request: NextRequest) {
  try {
    console.log('Received personalization request');

    const formData = await request.formData();
    const file = formData.get('image') as File | null;
    const templateName = formData.get('template') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        },
        { status: 400 }
      );
    }

    console.log(`Processing file: ${file.name} (${file.size} bytes, ${file.type})`);

    const arrayBuffer = await file.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    const aiService = createAIService();

    console.log('Step 1: Generating personalized illustration with AI...');
    const aiResult = await aiService.personalizeImage({
      imageBuffer,
      prompt: 'cute cartoon style, colorful, friendly, childrens book illustration, happy child',
    });

    if (aiResult.error || !aiResult.imageUrl) {
      console.error('AI generation failed:', aiResult.error);
      return NextResponse.json(
        {
          error: aiResult.error || 'Failed to generate personalized image',
        },
        { status: 500 }
      );
    }

    console.log('Step 2: Compositing onto template...');
    const compositor = createImageCompositor();
    const compositeResult = await compositor.compositeOnTemplate({
      aiGeneratedImageUrl: aiResult.imageUrl,
      templateName: templateName || 'template1',
    });

    if (compositeResult.error || !compositeResult.base64Image) {
      console.error('Composition failed:', compositeResult.error);
      return NextResponse.json(
        {
          error: compositeResult.error || 'Failed to composite image',
        },
        { status: 500 }
      );
    }

    console.log('Personalization completed successfully');

    return NextResponse.json({
      success: true,
      image: compositeResult.base64Image,
      message: 'Image personalized successfully',
    });
  } catch (error) {
    console.error('Personalization API Error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error';

    return NextResponse.json(
      {
        error: errorMessage,
        details:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.stack
              : String(error)
            : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Pickabook Personalization API',
    endpoints: {
      POST: '/api/personalize - Upload an image for personalization',
    },
    requirements: {
      field: 'image',
      allowedTypes: ALLOWED_TYPES,
      maxSize: `${MAX_FILE_SIZE / 1024 / 1024}MB`,
    },
  });
}
