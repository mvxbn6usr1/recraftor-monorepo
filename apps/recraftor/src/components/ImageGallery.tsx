import { useState, useEffect, useCallback, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ImageModal } from '@/components/ui/image-modal';
import { DialogWithTitle } from '@/components/ui/dialog-with-title';
import { ImageCard } from '@/components/gallery/ImageCard';
import { EmptyGallery } from '@/components/gallery/EmptyGallery';
import { LoadingCard } from '@/components/gallery/LoadingCard';
import { ErrorDisplay } from '@/components/gallery/ErrorDisplay';
import { ImageMetadata } from '@/components/ImageMetadata';
import { ResponsiveImageModal } from '@/components/modals/ResponsiveImageModal';
import { ResponsiveMetadataModal } from '@/components/modals/ResponsiveMetadataModal';
import { useMediaQuery } from '@/hooks/use-media-query';
import { imageStorage } from '@/lib/image-storage';
import { styleStorage } from '@/lib/style-storage';
import { imageCache } from '@/lib/utils/image-cache';
import type { ToolType } from '@/types/recraft';
import type { RecraftGenerateParams } from '@/types/recraft';
import type { ImageData } from '@/lib/image-storage';

interface ImageGalleryProps {
  loading: boolean;
  onImageAction: (imageId: string, tool: ToolType) => void;
  processingImageId: string | null;
  onUseAsInput?: (params: Partial<RecraftGenerateParams>) => void;
  images: ImageData[];
  onImagesChange: (images: ImageData[]) => void;
}

export function ImageGallery({ 
  loading: globalLoading, 
  onImageAction, 
  processingImageId, 
  onUseAsInput,
  images,
  onImagesChange
}: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [metadataOpen, setMetadataOpen] = useState(false);
  const [selectedMetadata, setSelectedMetadata] = useState<ImageData | null>(null);
  const [customStyleName, setCustomStyleName] = useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const loadingRef = useRef(false);

  useEffect(() => {
    if (selectedMetadata?.metadata.style_id) {
      styleStorage.getStyle(selectedMetadata.metadata.style_id)
        .then(style => {
          if (style) {
            setCustomStyleName(style.name);
          }
        })
        .catch(console.error);
    } else {
      setCustomStyleName(null);
    }
  }, [selectedMetadata]);

  // Add cleanup interval for cache
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      imageCache.cleanup();
    }, 5 * 60 * 1000); // Clean up every 5 minutes

    return () => {
      clearInterval(cleanupInterval);
      imageCache.cleanupAllUrls(); // Clean up all URLs on unmount
    };
  }, []);

  // Add cleanup on window unload
  useEffect(() => {
    const handleUnload = () => {
      imageCache.cleanupAllUrls();
    };

    window.addEventListener('unload', handleUnload);
    return () => {
      window.removeEventListener('unload', handleUnload);
    };
  }, []);

  const deleteImage = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await imageStorage.deleteImage(id);
      imageCache.removeCachedImage(id);
      onImagesChange(images.filter(img => img.id !== id));
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  };

  const handleImageClick = useCallback((image: ImageData) => {
    if (image.id === processingImageId) return;
    setSelectedImage(image);
    setModalOpen(true);
  }, [processingImageId]);

  const handleInfoClick = useCallback((image: ImageData, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMetadata(image);
    setMetadataOpen(true);
  }, []);

  const handleImageAction = useCallback((tool: ToolType) => {
    if (selectedImage) {
      onImageAction(selectedImage.id, tool);
      setModalOpen(false);
    }
  }, [selectedImage, onImageAction]);

  const handleDownload = async (image: ImageData, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      
      // Determine file extension based on style or content type
      let extension = 'png';
      if (image.metadata.style === 'vector_illustration') {
        extension = 'svg';
      } else if (blob.type === 'image/svg+xml') {
        extension = 'svg';
      }
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `image-${Date.now()}.${extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  const handleUseAsInput = () => {
    if (selectedMetadata?.metadata) {
      const params: Partial<RecraftGenerateParams> = {
        prompt: selectedMetadata.metadata.prompt,
        style: selectedMetadata.metadata.style,
        style_id: selectedMetadata.metadata.style_id,
        substyle: selectedMetadata.metadata.substyle,
        model: selectedMetadata.metadata.model,
        size: selectedMetadata.metadata.size,
        controls: selectedMetadata.metadata.controls
      };
      onUseAsInput?.(params);
      setMetadataOpen(false);
    }
  };

  if (loadError) {
    return <ErrorDisplay message={loadError} />;
  }

  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(loading || globalLoading) && <LoadingCard />}
            
            {images.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                isProcessing={image.id === processingImageId}
                onImageClick={() => handleImageClick(image)}
                onInfoClick={(e) => handleInfoClick(image, e)}
                onDownload={(e) => handleDownload(image, e)}
                onDelete={(e) => deleteImage(image.id, e)}
              />
            ))}
          </div>

          {images.length === 0 && !loading && !globalLoading && (
            <EmptyGallery />
          )}
        </div>
      </ScrollArea>

      {selectedImage && (
        isMobile ? (
          <ResponsiveImageModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            imageUrl={selectedImage.url}
            title={selectedImage.title}
            onActionClick={handleImageAction}
            metadata={selectedImage.metadata}
          />
        ) : (
          <ImageModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            imageUrl={selectedImage.url}
            title={selectedImage.title}
            onActionClick={handleImageAction}
            metadata={selectedImage.metadata}
          />
        )
      )}

      {selectedMetadata && (
        isMobile ? (
          <ResponsiveMetadataModal
            open={metadataOpen}
            onOpenChange={setMetadataOpen}
            metadata={selectedMetadata}
            customStyleName={customStyleName}
            onUseAsInput={onUseAsInput && handleUseAsInput}
          />
        ) : (
          <DialogWithTitle
            open={metadataOpen}
            onOpenChange={setMetadataOpen}
            title="Image Metadata"
            description="Details and settings used to create this image"
          >
            <ImageMetadata
              metadata={selectedMetadata}
              customStyleName={customStyleName}
              onUseAsInput={onUseAsInput && handleUseAsInput}
            />
          </DialogWithTitle>
        )
      )}
    </div>
  );
}