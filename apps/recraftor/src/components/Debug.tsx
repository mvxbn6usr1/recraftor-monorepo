import { useEffect } from 'react';
import { Wand2, FileImage, Eraser, ArrowUpCircle, Layers, Palette } from 'lucide-react';

export function Debug() {
  useEffect(() => {
    console.log('Debugging Lucide Icons:');
    console.log('Wand2:', typeof Wand2, Wand2);
    console.log('FileImage:', typeof FileImage, FileImage);
    console.log('Eraser:', typeof Eraser, Eraser);
    console.log('ArrowUpCircle:', typeof ArrowUpCircle, ArrowUpCircle);
    console.log('Layers:', typeof Layers, Layers);
    console.log('Palette:', typeof Palette, Palette);
  }, []);

  return null;
}