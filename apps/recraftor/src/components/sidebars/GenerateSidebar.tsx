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
import type { RecraftGenerateParams, StyleType, RecraftModel, RGB, ImageSize } from '@/types/recraft';

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

  // Get available substyles based on current model and style
  const getSubstyles = (style: StyleType, model: RecraftModel) => {
    if (model === 'recraftv3') {
      return RECRAFT_V3_SUBSTYLES[style as keyof typeof RECRAFT_V3_SUBSTYLES] || [];
    }
    return RECRAFT_20B_SUBSTYLES[style as keyof typeof RECRAFT_20B_SUBSTYLES] || [];
  };

  // Determine if model selection should be disabled
  const isModelSelectionDisabled = params.style === 'icon' || params.style === 'any';

  // Calculate available substyles based on current style and model
  // Only show substyles for built-in styles (not custom styles)
  const availableSubstyles = params.style && params.model && !params.style_id
    ? getSubstyles(params.style, params.model) 
    : [];

  // Color control handlers
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
              value={params.style_id ? `custom_${params.style_id}` : params.style || undefined}
              onValueChange={(value) => {
                console.log('Style selection changed:', { value });
                if (value.startsWith('custom_')) {
                  // Handle custom style selection
                  const customStyle = customStyles.find(style => `custom_${style.id}` === value);
                  console.log('Found custom style:', customStyle);
                  if (customStyle) {
                    const newParams = {
                      ...params,
                      style: customStyle.style,
                      style_id: customStyle.id,
                      // Clear substyle for custom styles
                      substyle: undefined
                    };
                    console.log('Updating params with custom style:', newParams);
                    onParamsChange(newParams);
                  }
                } else {
                  // Handle built-in style selection
                  const newParams = {
                    ...params,
                    style: value as StyleType,
                    // Clear style_id when selecting built-in style
                    style_id: undefined,
                    // Clear substyle when changing styles
                    substyle: undefined,
                    // Update model for special styles
                    model: value === 'icon' ? 'recraft20b' : value === 'any' ? 'recraftv3' : params.model
                  };
                  console.log('Updating params with built-in style:', newParams);
                  onParamsChange(newParams);
                }
              }}
            >
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                <div className="text-sm font-medium text-muted-foreground px-2 py-1.5">
                  Built-in Styles
                </div>
                {STYLES.map((style) => (
                  <SelectItem key={style} value={style} className="text-base">
                    {style.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
                
                {customStyles.length > 0 && (
                  <>
                    <div className="text-sm font-medium text-muted-foreground px-2 py-1.5 mt-2">
                      Custom Styles
                    </div>
                    {customStyles.map((style) => (
                      <SelectItem 
                        key={`custom_${style.id}`} 
                        value={`custom_${style.id}`} 
                        className="text-base"
                      >
                        {style.name || `Custom Style ${style.id}`}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Only show substyles for built-in styles */}
          {availableSubstyles.length > 0 && !params.style_id && (
            <div className="space-y-2">
              <Label>Substyle</Label>
              <Select
                value={params.substyle}
                onValueChange={(value: string) => onParamsChange({ ...params, substyle: value })}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select substyle" />
                </SelectTrigger>
                <SelectContent>
                  {availableSubstyles.map((substyle: string) => (
                    <SelectItem key={substyle} value={substyle} className="text-base">
                      {substyle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Model</Label>
            <Select
              value={params.model}
              onValueChange={(value) => onParamsChange({ ...params, model: value as RecraftModel })}
              disabled={isModelSelectionDisabled}
            >
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recraftv3" className="text-base">Recraft V3</SelectItem>
                <SelectItem value="recraft20b" className="text-base">Recraft 20B</SelectItem>
              </SelectContent>
            </Select>
            {isModelSelectionDisabled && (
              <p className="text-sm text-muted-foreground">
                {params.style === 'icon' ? 'Icon style requires Recraft 20B model' : 'Any style requires Recraft V3 model'}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Size</Label>
            <Select
              value={params.size || '1024x1024'}
              onValueChange={(value) => onParamsChange({ ...params, size: value as ImageSize })}
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
                    disabled={!!params.controls?.colors && params.controls.colors.length >= 5}
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