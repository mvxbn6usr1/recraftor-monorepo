import { ReactNode } from 'react';
import { MobileLayout } from '@/components/mobile/MobileLayout';
import { TabletLayout } from '@/components/tablet/TabletLayout';
import { useMediaQuery } from '@/hooks/use-media-query';
import type { ToolType } from '@/types/recraft';
import type { ImageData } from '@/lib/image-storage';

interface ResponsiveWrapperProps {
  children: ReactNode;
  sidebar: ReactNode;
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  images: ImageData[];
}

export function ResponsiveWrapper({ children, sidebar, activeTool, onToolChange, images }: ResponsiveWrapperProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');

  return (
    <>
      {/* Mobile Layout */}
      {isMobile && (
        <MobileLayout 
          sidebar={sidebar} 
          activeTool={activeTool} 
          onToolChange={onToolChange}
          images={images}
        >
          {children}
        </MobileLayout>
      )}

      {/* Tablet Layout */}
      {isTablet && (
        <TabletLayout 
          sidebar={sidebar} 
          activeTool={activeTool}
          onToolChange={onToolChange}
          images={images}
        >
          {children}
        </TabletLayout>
      )}

      {/* Desktop Layout */}
      {!isMobile && !isTablet && (
        <div className="flex flex-col h-screen overflow-hidden bg-background">
          {children}
        </div>
      )}
    </>
  );
}