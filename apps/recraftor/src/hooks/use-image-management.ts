import { useState, useCallback } from 'react';
import { imageStorage, type ImageData, type ImageMetadata } from '@/lib/image-storage';
import { useToast } from '@/hooks/use-toast';
import { generateImage, vectorizeImage, removeBackground, clarityUpscale, generativeUpscale } from '@/lib/recraft';
import { saveImage } from '@/lib/utils/image-utils';
import { TOOL_NAMES } from '@/lib/constants/tool-names';
import type { RecraftGenerateParams, ToolType, FileUploadParams } from '@/types/recraft';

interface ImageProcessingState {
  loading: boolean;
  processingImageId: string | null;
}

interface ImageManagementActions {
  handleGenerate: (params: RecraftGenerateParams) => Promise<ImageData | void>;
  handleFileUpload: (params: FileUploadParams, tool: ToolType, originalMetadata?: ImageMetadata) => Promise<ImageData | void>;
  startImageProcessing: (imageId: string) => void;
}

interface UseImageManagementProps {
  onImagesChange: (images: ImageData[]) => void;
}

// Add helper function to get file from URL with detailed logging
async function getFileFromUrl(url: string, fileName: string): Promise<File> {
  console.log('Fetching file from URL:', { url, fileName });
  
  const response = await fetch(url);
  console.log('Fetch response headers:', Object.fromEntries(response.headers.entries()));
  
  const contentType = response.headers.get('content-type');
  console.log('Content-Type from response:', contentType);
  
  const blob = await response.blob();
  console.log('Blob details:', {
    size: blob.size,
    type: blob.type
  });

  // Ensure we have a valid content type
  const finalType = contentType || blob.type || 'image/png';
  console.log('Using content type:', finalType);

  // Create a new File with explicit type
  const file = new File([blob], fileName, { 
    type: finalType,
    lastModified: Date.now()
  });

  console.log('Created File object:', {
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: file.lastModified
  });

  return file;
}

export function useImageManagement({ onImagesChange }: UseImageManagementProps): ImageProcessingState & ImageManagementActions {
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

  const handleGenerate = async (params: RecraftGenerateParams): Promise<ImageData | void> => {
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

  const handleFileUpload = async (
    params: FileUploadParams,
    tool: ToolType,
    originalMetadata?: ImageMetadata
  ): Promise<ImageData | void> => {
    try {
      setLoading(true);
      if (params.file) {
        setProcessingImageId(params.file instanceof File ? params.file.name : 'image');
      }

      // Check if the image is already vectorized when trying to vectorize
      if (tool === 'vectorize' && originalMetadata?.style === 'vector_illustration') {
        toast({
          title: 'Cannot vectorize',
          description: 'This image is already in vector format.',
          variant: 'destructive',
        });
        return;
      }

      let fileToProcess: File;
      if (params.file instanceof File) {
        const fileName = originalMetadata?.prompt 
          ? `${originalMetadata.prompt}.png`
          : params.file.name;
        fileToProcess = new File([params.file], fileName, { 
          type: params.file.type || 'image/png',
          lastModified: Date.now()
        });
      } else if (params.file instanceof Blob) {
        const fileName = originalMetadata?.prompt 
          ? `${originalMetadata.prompt}.png`
          : 'image.png';
        fileToProcess = new File([params.file], fileName, { 
          type: params.file.type || 'image/png',
          lastModified: Date.now()
        });
      } else if (typeof params.file === 'string' && params.file.startsWith('blob:')) {
        const fileName = originalMetadata?.prompt 
          ? `${originalMetadata.prompt}.png`
          : 'image.png';
        fileToProcess = await getFileFromUrl(params.file, fileName);
      } else {
        throw new Error('Invalid file format');
      }

      console.log('Processed file details:', {
        name: fileToProcess.name,
        type: fileToProcess.type,
        size: fileToProcess.size,
        lastModified: fileToProcess.lastModified
      });

      const response = await processImage({
        ...params,
        file: fileToProcess,
        metadata: originalMetadata
      }, tool);
      
      console.log(`${tool} processing response:`, response);

      const baseMetadata: ImageMetadata = {
        tool,
        ...(originalMetadata && {
          prompt: originalMetadata.prompt,
          style: tool === 'vectorize' ? 'vector_illustration' : originalMetadata.style,
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
      
      toast({
        title: `${TOOL_NAMES[tool]} successful`,
        description: 'Image processed successfully',
      });

      await refreshImages();
      return savedImage;
    } catch (error: any) {
      console.error(`${tool} processing error:`, {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      
      let errorMessage = error.message;
      if (errorMessage.includes('Token operation not approved')) {
        errorMessage = 'Insufficient tokens for this operation';
      } else if (error.response?.status === 400) {
        if (tool === 'vectorize' && error.response?.data?.error?.includes('format')) {
          errorMessage = 'This image format cannot be vectorized. Please try a different image.';
        } else {
          errorMessage = 'Invalid image format or content. Please try a different image.';
        }
      } else if (error.response?.status === 413) {
        errorMessage = 'Image file is too large. Please try a smaller image.';
      } else if (error.response?.status === 402) {
        errorMessage = 'Insufficient tokens for this operation';
      }

      toast({
        title: `Error processing image with ${TOOL_NAMES[tool]}`,
        description: errorMessage,
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