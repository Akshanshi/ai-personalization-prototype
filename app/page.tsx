'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Upload, Image as ImageIcon, Download, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface UploadState {
  file: File | null;
  previewUrl: string | null;
  isProcessing: boolean;
  error: string | null;
  resultImage: string | null;
  success: boolean;
}

export default function Home() {
  const [state, setState] = useState<UploadState>({
    file: null,
    previewUrl: null,
    isProcessing: false,
    error: null,
    resultImage: null,
    success: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setState((prev) => ({
        ...prev,
        error: 'Please select a valid image file (JPG, PNG, or WebP)',
      }));
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setState((prev) => ({
        ...prev,
        error: 'File is too large. Maximum size is 10MB',
      }));
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setState({
      file,
      previewUrl,
      isProcessing: false,
      error: null,
      resultImage: null,
      success: false,
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    if (state.previewUrl) {
      URL.revokeObjectURL(state.previewUrl);
    }

    setState({
      file: null,
      previewUrl: null,
      isProcessing: false,
      error: null,
      resultImage: null,
      success: false,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerate = async () => {
    if (!state.file) {
      setState((prev) => ({ ...prev, error: 'Please select an image first' }));
      return;
    }

    setState((prev) => ({
      ...prev,
      isProcessing: true,
      error: null,
      success: false,
    }));

    try {
      const formData = new FormData();
      formData.append('image', state.file);
      formData.append('template', 'template1');

      console.log('Sending request to API...');

      const response = await fetch('/api/personalize', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to personalize image');
      }

      console.log('Received personalized image');

      setState((prev) => ({
        ...prev,
        isProcessing: false,
        resultImage: data.image,
        success: true,
      }));
    } catch (error) {
      console.error('Error:', error);
      setState((prev) => ({
        ...prev,
        isProcessing: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      }));
    }
  };

  const handleDownload = () => {
    if (!state.resultImage) return;

    const link = document.createElement('a');
    link.href = state.resultImage;
    link.download = `pickabook-personalized-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-orange-600" />
            <h1 className="text-5xl font-bold text-gray-900">Pickabook</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your child&apos;s photo into a magical storybook illustration
          </p>
        </header>

        {state.error && (
          <Alert variant="destructive" className="mb-6 max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        {state.success && (
          <Alert className="mb-6 max-w-2xl mx-auto bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Success!</AlertTitle>
            <AlertDescription className="text-green-700">
              Your personalized illustration is ready!
            </AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card className="shadow-lg border-2 hover:border-orange-300 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-orange-600" />
                Upload Photo
              </CardTitle>
              <CardDescription>
                Choose a clear photo of your child&apos;s face
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />

              {!state.previewUrl ? (
                <div
                  onClick={handleUploadClick}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all"
                >
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-2">Click to upload an image</p>
                  <p className="text-sm text-gray-500">
                    JPG, PNG, or WebP (max 10MB)
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
                    <img
                      src={state.previewUrl}
                      alt="Preview"
                      className="w-full h-80 object-cover"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleUploadClick}
                      variant="outline"
                      className="flex-1"
                    >
                      Change Photo
                    </Button>
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      className="flex-1"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg border-2 hover:border-orange-300 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-600" />
                Personalized Result
              </CardTitle>
              <CardDescription>
                Your magical storybook illustration
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!state.resultImage && !state.isProcessing ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-50">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-2">Your result will appear here</p>
                  <p className="text-sm text-gray-500">
                    Upload a photo and click Generate to see the magic
                  </p>
                </div>
              ) : state.isProcessing ? (
                <div className="border-2 border-orange-300 rounded-lg p-12 text-center bg-orange-50">
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-600 border-t-transparent"></div>
                    <div className="space-y-2">
                      <p className="text-orange-800 font-medium">
                        Creating your magical illustration...
                      </p>
                      <p className="text-sm text-orange-600">
                        This may take 30-60 seconds
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden border-2 border-orange-200">
                    <img
                      src={state.resultImage || ''}
                      alt="Personalized illustration"
                      className="w-full h-80 object-cover"
                    />
                  </div>
                  <Button
                    onClick={handleDownload}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Image
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button
            onClick={handleGenerate}
            disabled={!state.file || state.isProcessing}
            size="lg"
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {state.isProcessing ? 'Generating...' : 'Generate Personalized Illustration'}
          </Button>
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            Powered by AI • This is a prototype for demonstration purposes
          </p>
        </div>
      </div>
    </div>
  );
}
