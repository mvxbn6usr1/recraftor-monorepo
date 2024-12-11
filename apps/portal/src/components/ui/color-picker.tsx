import { HexColorPicker } from "react-colorful";
import { Label } from "@/components/ui/label";
import type { RGB } from "@/types/recraft";

interface ColorPickerProps {
  label?: string;
  value?: RGB;
  onChange: (color: RGB) => void;
  className?: string;
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        Math.min(255, Math.max(0, parseInt(result[1], 16))),
        Math.min(255, Math.max(0, parseInt(result[2], 16))),
        Math.min(255, Math.max(0, parseInt(result[3], 16))),
      ]
    : [0, 0, 0];
}

function rgbToHex(rgb: [number, number, number]): string {
  return "#" + rgb.map(x => {
    const hex = Math.min(255, Math.max(0, Math.round(x))).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}

export function ColorPicker({ label, value, onChange, className }: ColorPickerProps) {
  const handleChange = (hex: string) => {
    // Ensure RGB values are integers in range 0-255
    const rgb = hexToRgb(hex);
    onChange({
      rgb: rgb.map(x => Math.min(255, Math.max(0, Math.round(x)))) as [number, number, number]
    });
  };

  return (
    <div className={className}>
      {label && <Label className="mb-2 block">{label}</Label>}
      <div className="space-y-2">
        <HexColorPicker
          color={value ? rgbToHex(value.rgb) : "#000000"}
          onChange={handleChange}
          className="w-full"
        />
        {value && (
          <div className="text-sm text-muted-foreground">
            RGB({value.rgb[0]}, {value.rgb[1]}, {value.rgb[2]})
          </div>
        )}
      </div>
    </div>
  );
}