import { useState, useRef, useEffect } from 'react';
import { LucideIcon, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { FileUploadParams } from '@/types/recraft';

interface UploadSidebarProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onUpload: (params: FileUploadParams) => Promise<void>;
  loading: boolean;
  maxFiles?: number;
  initialFiles?: File[];
}

export function UploadSidebar({ 
  title, 
  description, 
  icon: Icon, 
  onUpload, 
  loading, 
  maxFiles = 1,
  initialFiles = []
}: UploadSidebarProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>(initialFiles);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSelectedFiles(initialFiles);
  }, [initialFiles]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files).filter(file => file.type === 'image/png');
    if (files.length > 0) {
      setSelectedFiles(prev => {
        const newFiles = [...prev, ...files].slice(0, maxFiles);
        return newFiles;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).filter(file => file.type === 'image/png');
      setSelectedFiles(prev => {
        const newFiles = [...prev, ...files].slice(0, maxFiles);
        return newFiles;
      });
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length > 0) {
      if (maxFiles === 1) {
        await onUpload({ file: selectedFiles[0] });
      } else {
        await onUpload({ files: selectedFiles });
      }
      setSelectedFiles([]);
    }
  };

  return (
    <div className="p-6">
      <div className="space-y-4">
        <div className="flex flex-col items-center text-center space-y-2">
          <Icon className="h-6 w-6" />
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
              dragActive ? 'border-primary' : 'border-muted-foreground/25'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png"
              multiple={maxFiles > 1}
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Drag & drop or click to upload</p>
                <p className="text-xs text-muted-foreground">PNG files only</p>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={selectedFiles.length >= maxFiles}
              >
                Browse Files
              </Button>
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <ScrollArea className="h-[200px] rounded-md border">
              <div className="p-4 space-y-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                  >
                    <div className="flex items-center space-x-2">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="h-8 w-8 rounded object-cover"
                      />
                      <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading || selectedFiles.length === 0}
          >
            {loading ? (
              <span className="flex items-center">Processing...</span>
            ) : (
              <span className="flex items-center">
                <Upload className="mr-2 h-4 w-4" />
                Process {selectedFiles.length > 0 ? selectedFiles.length : ''} File
                {selectedFiles.length > 1 ? 's' : ''}
              </span>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}