import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Download, Loader2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { downloadAllImages } from '@/lib/utils';
import type { ToolType } from '@/types/recraft';
import type { ImageData } from '@/lib/image-storage';

interface TabletHeaderProps {
  activeTool: ToolType;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  images: ImageData[];
}

export function TabletHeader({ activeTool, sidebarOpen, onToggleSidebar, images }: TabletHeaderProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadAllImages(images);
    } catch (error) {
      console.error('Failed to download images:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="mr-2"
        >
          {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold capitalize">
            {activeTool.replace(/([A-Z])/g, ' $1').trim()}
          </h1>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                disabled={isDownloading || images.length === 0}
                className="h-9 w-9"
              >
                {isDownloading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Download className="h-5 w-5" />
                )}
                <span className="sr-only">Download All</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Download All Images</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}