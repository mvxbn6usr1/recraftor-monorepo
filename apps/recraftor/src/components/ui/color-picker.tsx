import * as React from 'react';
import { HexColorPicker } from 'react-colorful';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { RGB } from '@/types/recraft';

interface ColorPickerProps {
  value?: RGB;
  onChange?: (color: RGB) => void;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    rgb: [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ]
  } : { rgb: [0, 0, 0] };
}

export function ColorPicker({ value = { rgb: [0, 0, 0] }, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Convert RGB to hex for the color picker
  const hexColor = rgbToHex(...value.rgb);

  // Handle RGB input changes
  const handleRGBChange = (index: number, inputValue: string) => {
    if (!onChange) return;

    const newValue = parseInt(inputValue) || 0;
    const clampedValue = Math.max(0, Math.min(255, newValue));
    const newRgb = [...value.rgb];
    newRgb[index] = clampedValue;
    onChange({ rgb: newRgb as [number, number, number] });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-full h-10 rounded-md border border-input flex items-center gap-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <div
            className="w-6 h-6 rounded border border-border"
            style={{ backgroundColor: hexColor }}
          />
          <div className="flex-1 text-left text-sm">
            RGB({value.rgb[0]}, {value.rgb[1]}, {value.rgb[2]})
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4">
        <div className="space-y-4">
          <HexColorPicker
            color={hexColor}
            onChange={(hex) => onChange?.(hexToRgb(hex))}
          />
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs">R</Label>
              <Input
                type="number"
                min="0"
                max="255"
                value={value.rgb[0]}
                onChange={(e) => handleRGBChange(0, e.target.value)}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">G</Label>
              <Input
                type="number"
                min="0"
                max="255"
                value={value.rgb[1]}
                onChange={(e) => handleRGBChange(1, e.target.value)}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">B</Label>
              <Input
                type="number"
                min="0"
                max="255"
                value={value.rgb[2]}
                onChange={(e) => handleRGBChange(2, e.target.value)}
                className="h-8"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}