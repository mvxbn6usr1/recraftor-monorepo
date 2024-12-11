import { useState, useEffect } from 'react';
import { Wand2, Plus, Minus, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ColorPicker } from '@/components/ui/color-picker';
import { STYLES, IMAGE_SIZES, RECRAFT_V3_SUBSTYLES, RECRAFT_20B_SUBSTYLES } from '@/lib/constants';
import { styleStorage, type StoredStyle } from '@/lib/style-storage';
import type { RecraftGenerateParams, StyleType, RecraftModel, RGB } from '@/types/recraft';

interface GenerateSidebarProps {
  onGenerate: (params: RecraftGenerateParams) => Promise<void>;
  loading: boolean;
  params: RecraftGenerateParams;
  onParamsChange: (params: RecraftGenerateParams) => void;
  hideHeader?: boolean;
}

export function GenerateSidebar({ onGenerate, loading, params, onParamsChange, hideHeader = false }: GenerateSidebarProps) {
  const [customStyles, setCustomStyles] = useState<StoredStyle[]>([]);
  const [showColors, setShowColors] = useState(false);

  useEffect(() => {
    // Load custom styles from IndexedDB
    const loadStyles = async () => {
      try {
        const styles = await styleStorage.getAllStyles();
        setCustomStyles(styles);
      } catch (error) {
        console.error('Error loading styles:', error);
      }
    };
    loadStyles();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Remove substyle from params if it's set to 'none'
    const submitParams = { ...params };
    if (submitParams.substyle === 'none') {
      delete submitParams.substyle;
    }
    onGenerate(submitParams);
  };

  const getSubstyles = (style: StyleType, model: RecraftModel) => {
    const substyles = model === 'recraftv3' 
      ? RECRAFT_V3_SUBSTYLES[style] || []
      : RECRAFT_20B_SUBSTYLES[style] || [];
    
    // Only add 'none' option if there are other substyles available
    return substyles.length > 0 ? ['none', ...substyles] : [];
  };

  const addColor = () => {
    onParamsChange({
      ...params,
      controls: {
        ...params.controls,
        colors: [...(params.controls?.colors || []), { rgb: [0, 0, 0] }],
      },
    });
  };

  const removeColor = (index: number) => {
    onParamsChange({
      ...params,
      controls: {
        ...params.controls,
        colors: params.controls?.colors?.filter((_, i) => i !== index) || [],
      },
    });
  };

  const updateColor = (index: number, color: RGB) => {
    onParamsChange({
      ...params,
      controls: {
        ...params.controls,
        colors: params.controls?.colors?.map((c, i) => i === index ? color : c) || [],
      },
    });
  };

  const updateBackgroundColor = (color: RGB) => {
    onParamsChange({
      ...params,
      controls: {
        ...params.controls,
        background_color: color,
      },
    });
  };

  const handleColorToggle = (enabled: boolean) => {
    setShowColors(enabled);
    if (!enabled) {
      // Clear color settings when disabling
      onParamsChange({
        ...params,
        controls: {
          ...params.controls,
          colors: [],
          background_color: undefined
        }
      });
    }
  };

  const substyles = params.style ? getSubstyles(params.style, params.model) : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full">
      {!hideHeader && (
        <div className="flex flex-col items-center space-y-2 mb-8">
          <Wand2 className="h-12 w-12" />
          <h2 className="text-2xl font-bold text-center">Generate Image</h2>
          <p className="text-muted-foreground text-center">Create an image using AI</p>
        </div>
      )}

      <div className="space-y-6 w-full">
        <Button 
          type="submit" 
          size="lg"
          disabled={loading} 
          className="w-full h-12 text-lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-5 w-5" />
              Generate
            </>
          )}
        </Button>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Prompt</Label>
            <Textarea
              placeholder="Describe the image you want to generate..."
              value={params.prompt}
              onChange={(e) => onParamsChange({ ...params, prompt: e.target.value })}
              className="min-h-[100px] text-base"
            />
          </div>

          <div className="space-y-2">
            <Label>Style</Label>
            <Select
              value={params.style}
              onValueChange={(value) => onParamsChange({ ...params, style: value as StyleType })}
            >
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                {STYLES.map((style) => (
                  <SelectItem key={style} value={style} className="text-base">
                    {style}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Model</Label>
            <Select
              value={params.model}
              onValueChange={(value) => onParamsChange({ ...params, model: value as RecraftModel })}
            >
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recraftv3" className="text-base">Recraft V3</SelectItem>
                <SelectItem value="recraft20b" className="text-base">Recraft 20B</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Size</Label>
            <Select
              value={params.size}
              onValueChange={(value) => onParamsChange({ ...params, size: value })}
            >
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {IMAGE_SIZES.map((size) => (
                  <SelectItem key={size} value={size} className="text-base">
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label>Color Controls</Label>
            <Switch
              checked={showColors}
              onCheckedChange={handleColorToggle}
            />
          </div>

          {showColors && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Colors</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={addColor}
                    className="h-8 w-8"
                    disabled={params.controls?.colors?.length >= 5}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Add color</span>
                  </Button>
                </div>
                <div className="space-y-2">
                  {params.controls?.colors?.map((color, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-1">
                        <ColorPicker
                          value={color}
                          onChange={(newColor) => updateColor(index, newColor)}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeColor(index)}
                        className="h-8 w-8"
                      >
                        <Minus className="h-4 w-4" />
                        <span className="sr-only">Remove color</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Background Color</Label>
                <ColorPicker
                  value={params.controls?.background_color}
                  onChange={updateBackgroundColor}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}