import { imageStorage, type ImageMetadata } from '@/lib/image-storage';
import type { Toast } from '@/hooks/use-toast';

interface SaveImageParams {
  url: string;
  metadata: ImageMetadata;
  title?: string;
  toast: Toast;
}

export async function saveImage({ url, metadata, title, toast }: SaveImageParams) {
  try {
    const savedImage = await imageStorage.saveImage(url, metadata, title);
    console.log('Image saved:', savedImage);

    toast({
      title: 'Success',
      description: 'Your image has been added to the gallery.',
    });

    return savedImage;
  } catch (error: any) {
    console.error('Failed to save image:', error);
    toast({
      title: 'Error saving image',
      description: error.message,
      variant: 'destructive',
    });
    throw error;
  }
}