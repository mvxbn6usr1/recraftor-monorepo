import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import JSZip from "jszip";
import { saveAs } from "file-saver";
import type { ImageData } from "./image-storage";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface GridDimensions {
  columns: number;
  rows: number;
}

export function calculateGridDimensions(
  containerWidth: number,
  containerHeight: number,
  itemWidth: number,
  itemHeight: number,
  gap: number
): GridDimensions {
  // Calculate number of columns that can fit in the container width
  const columns = Math.max(1, Math.floor((containerWidth + gap) / (itemWidth + gap)));
  
  // Calculate number of rows needed based on container height
  const rows = Math.max(1, Math.floor((containerHeight + gap) / (itemHeight + gap)));
  
  return { columns, rows };
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function debounceResizeObserver<T extends Element>(
  callback: (entries: ResizeObserverEntry[]) => void,
  delay: number
): ResizeObserverCallback {
  const debouncedFn = debounce(callback, delay);
  return function (entries: ResizeObserverEntry[], observer: ResizeObserver) {
    debouncedFn(entries);
  };
}

export async function downloadAllImages(images: ImageData[]) {
  const zip = new JSZip();
  const metadataFolder = zip.folder("metadata");
  const imagesFolder = zip.folder("images");

  if (!metadataFolder || !imagesFolder) {
    throw new Error("Failed to create folders in zip");
  }

  // Create a promise for each image download and metadata
  const downloadPromises = images.map(async (image) => {
    try {
      // Download the image
      const response = await fetch(image.url);
      const blob = await response.blob();
      
      // Determine file extension based on style or content type
      let extension = 'png';
      if (image.metadata.style === 'vector_illustration') {
        extension = 'svg';
      } else if (blob.type === 'image/svg+xml') {
        extension = 'svg';
      }
      
      // Add image to zip
      const filename = `${image.id}.${extension}`;
      imagesFolder.file(filename, blob);

      // Add metadata JSON
      const metadata = {
        ...image,
        url: filename // Replace URL with local filename reference
      };
      metadataFolder.file(`${image.id}.json`, JSON.stringify(metadata, null, 2));
    } catch (error) {
      console.error(`Failed to process image ${image.id}:`, error);
    }
  });

  // Wait for all downloads to complete
  await Promise.all(downloadPromises);

  // Generate the zip file
  const content = await zip.generateAsync({ type: "blob" });
  
  // Save the file
  saveAs(content, "recraft-gallery.zip");
}
