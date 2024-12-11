import { Button } from '@/components/ui/button';
import { Info, Download, Trash2 } from 'lucide-react';

interface ImageActionsProps {
  isProcessing: boolean;
  onInfoClick: (e: React.MouseEvent) => void;
  onDownload: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export function ImageActions({
  isProcessing,
  onInfoClick,
  onDownload,
  onDelete
}: ImageActionsProps) {
  return (
    <div className="absolute top-2 right-2 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="secondary"
        size="icon"
        className="bg-white/10 hover:bg-white/20"
        onClick={onInfoClick}
        aria-label="Image Information"
      >
        <Info className="h-4 w-4" />
      </Button>

      <Button
        variant="secondary"
        size="icon"
        className="bg-white/10 hover:bg-white/20"
        onClick={onDownload}
        aria-label="Download Image"
      >
        <Download className="h-4 w-4" />
      </Button>

      {!isProcessing && (
        <Button
          variant="destructive"
          size="icon"
          className="bg-white/10 hover:bg-red-500/80"
          onClick={onDelete}
          aria-label="Delete Image"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}