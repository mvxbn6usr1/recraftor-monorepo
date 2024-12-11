import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileImage, Eraser, ArrowUpCircle, Layers, Loader2 } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { imageCache } from "@/lib/utils/image-cache";
import type { ToolType } from "@/types/recraft";

interface ResponsiveImageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  title?: string;
  onActionClick: (tool: ToolType) => void;
}

const tools = [
  { id: 'vectorize' as const, icon: FileImage, label: 'Vectorize' },
  { id: 'removeBackground' as const, icon: Eraser, label: 'Remove Background' },
  { id: 'clarityUpscale' as const, icon: ArrowUpCircle, label: 'Clarity Upscale' },
  { id: 'generativeUpscale' as const, icon: Layers, label: 'Generative Upscale' },
] as const;

export function ResponsiveImageModal({
  open,
  onOpenChange,
  imageUrl,
  title,
  onActionClick,
}: ResponsiveImageModalProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cachedUrl, setCachedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !imageUrl) return;

    let mounted = true;
    setIsLoading(true);
    setError(null);

    const loadImage = async () => {
      try {
        // Use a temporary ID for caching based on the URL
        const tempId = btoa(imageUrl).slice(0, 32);
        const url = await imageCache.getCachedImage(tempId, imageUrl);
        
        if (mounted) {
          setCachedUrl(url);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          console.error('Failed to load image in modal:', err);
          setError('Failed to load image');
          setIsLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      mounted = false;
    };
  }, [open, imageUrl]);

  const modalTitle = title || "View Image";
  const modalDescription = error 
    ? `Error: ${error}` 
    : "Image viewer and actions";

  const content = (
    <>
      {isMobile ? (
        <SheetHeader className="px-4 py-2">
          <SheetTitle>{modalTitle}</SheetTitle>
          <SheetDescription>{modalDescription}</SheetDescription>
        </SheetHeader>
      ) : (
        <DialogHeader className="px-4 py-2">
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription>{modalDescription}</DialogDescription>
        </DialogHeader>
      )}
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="relative flex-1 min-h-0 overflow-hidden bg-background/95">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          
          <div className={cn(
            "absolute inset-0 flex items-center justify-center transition-opacity duration-200",
            isLoading ? "opacity-0" : "opacity-100"
          )}>
            <div className="relative w-full h-full overflow-auto p-4">
              {cachedUrl && (
                <img
                  src={cachedUrl}
                  alt={title || "Image"}
                  className="max-w-full h-auto mx-auto object-contain"
                  onLoad={() => setIsLoading(false)}
                  onError={() => {
                    console.error('Modal image failed to load:', cachedUrl);
                    setError('Failed to load image');
                    setIsLoading(false);
                  }}
                  style={{ 
                    maxHeight: isMobile ? 'calc(80vh - 8rem)' : 'calc(80vh - 12rem)'
                  }}
                />
              )}
            </div>

            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <p className="text-destructive font-medium">{error}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center gap-2 p-4 border-t bg-background/95">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Button
                key={tool.id}
                variant="secondary"
                size="sm"
                onClick={() => onActionClick(tool.id)}
                className="flex items-center gap-2"
                disabled={!!error || isLoading}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tool.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          side="bottom" 
          className="h-[80vh] flex flex-col p-0"
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
        >
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-4xl h-[80vh] flex flex-col p-0"
        role="dialog"
        aria-modal="true"
        aria-label="Image viewer"
      >
        {content}
      </DialogContent>
    </Dialog>
  );
}