import { ReactNode } from 'react';
import { MobileHeader } from './MobileHeader';
import type { ToolType } from '@/types/recraft';
import type { ImageData } from '@/lib/image-storage';

interface MobileLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  images: ImageData[];
}

export function MobileLayout({ children, sidebar, activeTool, onToolChange, images }: MobileLayoutProps) {
  return (
    <div className="relative h-[100dvh] overflow-hidden bg-background">
      <MobileHeader 
        activeTool={activeTool} 
        onToolChange={onToolChange}
        sidebar={sidebar}
        images={images}
      />
      <main className="relative pt-16 h-[calc(100dvh-4rem)] overflow-y-auto overscroll-none">
        <div className="min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}