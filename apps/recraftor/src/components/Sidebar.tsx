import { FileImage, Eraser, ArrowUpCircle, Layers, Palette } from 'lucide-react';
import { GenerateSidebar } from './sidebars/GenerateSidebar';
import { UploadSidebar } from './sidebars/UploadSidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ToolType, RecraftGenerateParams, FileUploadParams, CreateStyleParams } from '@/types/recraft';

interface UploadState {
  file?: File | null;
  files?: File[];
}

interface SidebarProps {
  activeTool: ToolType;
  onGenerate: (params: RecraftGenerateParams) => Promise<void>;
  onUpload: (params: FileUploadParams, tool: ToolType) => Promise<void>;
  onCreateStyle: (params: CreateStyleParams) => Promise<void>;
  loading: boolean;
  generateParams: RecraftGenerateParams;
  onGenerateParamsChange: (params: RecraftGenerateParams) => void;
  uploadParams: Record<ToolType, UploadState>;
  createStyleParams: CreateStyleParams;
  onCreateStyleParamsChange: (params: CreateStyleParams) => void;
  hideTitle?: boolean;
  hideHeader?: boolean;
}

export function Sidebar({
  activeTool,
  onGenerate,
  onUpload,
  onCreateStyle,
  loading,
  generateParams,
  onGenerateParamsChange,
  uploadParams,
  createStyleParams,
  onCreateStyleParamsChange,
  hideTitle = false,
  hideHeader = false
}: SidebarProps) {
  return (
    <div className="w-full lg:w-96 h-full flex flex-col">
      {!hideTitle && (
        <div className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-full items-center justify-center">
            <h1 className="text-lg font-semibold capitalize">
              {activeTool.replace(/([A-Z])/g, ' $1').trim()}
            </h1>
          </div>
        </div>
      )}
      <ScrollArea className="flex-1">
        <div className="px-4 sm:px-6 py-8 flex flex-col items-center w-full">
          {(() => {
            switch (activeTool) {
              case 'generate':
                return (
                  <GenerateSidebar
                    onGenerate={onGenerate}
                    loading={loading}
                    params={generateParams}
                    onParamsChange={onGenerateParamsChange}
                    hideHeader={hideHeader}
                  />
                );
              case 'vectorize':
                return (
                  <UploadSidebar
                    title="Vectorize Image"
                    description="Upload a PNG image to convert to SVG"
                    icon={FileImage}
                    onUpload={(params) => onUpload(params, 'vectorize')}
                    loading={loading}
                    maxFiles={1}
                    initialFiles={uploadParams.vectorize.file ? [uploadParams.vectorize.file] : []}
                  />
                );
              case 'removeBackground':
                return (
                  <UploadSidebar
                    title="Remove Background"
                    description="Upload a PNG image to remove its background"
                    icon={Eraser}
                    onUpload={(params) => onUpload(params, 'removeBackground')}
                    loading={loading}
                    maxFiles={1}
                    initialFiles={uploadParams.removeBackground.file ? [uploadParams.removeBackground.file] : []}
                  />
                );
              case 'clarityUpscale':
                return (
                  <UploadSidebar
                    title="Clarity Upscale"
                    description="Upload a PNG image to enhance resolution"
                    icon={ArrowUpCircle}
                    onUpload={(params) => onUpload(params, 'clarityUpscale')}
                    loading={loading}
                    maxFiles={1}
                    initialFiles={uploadParams.clarityUpscale.file ? [uploadParams.clarityUpscale.file] : []}
                  />
                );
              case 'generativeUpscale':
                return (
                  <UploadSidebar
                    title="Generative Upscale"
                    description="Upload a PNG image to enhance details"
                    icon={Layers}
                    onUpload={(params) => onUpload(params, 'generativeUpscale')}
                    loading={loading}
                    maxFiles={1}
                    initialFiles={uploadParams.generativeUpscale.file ? [uploadParams.generativeUpscale.file] : []}
                  />
                );
              case 'createStyle':
                return (
                  <UploadSidebar
                    title="Create Style"
                    description="Upload up to 5 PNG images to create a style"
                    icon={Palette}
                    onUpload={(params) => {
                      if ('files' in params && params.files) {
                        onCreateStyle({ 
                          ...createStyleParams,
                          files: params.files 
                        });
                      }
                    }}
                    loading={loading}
                    maxFiles={5}
                    initialFiles={uploadParams.createStyle.files || []}
                  />
                );
              default:
                return null;
            }
          })()}
        </div>
      </ScrollArea>
    </div>
  );
}