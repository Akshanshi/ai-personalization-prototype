import Replicate from 'replicate';

export interface PersonalizationOptions {
  imageBuffer: Buffer;
  prompt?: string;
}

export interface PersonalizationResult {
  imageUrl: string;
  error?: string;
}

export class AIService {
  private replicate: Replicate;

  constructor(apiToken: string) {
    if (!apiToken) {
      throw new Error('REPLICATE_API_TOKEN is required');
    }
    this.replicate = new Replicate({
      auth: apiToken,
    });
  }

  async personalizeImage(
    options: PersonalizationOptions
  ): Promise<PersonalizationResult> {
    try {
      const base64Image = options.imageBuffer.toString('base64');
      const dataUri = `data:image/jpeg;base64,${base64Image}`;

      console.log('Calling Replicate API for image personalization...');

      const output = await this.replicate.run(
        'fofr/face-to-sticker:764d4827ea159608a07cdde8ddf1c6000019627515eb02b6b449695fd547e5ef',
        {
          input: {
            image: dataUri,
            steps: 20,
            width: 1024,
            height: 1024,
            prompt: options.prompt || 'cute cartoon style, colorful, friendly, childrens book illustration',
            upscale: false,
            upscale_steps: 10,
            negative_prompt: 'ugly, blurry, poor quality',
            prompt_strength: 4.5,
            ip_adapter_noise: 0.5,
            ip_adapter_weight: 0.2,
            instant_id_strength: 0.7,
          },
        }
      );

      if (!output || (Array.isArray(output) && output.length === 0)) {
        throw new Error('No output received from AI model');
      }

      const imageUrl = Array.isArray(output) ? output[0] : output;

      console.log('AI personalization successful:', imageUrl);

      return {
        imageUrl: imageUrl as string,
      };
    } catch (error) {
      console.error('AI Service Error:', error);

      return {
        imageUrl: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.replicate.models.get('fofr', 'face-to-sticker');
      return true;
    } catch (error) {
      console.error('Failed to connect to Replicate:', error);
      return false;
    }
  }
}

export function createAIService(): AIService {
  const apiToken = process.env.REPLICATE_API_TOKEN;

  if (!apiToken) {
    throw new Error(
      'REPLICATE_API_TOKEN environment variable is not set. ' +
      'Please add it to your .env.local file. ' +
      'Get your token from: https://replicate.com/account/api-tokens'
    );
  }

  return new AIService(apiToken);
}
