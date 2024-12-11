import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileImage, Eraser, ArrowUpCircle, Layers } from 'lucide-react';
import type { ToolType, StyleType } from '@/types/recraft';

interface ImageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  title?: string;
  onActionClick: (tool: ToolType) => void;
  metadata?: {
    style?: StyleType;
    [key: string]: any;
  };
}

export function ImageModal({
  open,
  onOpenChange,
  imageUrl,
  title,
  onActionClick,
  metadata
}: ImageModalProps) {
  const isVectorImage = metadata?.style === 'vector_illustration';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogTitle className="sr-only">{title || 'Image Preview'}</DialogTitle>
        <div className="relative aspect-auto max-h-[80vh] overflow-hidden rounded-lg">
          <img
            src={imageUrl}
            alt={title || 'Image preview'}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex justify-center gap-2 mt-4">
          {!isVectorImage && (
            <Button
              variant="secondary"
              onClick={() => onActionClick('vectorize')}
            >
              <FileImage className="mr-2 h-4 w-4" />
              Vectorize
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={() => onActionClick('removeBackground')}
          >
            <Eraser className="mr-2 h-4 w-4" />
            Remove Background
          </Button>
          <Button
            variant="secondary"
            onClick={() => onActionClick('clarityUpscale')}
          >
            <ArrowUpCircle className="mr-2 h-4 w-4" />
            Clarity Upscale
          </Button>
          <Button
            variant="secondary"
            onClick={() => onActionClick('generativeUpscale')}
          >
            <Layers className="mr-2 h-4 w-4" />
            Generative Upscale
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}