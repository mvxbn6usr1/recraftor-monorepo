export type RecraftModel = 'recraftv3' | 'recraft20b';
export type ResponseFormat = 'url' | 'b64_json';
export type ImageSize = '1024x1024' | '1365x1024' | '1024x1365' | '1536x1024' | '1024x1536' | 
  '1820x1024' | '1024x1820' | '1024x2048' | '2048x1024' | '1434x1024' | '1024x1434' | 
  '1024x1280' | '1280x1024' | '1024x1707' | '1707x1024';

export type StyleType = 'any' | 'realistic_image' | 'digital_illustration' | 'vector_illustration' | 'icon';

export interface RGB {
  rgb: [number, number, number];
}

export interface Controls {
  colors?: RGB[];
  background_color?: RGB;
}

export interface RecraftGenerateParams {
  prompt: string;
  style?: StyleType;
  substyle?: string;
  model?: RecraftModel;
  size?: ImageSize;
  n?: 1 | 2;
  response_format?: ResponseFormat;
  controls?: Controls;
  style_id?: string;
}

export interface RecraftResponse {
  data: Array<{
    url: string;
  }>;
}

export interface RecraftError {
  error: {
    message: string;
    type: string;
    code: string;
  };
}

export interface FileUploadParams {
  file: File;
  response_format?: ResponseFormat;
}

export interface CreateStyleParams {
  style: StyleType;
  files: File[];
}

export interface StyleResponse {
  id: string;
}

export type ToolType = 'generate' | 'vectorize' | 'removeBackground' | 'clarityUpscale' | 'generativeUpscale' | 'createStyle';