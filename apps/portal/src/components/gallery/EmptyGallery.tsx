import { ImageIcon } from 'lucide-react';

export function EmptyGallery() {
  return (
    <div 
      className="h-[80vh] flex flex-col items-center justify-center text-muted-foreground"
      role="status"
      aria-label="No images available"
    >
      <ImageIcon className="h-12 w-12 mb-4 animate-bounce" />
      <h3 className="text-lg font-medium">No images generated yet</h3>
      <p className="text-sm">Use the sidebar to generate your first image</p>
    </div>
  );
}