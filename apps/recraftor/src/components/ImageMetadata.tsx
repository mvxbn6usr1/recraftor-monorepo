import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useState } from 'react';
import type { ImageData } from '@/lib/image-storage';

interface ImageMetadataProps {
  metadata: ImageData;
  customStyleName: string | null;
  onUseAsInput?: () => void;
}

export function ImageMetadata({ metadata, customStyleName, onUseAsInput }: ImageMetadataProps) {
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);

  return (
    <>
      <div className="space-y-4">
        {metadata.metadata.prompt && (
          <div className="space-y-2">
            <h4 className="font-medium">Prompt</h4>
            <div className="flex items-start space-x-2">
              <p className="flex-1 text-sm text-muted-foreground">
                {metadata.metadata.prompt}
              </p>
              <TooltipProvider>
                <Tooltip open={showCopyTooltip}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => {
                        navigator.clipboard.writeText(metadata.metadata.prompt || '');
                        setShowCopyTooltip(true);
                        setTimeout(() => setShowCopyTooltip(false), 1000);
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copied!</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        )}
        
        {(metadata.metadata.style || metadata.metadata.style_id) && (
          <div>
            <h4 className="font-medium">Style</h4>
            <p className="text-sm text-muted-foreground">
              {metadata.metadata.style_id ? (
                // For custom styles, show the custom style name
                customStyleName || `Custom Style ${metadata.metadata.style_id}`
              ) : (
                // For built-in styles, format the style name
                metadata.metadata.style?.replace(/_/g, ' ')
              )}
            </p>
          </div>
        )}
        
        {metadata.metadata.substyle && !metadata.metadata.style_id && (
          <div>
            <h4 className="font-medium">Substyle</h4>
            <p className="text-sm text-muted-foreground">{metadata.metadata.substyle}</p>
          </div>
        )}
        
        {metadata.metadata.tool && (
          <div>
            <h4 className="font-medium">Processing</h4>
            <p className="text-sm text-muted-foreground capitalize">{metadata.metadata.tool}</p>
          </div>
        )}

        {metadata.metadata.model && (
          <div>
            <h4 className="font-medium">Model</h4>
            <p className="text-sm text-muted-foreground">
              {metadata.metadata.model === 'recraftv3' ? 'Recraft V3' : 'Recraft 20B'}
            </p>
          </div>
        )}

        {metadata.metadata.size && (
          <div>
            <h4 className="font-medium">Dimensions</h4>
            <p className="text-sm text-muted-foreground">
              {metadata.metadata.size.replace('x', ' × ')}
            </p>
          </div>
        )}

        {metadata.metadata.controls?.colors && metadata.metadata.controls.colors.length > 0 && (
          <div>
            <h4 className="font-medium">Colors</h4>
            <div className="flex flex-wrap gap-2 mt-1">
              {metadata.metadata.controls.colors.map((color, index) => (
                <div
                  key={index}
                  className="w-6 h-6 rounded border border-border"
                  style={{
                    backgroundColor: `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`
                  }}
                  title={`RGB(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`}
                />
              ))}
            </div>
          </div>
        )}

        {metadata.metadata.controls?.background_color && (
          <div>
            <h4 className="font-medium">Background Color</h4>
            <div className="flex items-center gap-2 mt-1">
              <div
                className="w-6 h-6 rounded border border-border"
                style={{
                  backgroundColor: `rgb(${metadata.metadata.controls.background_color.rgb[0]}, ${metadata.metadata.controls.background_color.rgb[1]}, ${metadata.metadata.controls.background_color.rgb[2]})`
                }}
                title={`RGB(${metadata.metadata.controls.background_color.rgb[0]}, ${metadata.metadata.controls.background_color.rgb[1]}, ${metadata.metadata.controls.background_color.rgb[2]})`}
              />
              <span className="text-sm text-muted-foreground">
                RGB({metadata.metadata.controls.background_color.rgb[0]}, {metadata.metadata.controls.background_color.rgb[1]}, {metadata.metadata.controls.background_color.rgb[2]})
              </span>
            </div>
          </div>
        )}
      </div>

      {onUseAsInput && (
        <div className="mt-6 flex justify-end">
          <Button onClick={onUseAsInput}>
            Use as Input
          </Button>
        </div>
      )}
    </>
  );
}