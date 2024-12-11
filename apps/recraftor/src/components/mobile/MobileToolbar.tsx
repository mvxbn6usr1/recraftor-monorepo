import { 
  Wand2, 
  FileImage, 
  Eraser, 
  ArrowUpCircle, 
  Layers, 
  Palette 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { ToolType } from '@/types/recraft';

interface MobileToolbarProps {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
}

const tools = [
  { id: 'generate' as const, icon: Wand2, label: 'Generate Image' },
  { id: 'vectorize' as const, icon: FileImage, label: 'Vectorize Image' },
  { id: 'removeBackground' as const, icon: Eraser, label: 'Remove Background' },
  { id: 'clarityUpscale' as const, icon: ArrowUpCircle, label: 'Clarity Upscale' },
  { id: 'generativeUpscale' as const, icon: Layers, label: 'Generative Upscale' },
  { id: 'createStyle' as const, icon: Palette, label: 'Create Style' },
] as const;

export function MobileToolbar({ activeTool, onToolChange }: MobileToolbarProps) {
  return (
    <div className="h-16 px-4">
      <div className="flex h-full items-center justify-center">
        <TooltipProvider>
          <nav className="flex items-center justify-center space-x-2">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Tooltip key={tool.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={activeTool === tool.id ? "default" : "ghost"}
                      size="icon"
                      onClick={() => onToolChange(tool.id)}
                      className={cn(
                        "h-9 w-9",
                        activeTool === tool.id && "bg-primary text-primary-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="sr-only">{tool.label}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{tool.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </nav>
        </TooltipProvider>
      </div>
    </div>
  );
}