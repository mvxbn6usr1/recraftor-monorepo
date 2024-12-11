import { useState, useCallback } from 'react';
import type { ImageMetadata } from '@/lib/image-storage';
import { useToast, type Toast } from '@/hooks/use-toast';
import { generateImage, vectorizeImage, removeBackground, clarityUpscale, generativeUpscale } from '@/lib/recraft';
import { saveImage } from '@/lib/utils/image-utils';
import { TOOL_NAMES } from '@/lib/constants/tool-names';
import type { RecraftGenerateParams, ToolType, FileUploadParams } from '@/types/recraft';

interface ImageProcessingState {
  loading: boolean;
  processingImageId: string | null;
}

interface ImageManagementActions {
  handleGenerate: (params: RecraftGenerateParams) => Promise<void>;
  handleFileUpload: (params: FileUploadParams, tool: ToolType, originalMetadata?: ImageMetadata) => Promise<void>;
  startImageProcessing: (imageId: string) => void;
}

interface UseImageManagementProps {
  onImagesChange?: (images: ImageData[]) => void;
}

export function useImageManagement({ onImagesChange }: UseImageManagementProps = {}): ImageProcessingState & ImageManagementActions {
  const [loading, setLoading] = useState(false);
  const [processingImageId, setProcessingImageId] = useState<string | null>(null);
  const { toast } = useToast();

  const refreshImages = useCallback(async () => {
    if (onImagesChange) {
      try {
        const images = await imageStorage.getImages();
        onImagesChange(images);
      } catch (error) {
        console.error('Failed to refresh images:', error);
      }
    }
  }, [onImagesChange]);

  const handleGenerate = async (params: RecraftGenerateParams) => {
    console.log('Generating with params:', params);
    setLoading(true);
    try {
      const response = await generateImage(params);
      console.log('Generation response:', response);

      const metadata: ImageMetadata = {
        prompt: params.prompt,
        style: params.style,
        style_id: params.style_id,
        substyle: params.substyle,
        tool: 'generate',
        model: params.model,
        size: params.size,
        controls: params.controls
      };

      const title = `[Generated] ${params.prompt}`;
      const savedImage = await saveImage({ 
        url: response.data[0].url, 
        metadata, 
        title, 
        toast 
      });
      
      // Immediately update images after saving
      await refreshImages();
      return savedImage;
    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: 'Error generating image',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (params: FileUploadParams, tool: ToolType, originalMetadata?: ImageMetadata) => {
    console.log('Starting file upload with tool:', tool, 'Original metadata:', originalMetadata);
    setLoading(true);
    try {
      const response = await processImage(params, tool);
      console.log('Processing response:', response);

      const baseMetadata: ImageMetadata = {
        tool,
        ...(originalMetadata && {
          prompt: originalMetadata.prompt,
          style: originalMetadata.style,
          style_id: originalMetadata.style_id,
          substyle: originalMetadata.substyle,
          model: originalMetadata.model,
          size: originalMetadata.size,
          controls: originalMetadata.controls
        }),
        ...(processingImageId && { originalImageId: processingImageId })
      };

      const title = originalMetadata?.prompt 
        ? `[${TOOL_NAMES[tool]}] ${originalMetadata.prompt}`
        : `[${TOOL_NAMES[tool]}]`;

      const savedImage = await saveImage({
        url: response.data[0].url,
        metadata: baseMetadata,
        title,
        toast
      });
      
      // Immediately update images after saving
      await refreshImages();
      return savedImage;
    } catch (error: any) {
      console.error('Processing error:', error);
      toast({
        title: 'Error processing image',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
      setProcessingImageId(null);
    }
  };

  const processImage = async (params: FileUploadParams, tool: ToolType) => {
    switch (tool) {
      case 'vectorize':
        return vectorizeImage(params);
      case 'removeBackground':
        return removeBackground(params);
      case 'clarityUpscale':
        return clarityUpscale(params);
      case 'generativeUpscale':
        return generativeUpscale(params);
      default:
        throw new Error(`Unsupported tool: ${tool}`);
    }
  };

  const startImageProcessing = useCallback((imageId: string) => {
    setProcessingImageId(imageId);
  }, []);

  return {
    loading,
    processingImageId,
    handleGenerate,
    handleFileUpload,
    startImageProcessing
  };
}