import { useState, useCallback, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { ImageGallery } from '@/components/ImageGallery';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { useImageManagement } from '@/hooks/use-image-management';
import { createStyle } from '@/lib/recraft';
import { imageStorage } from '@/lib/image-storage';
import type { ImageData } from '@/lib/image-storage';
import { Debug } from '@/components/Debug';
import { ResponsiveWrapper } from '@/components/responsive/ResponsiveWrapper';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { styleStorage } from '@/lib/style-storage';
import type { ToolType } from '@/types/recraft';
import type { RecraftGenerateParams } from '@/types/recraft';
import type { FileUploadParams, CreateStyleParams, StyleType } from '@/types/recraft';

interface UploadState {
  file?: File | null;
  files?: File[];
}

const defaultGenerateParams: RecraftGenerateParams = {
  prompt: '',
  style: 'realistic_image',
  model: 'recraftv3',
  size: '1024x1024',
  controls: {
    colors: [],
  },
};

const defaultUploadParams: Record<ToolType, UploadState> = {
  vectorize: { file: null },
  removeBackground: { file: null },
  clarityUpscale: { file: null },
  generativeUpscale: { file: null },
  createStyle: { files: [] },
  generate: { file: null },
};

const defaultCreateStyleParams: CreateStyleParams = {
  style: 'digital_illustration',
  files: [],
};

function App() {
  const [activeTool, setActiveTool] = useState<ToolType>(() => {
    const saved = localStorage.getItem('activeTool');
    return (saved as ToolType) || 'generate';
  });

  const [images, setImages] = useState<ImageData[]>([]);
  const [errorDialog, setErrorDialog] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
  const { toast } = useToast();
  
  const {
    loading,
    processingImageId,
    handleGenerate: generateImage,
    handleFileUpload: uploadFile,
    startImageProcessing
  } = useImageManagement({
    onImagesChange: useCallback((newImages: ImageData[]) => {
      setImages(newImages);
    }, [])
  });

  // Load generate params from localStorage
  const [generateParams, setGenerateParams] = useState<RecraftGenerateParams>(() => {
    const saved = localStorage.getItem('generateParams');
    return saved ? JSON.parse(saved) : defaultGenerateParams;
  });

  // Load upload params from localStorage (note: files can't be stored in localStorage)
  const [uploadParams, setUploadParams] = useState<Record<ToolType, UploadState>>(defaultUploadParams);

  // Load create style params from localStorage (note: files can't be stored in localStorage)
  const [createStyleParams, setCreateStyleParams] = useState<CreateStyleParams>(defaultCreateStyleParams);

  // Load images on mount and when loading state changes
  useEffect(() => {
    const loadImages = async () => {
      try {
        const loadedImages = await imageStorage.getImages();
        setImages(loadedImages);
      } catch (error) {
        console.error('Failed to load images:', error);
      }
    };
    loadImages();
  }, [loading]); // Reload when loading state changes

  // Save active tool to localStorage
  useEffect(() => {
    localStorage.setItem('activeTool', activeTool);
  }, [activeTool]);

  // Save generate params to localStorage
  useEffect(() => {
    localStorage.setItem('generateParams', JSON.stringify(generateParams));
  }, [generateParams]);

  const handleCreateStyle = async (params: CreateStyleParams) => {
    // Update persistent state
    setCreateStyleParams(params);
    
    try {
      const response = await createStyle(params);
      console.log('Style creation response:', response);

      // Prompt for style name
      const styleName = window.prompt('Enter a name for your custom style:');
      if (styleName) {
        // Save to IndexedDB
        await styleStorage.saveStyle(response.id, styleName, params.style);
      }

      toast({
        title: 'Style created successfully',
        description: `Style saved as: ${styleName}`,
      });
    } catch (error: any) {
      console.error('Style creation error:', error);
      toast({
        title: 'Error creating style',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleImageAction = useCallback(async (imageId: string, tool: ToolType) => {
    console.log('Starting image action:', { imageId, tool });
    
    try {
      const image = await imageStorage.getImage(imageId);
      console.log('Found image for action:', image);
      if (!image) {
        throw new Error('Image not found');
      }

      // Validate tool compatibility
      if (tool === 'clarityUpscale' && image.metadata.tool === 'vectorize') {
        setErrorDialog({
          open: true,
          message: 'Cannot upscale a vectorized image. Please use the original image instead.'
        });
        return;
      }

      // Set processing state
      startImageProcessing(imageId);

      // Download the image and convert it to a File object
      const response = await fetch(image.url);
      const blob = await response.blob();
      const file = new File([blob], 'image.png', { type: 'image/png' });
      
      // Process the image with the selected tool and pass original metadata
      let originalMetadata = image.metadata;
      if (image.metadata.originalImageId) {
        const originalImage = await imageStorage.getImage(image.metadata.originalImageId);
        if (originalImage?.metadata) {
          originalMetadata = originalImage.metadata;
        }
      }

      await uploadFile({ file }, tool, {
        ...originalMetadata,
        style: originalMetadata.style as StyleType | undefined
      });

      // Refresh images after successful processing
      const updatedImages = await imageStorage.getImages();
      setImages(updatedImages);
    } catch (error: any) {
      console.error('Image action error:', error);
      setErrorDialog({
        open: true,
        message: error.message
      });
    }
  }, [uploadFile, startImageProcessing]);

  const handleUseAsInput = (params: Partial<RecraftGenerateParams>) => {
    setGenerateParams(prev => ({
      ...prev,
      ...params
    }));
    setActiveTool('generate');
  };

  const handleGenerateWithTokens = async (params: RecraftGenerateParams) => {
    try {
      // Request token operation before generating
      const hasTokens = await window.requestTokenOperation('raster_generation', {
        prompt: params.prompt,
        style: params.style
      });

      if (!hasTokens) {
        toast({
          title: 'Insufficient tokens',
          description: 'Please purchase more tokens to continue.',
          variant: 'destructive'
        });
        return;
      }

      // Proceed with generation using the renamed function
      await generateImage(params);
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: 'Error generating image',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    }
  };

  const handleFileUploadWithTokens = async (params: FileUploadParams, tool: ToolType, metadata?: any) => {
    try {
      // Map tools to operation types
      const operationMap: Record<ToolType, string> = {
        vectorize: 'vector_generation',
        removeBackground: 'background_removal',
        clarityUpscale: 'clarity_upscale',
        generativeUpscale: 'generative_upscale',
        createStyle: 'style_creation',
        generate: 'raster_generation'
      };

      const operation = operationMap[tool];
      const hasTokens = await window.requestTokenOperation(operation, {
        tool,
        ...metadata
      });

      if (!hasTokens) {
        toast({
          title: 'Insufficient tokens',
          description: 'Please purchase more tokens to continue.',
          variant: 'destructive'
        });
        return;
      }

      // Proceed with file upload using the renamed function
      await uploadFile(params, tool, metadata);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error processing image',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    }
  };

  const sidebar = (
    <Sidebar 
      activeTool={activeTool}
      onGenerate={handleGenerateWithTokens}
      onUpload={handleFileUploadWithTokens}
      onCreateStyle={handleCreateStyle}
      loading={loading} 
      generateParams={generateParams}
      onGenerateParamsChange={setGenerateParams}
      uploadParams={uploadParams}
      createStyleParams={createStyleParams}
      onCreateStyleParamsChange={setCreateStyleParams}
    />
  );

  const content = (
    <>
      <div className="hidden lg:block">
        <Topbar activeTool={activeTool} onToolChange={setActiveTool} images={images} />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden lg:block w-96">
          {sidebar}
        </div>
        <ImageGallery
          loading={loading}
          onImageAction={handleImageAction}
          processingImageId={processingImageId}
          onUseAsInput={handleUseAsInput}
          images={images}
          onImagesChange={setImages}
        />
      </div>
    </>
  );

  return (
    <ThemeProvider defaultTheme="dark" storageKey="recraft-theme">
      <Debug />
      <ResponsiveWrapper 
        sidebar={sidebar} 
        activeTool={activeTool} 
        onToolChange={setActiveTool}
        images={images}
      >
        {content}
      </ResponsiveWrapper>
      <Toaster />
      <AlertDialog open={errorDialog.open} onOpenChange={(open) => setErrorDialog({ ...errorDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>{errorDialog.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ThemeProvider>
  );
}

export default App;