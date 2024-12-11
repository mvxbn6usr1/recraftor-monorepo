import React, { useState } from 'react';
import { Menu, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { MobileToolbar } from './MobileToolbar';
import { downloadAllImages } from '@/lib/utils';
import type { ToolType } from '@/types/recraft';
import type { ImageData } from '@/lib/image-storage';

interface MobileHeaderProps {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  sidebar: React.ReactNode;
  images: ImageData[];
}

export function MobileHeader({ activeTool, onToolChange, sidebar, images }: MobileHeaderProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const sidebarWithHiddenTitle = React.cloneElement(sidebar as React.ReactElement, { 
    hideTitle: true
  });

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
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-screen p-0">
            <div className="h-full flex flex-col">
              <div className="border-b">
                <MobileToolbar activeTool={activeTool} onToolChange={onToolChange} />
              </div>
              <div className="flex-1 overflow-y-auto">
                {sidebarWithHiddenTitle}
              </div>
            </div>
          </SheetContent>
        </Sheet>
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