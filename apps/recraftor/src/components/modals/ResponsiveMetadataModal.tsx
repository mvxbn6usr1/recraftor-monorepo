import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ImageMetadata } from "@/components/ImageMetadata";
import type { ImageData } from "@/lib/image-storage";

interface ResponsiveMetadataModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metadata: ImageData;
  customStyleName: string | null;
  onUseAsInput?: () => void;
}

export function ResponsiveMetadataModal({
  open,
  onOpenChange,
  metadata,
  customStyleName,
  onUseAsInput,
}: ResponsiveMetadataModalProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const description = "Details and settings used to create this image";

  const content = (
    <>
      {isMobile ? (
        <SheetHeader>
          <SheetTitle>Image Metadata</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
      ) : (
        <DialogHeader>
          <DialogTitle>Image Metadata</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
      )}
      <div className="p-6">
        <ImageMetadata
          metadata={metadata}
          customStyleName={customStyleName}
          onUseAsInput={onUseAsInput}
        />
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          side="bottom" 
          className="h-[80vh]"
          role="dialog"
          aria-label="Image metadata viewer"
        >
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-md"
        role="dialog"
        aria-label="Image metadata viewer"
      >
        {content}
      </DialogContent>
    </Dialog>
  );
}