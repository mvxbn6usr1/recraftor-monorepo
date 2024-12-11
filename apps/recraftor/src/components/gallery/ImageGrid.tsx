import { ImageCard } from './ImageCard';
import { LoadingCard } from './LoadingCard';
import { EmptyGallery } from './EmptyGallery';
import { cn } from '@/lib/utils';
import type { ImageData } from '@/lib/image-storage';

interface ImageGridProps {
  images: ImageData[];
  loading: boolean;
  globalLoading: boolean;
  processingImageId: string | null;
  onImageClick: (image: ImageData) => void;
  onInfoClick: (image: ImageData, e: React.MouseEvent) => void;
  onDownload: (url: string, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  className?: string;
}

export function ImageGrid({
  images,
  loading,
  globalLoading,
  processingImageId,
  onImageClick,
  onInfoClick,
  onDownload,
  onDelete,
  className
}: ImageGridProps) {
  return (
    <div 
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr gap-4 md:gap-6 p-4 md:p-6",
        className
      )}
      role="grid"
      aria-busy={loading || globalLoading}
    >
      {(loading || globalLoading) && (
        Array.from({ length: 3 }).map((_, i) => (
          <LoadingCard key={i} />
        ))
      )}
      
      {images.map((image) => (
        <ImageCard
          key={image.id}
          image={image}
          isProcessing={image.id === processingImageId}
          onImageClick={() => onImageClick(image)}
          onInfoClick={(e) => onInfoClick(image, e)}
          onDownload={(e) => onDownload(image.url, e)}
          onDelete={(e) => onDelete(image.id, e)}
        />
      ))}

      {images.length === 0 && !loading && !globalLoading && (
        <div className="col-span-full">
          <EmptyGallery />
        </div>
      )}
    </div>
  );
}