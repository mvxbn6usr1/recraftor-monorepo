import type { 
  RecraftGenerateParams,
  RecraftResponse,
  FileUploadParams,
  StyleResponse,
  StyleType,
  RecraftModel,
  ResponseFormat,
  ImageSize,
  Controls,
  CreateStyleParams
} from '@/types/recraft';
import { recraftApi } from './api-config';

const PORTAL_URL = import.meta.env.VITE_PORTAL_URL;

if (!PORTAL_URL) {
  throw new Error('Missing VITE_PORTAL_URL environment variable');
}

// Add helper function to validate file format
function validateFileFormat(file: File | Blob) {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const type = file.type || 'application/octet-stream';
  
  if (!validTypes.includes(type)) {
    throw new Error('Unsupported file format. Please use JPEG, PNG, or WebP images.');
  }
  
  // 10MB limit
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File size too large. Maximum size is 10MB.');
  }
}

export async function generateImage(params: RecraftGenerateParams): Promise<RecraftResponse> {
  try {
    console.log('Generate Image - Input params:', {
      prompt: params.prompt,
      style: params.style,
      style_id: params.style_id,
      substyle: params.substyle,
      model: params.model,
      size: params.size,
      controls: params.controls
    });

    // Define the type for the request body
    type RequestBody = {
      prompt: string;
      model: RecraftModel;
      response_format: ResponseFormat;
      size: ImageSize;
      controls?: Controls;
      style?: StyleType;
      style_id?: string;
      substyle?: string;
    };

    // Prepare request body with proper typing
    const requestBody: RequestBody = {
      prompt: params.prompt,
      model: params.model || 'recraftv3',
      response_format: params.response_format || 'url',
      size: params.size || '1024x1024',
      controls: params.controls,
    };

    // Add style parameters based on whether it's a custom style or built-in style
    if (params.style_id) {
      // For custom styles, only send style_id
      requestBody.style_id = params.style_id;
    } else if (params.style) {
      // For built-in styles
      requestBody.style = params.style;
      if (params.substyle && params.substyle !== 'none') {
        requestBody.substyle = params.substyle;
      }
    }

    console.log('Generate Image - Final request body:', JSON.stringify(requestBody, null, 2));

    const response = await recraftApi.post('/generations', requestBody);
    console.log('Generate Image - Response:', response.data);

    return response.data;
  } catch (error) {
    console.error('Generation error:', error);
    throw error;
  }
}

export const vectorizeImage = async (params: FileUploadParams): Promise<RecraftResponse> => {
  console.log('Vectorizing image with params:', {
    fileType: params.file instanceof File ? params.file.type : typeof params.file,
    fileName: params.file instanceof File ? params.file.name : 'unknown'
  });

  const formData = new FormData();
  formData.append('file', params.file);

  try {
    const response = await fetch(`${PORTAL_URL}/api/recraft/vectorize`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) {
      console.error('Vectorization failed:', {
        status: response.status,
        statusText: response.statusText
      });
      
      const errorData = await response.json().catch(() => ({}));
      console.error('Error response:', errorData);
      
      throw new Error(errorData.error || 'Failed to vectorize image');
    }

    const data = await response.json();
    console.log('Vectorization response:', data);

    if (!data.data?.[0]?.url) {
      console.error('Invalid response format:', data);
      throw new Error('Invalid response format from vectorization service');
    }

    return data;
  } catch (error) {
    console.error('Vectorization error:', error);
    throw error;
  }
};

export async function removeBackground(params: FileUploadParams): Promise<RecraftResponse> {
  try {
    const formData = new FormData();
    formData.append('file', params.file);
    if (params.response_format) {
      formData.append('response_format', params.response_format);
    }

    const response = await recraftApi.post('/remove-background', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    return response.data;
  } catch (error) {
    console.error('Background removal error:', error);
    throw error;
  }
}

export async function clarityUpscale(params: FileUploadParams): Promise<RecraftResponse> {
  try {
    const formData = new FormData();
    formData.append('file', params.file);
    if (params.response_format) {
      formData.append('response_format', params.response_format);
    }

    const response = await recraftApi.post('/upscale', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    return response.data;
  } catch (error) {
    console.error('Upscale error:', error);
    throw error;
  }
}

export async function generativeUpscale(params: FileUploadParams): Promise<RecraftResponse> {
  try {
    const formData = new FormData();
    formData.append('file', params.file);
    if (params.response_format) {
      formData.append('response_format', params.response_format);
    }

    const response = await recraftApi.post('/generative-upscale', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    return response.data;
  } catch (error) {
    console.error('Generative upscale error:', error);
    throw error;
  }
}

export async function createStyle(params: CreateStyleParams): Promise<StyleResponse> {
  try {
    const formData = new FormData();
    formData.append('style', params.style);
    params.files.forEach((file, index) => {
      validateFileFormat(file);
      formData.append(`file${index + 1}`, file);
    });

    const response = await recraftApi.post('/styles', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    return response.data;
  } catch (error) {
    console.error('Style creation error:', error);
    throw error;
  }
}