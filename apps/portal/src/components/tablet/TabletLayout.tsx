import React, { ReactNode, useState } from 'react';
import { TabletHeader } from './TabletHeader';
import { TabletToolbar } from './TabletToolbar';
import { cn } from '@/lib/utils';
import type { ToolType } from '@/types/recraft';
import type { ImageData } from '@/lib/image-storage';

interface TabletLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  images: ImageData[];
}

export function TabletLayout({ children, sidebar, activeTool, onToolChange, images }: TabletLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Clone sidebar element with hideTitle and hideHeader props
  const sidebarWithHiddenElements = React.cloneElement(sidebar as React.ReactElement, { 
    hideTitle: true,
    hideHeader: true
  });

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="fixed inset-x-0 top-0 z-50 bg-background">
        <TabletHeader 
          activeTool={activeTool}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          images={images}
        />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 pt-16"> {/* Only header height now */}
        {/* Sidebar with Toolbar */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-30 flex flex-col w-96 bg-background transition-transform duration-300 pt-16",
            !sidebarOpen && "-translate-x-full"
          )}
        >
          {/* Toolbar band */}
          <div className="flex-none bg-background border-b">
            <TabletToolbar 
              activeTool={activeTool}
              onToolChange={onToolChange}
            />
          </div>
          
          {/* Sidebar content */}
          <div className="flex-1 overflow-auto flex flex-col items-center">
            {sidebarWithHiddenElements}
          </div>
        </div>

        {/* Content area */}
        <div
          className={cn(
            "flex-1 transition-all duration-300 overflow-auto",
            sidebarOpen ? "ml-96" : "ml-0"
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}