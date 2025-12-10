export interface PersonalizationRequest {
  image: File;
  template?: string;
}

export interface PersonalizationResponse {
  success: boolean;
  image?: string;
  error?: string;
  message?: string;
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

export interface AIModelConfig {
  modelId: string;
  version: string;
  defaultParams: Record<string, unknown>;
}

export interface UploadState {
  file: File | null;
  previewUrl: string | null;
  isProcessing: boolean;
  error: string | null;
  resultImage: string | null;
  success: boolean;
}
