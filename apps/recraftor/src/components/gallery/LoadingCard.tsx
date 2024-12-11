import { ImageIcon } from 'lucide-react';

export function LoadingCard() {
  return (
    <div 
      className="relative aspect-square rounded-lg overflow-hidden border bg-muted"
      role="status"
      aria-label="Loading image"
    >
      <div className="absolute inset-0 animate-pulse">
        <div className="flex h-full items-center justify-center">
          <ImageIcon className="h-8 w-8 text-muted-foreground animate-pulse" />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="h-4 w-24 bg-muted-foreground/20 rounded" />
        </div>
      </div>
    </div>
  );
}