import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

export interface CompositeOptions {
  aiGeneratedImageUrl: string;
  templateName?: string;
}

export interface CompositeResult {
  base64Image: string;
  error?: string;
}

export interface TemplateConfig {
  name: string;
  facePosition: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

const TEMPLATES: Record<string, TemplateConfig> = {
  template1: {
    name: 'template1',
    facePosition: {
      x: 300,
      y: 150,
      width: 400,
      height: 400,
    },
  },
  template2: {
    name: 'template2',
    facePosition: {
      x: 250,
      y: 100,
      width: 500,
      height: 500,
    },
  },
};

export class ImageCompositor {
  async downloadImage(url: string): Promise<Buffer> {
    try {
      console.log('Downloading AI-generated image from:', url);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      console.error('Error downloading image:', error);
      throw error;
    }
  }

  async compositeOnTemplate(
    options: CompositeOptions
  ): Promise<CompositeResult> {
    try {
      const templateName = options.templateName || 'template1';
      const templateConfig = TEMPLATES[templateName];

      if (!templateConfig) {
        throw new Error(`Template ${templateName} not found`);
      }

      const templatePath = path.join(
        process.cwd(),
        'public',
        'templates',
        `${templateName}.png`
      );

      console.log('Loading template from:', templatePath);

      let templateExists = false;
      try {
        await fs.access(templatePath);
        templateExists = true;
      } catch (err) {
        console.warn(`Template ${templateName}.png not found, using AI image directly`);
      }

      const aiImageBuffer = await this.downloadImage(
        options.aiGeneratedImageUrl
      );

      if (!templateExists) {
        const resizedImage = await sharp(aiImageBuffer)
          .resize(1024, 1024, {
            fit: 'cover',
            position: 'center',
          })
          .toBuffer();

        const base64Image = resizedImage.toString('base64');
        return {
          base64Image: `data:image/png;base64,${base64Image}`,
        };
      }

      const { x, y, width, height } = templateConfig.facePosition;

      const resizedFace = await sharp(aiImageBuffer)
        .resize(width, height, {
          fit: 'cover',
          position: 'center',
        })
        .toBuffer();

      const templateBuffer = await fs.readFile(templatePath);

      const compositedImage = await sharp(templateBuffer)
        .composite([
          {
            input: resizedFace,
            top: y,
            left: x,
            blend: 'over',
          },
        ])
        .png()
        .toBuffer();

      const base64Image = compositedImage.toString('base64');

      console.log('Image composition successful');

      return {
        base64Image: `data:image/png;base64,${base64Image}`,
      };
    } catch (error) {
      console.error('Image Compositor Error:', error);

      return {
        base64Image: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async getAvailableTemplates(): Promise<string[]> {
    const templatesDir = path.join(process.cwd(), 'public', 'templates');

    try {
      const files = await fs.readdir(templatesDir);
      return files
        .filter((file) => file.endsWith('.png'))
        .map((file) => file.replace('.png', ''));
    } catch (error) {
      console.warn('Templates directory not found:', error);
      return [];
    }
  }
}

export function createImageCompositor(): ImageCompositor {
  return new ImageCompositor();
}
