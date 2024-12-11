import { useState } from 'react';
import { MoreVertical, Download, Info, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { ImageData } from '@/lib/image-storage';

interface ImageCardProps {
  image: ImageData;
  isProcessing?: boolean;
  onImageClick?: () => void;
  onInfoClick?: (e: React.MouseEvent) => void;
  onDownload?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  className?: string;
}

export function ImageCard({
  image,
  isProcessing,
  onImageClick,
  onInfoClick,
  onDownload,
  onDelete,
  className,
}: ImageCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isProcessing && onImageClick) {
      onImageClick();
    }
  };

  const isVectorImage = image.metadata.style === 'vector_illustration' || image.url.endsWith('.svg');

  return (
    <div
      className={cn(
        "group relative aspect-square overflow-hidden rounded-lg border bg-background",
        isProcessing && "opacity-75",
        className
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e as unknown as React.MouseEvent);
        }
      }}
    >
      <div className="absolute inset-0 z-10 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100" />
      
      {!imageError && (
        <img
          src={image.url}
          alt={image.title}
          className={cn(
            "h-full w-full cursor-pointer object-cover transition-all group-hover:scale-105",
            isVectorImage && "object-contain p-4",
            isLoading && "opacity-0",
            !isLoading && "opacity-100"
          )}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}

      {imageError && (
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-muted-foreground">Failed to load image</p>
        </div>
      )}

      {isLoading && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <Loader2 className="h-6 w-6 animate-spin text-white" />
        </div>
      )}

      <div 
        className="absolute right-2 top-2 z-20 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={(e) => e.stopPropagation()} // Prevent modal from opening when clicking menu
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8"
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onInfoClick}>
              <Info className="mr-2 h-4 w-4" />
              Info
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onDelete}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Title overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
        <h3 className="text-sm font-medium text-white truncate">
          {image.title || 'Untitled'}
        </h3>
      </div>
    </div>
  );
}