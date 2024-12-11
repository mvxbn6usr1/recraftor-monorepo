import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TokenService, TOKEN_COSTS, OperationType } from '@/lib/token-service';
import axios, { AxiosError, isAxiosError } from 'axios';

const RECRAFT_API_TOKEN = process.env.RECRAFT_API_TOKEN;
const RECRAFT_API_URL = 'https://external.api.recraft.ai/v1';
const ALLOWED_ORIGIN = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5173'
  : process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

if (!RECRAFT_API_TOKEN) {
  throw new Error('RECRAFT_API_TOKEN environment variable is not set');
}

const api = axios.create({
  baseURL: RECRAFT_API_URL,
  headers: {
    'Authorization': `Bearer ${RECRAFT_API_TOKEN}`,
  },
});

// Map API endpoints to operations and their corresponding Recraft endpoints
const ENDPOINT_OPERATIONS: Record<string, { operation: OperationType; recraftEndpoint: string }> = {
  '/generations': { operation: 'raster_generation', recraftEndpoint: '/images/generations' },
  '/vectorize': { operation: 'vectorization', recraftEndpoint: '/images/vectorize' },
  '/remove-background': { operation: 'background_removal', recraftEndpoint: '/images/removeBackground' },
  '/upscale': { operation: 'clarity_upscale', recraftEndpoint: '/images/clarityUpscale' },
  '/generative-upscale': { operation: 'generative_upscale', recraftEndpoint: '/images/generativeUpscale' },
  '/styles': { operation: 'style_creation', recraftEndpoint: '/styles' },
};

interface RequestBody {
  style?: string;
  [key: string]: unknown;
}

// Helper function to add CORS headers
function corsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

// Handle OPTIONS requests (preflight)
export async function OPTIONS() {
  return corsHeaders(new NextResponse(null, { status: 200 }));
}

// Helper function to format the response to match Recraft API format
function formatResponse(data: any): any {
  console.log('Formatting response:', {
    originalData: data,
    hasData: !!data.data,
    hasImage: !!data.image,
    hasImages: !!data.images,
    isString: typeof data === 'string',
    imageUrl: data.image?.url
  });

  try {
    // If the response is already in the correct format, return it as is
    if (data.data && Array.isArray(data.data) && data.data[0]?.url) {
      console.log('Response already in correct format');
      return data;
    }

    // If it's a URL string, wrap it in the expected format
    if (typeof data === 'string' && data.startsWith('http')) {
      console.log('Converting URL string to data format');
      return { 
        data: [{ url: data }],
        created: Math.floor(Date.now() / 1000)
      };
    }

    // If it has an image URL in Recraft format
    if (data.image?.url) {
      console.log('Converting Recraft image format to data format');
      const formattedResponse = { 
        data: [{ url: data.image.url }],
        created: data.created || Math.floor(Date.now() / 1000)
      };
      console.log('Formatted response:', formattedResponse);
      return formattedResponse;
    }

    // If it has multiple images
    if (data.images && Array.isArray(data.images)) {
      console.log('Converting multiple images to data format');
      return {
        data: data.images.map((img: any) => ({ url: img.url })),
        created: data.created || Math.floor(Date.now() / 1000)
      };
    }

    // If we have a data array but without url property
    if (data.data && Array.isArray(data.data)) {
      console.log('Converting data array to URL format');
      return {
        data: data.data.map((item: any) => ({
          url: item.url || item.image?.url || item
        })),
        created: data.created || Math.floor(Date.now() / 1000)
      };
    }

    // If we have a direct URL in the data
    if (data.url) {
      console.log('Converting direct URL to data format');
      return {
        data: [{ url: data.url }],
        created: data.created || Math.floor(Date.now() / 1000)
      };
    }

    console.warn('Using default format for unexpected response structure:', data);
    return { 
      data: [{ url: data.image?.url || data.url || data }],
      created: data.created || Math.floor(Date.now() / 1000)
    };
  } catch (error) {
    console.error('Error formatting response:', error);
    console.error('Original response data:', data);
    throw new Error('Failed to format API response');
  }
}

async function getRequestData(request: NextRequest): Promise<{ body: any; contentType: string }> {
  const contentType = request.headers.get('content-type') || 'application/json';
  
  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    return { body: formData, contentType };
  } else {
    const body = await request.json();
    return { body, contentType };
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return corsHeaders(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
    }

    // Get the endpoint from the path parameters
    const endpoint = '/' + params.path.join('/');
    const endpointConfig = ENDPOINT_OPERATIONS[endpoint];

    if (!endpointConfig) {
      return corsHeaders(NextResponse.json(
        { error: 'Invalid endpoint' },
        { status: 400 }
      ));
    }

    let { operation, recraftEndpoint } = endpointConfig;

    // Get the request data based on content type
    const { body, contentType } = await getRequestData(request);

    // Special handling for vector illustration generation
    if (endpoint === '/generations' && 
        (body.style === 'vector_illustration' || 
         (body.get && body.get('style') === 'vector_illustration'))) {
      operation = 'vector_illustration';
    }

    // Check token balance and deduct tokens
    const cost = TOKEN_COSTS[operation];
    try {
      await TokenService.deductTokens(
        session.user.id,
        operation,
        { endpoint, cost }
      );
    } catch (error) {
      if (error instanceof Error) {
        return corsHeaders(NextResponse.json(
          { error: error.message },
          { status: 402 }
        ));
      }
      throw error;
    }

    // Forward the request to Recraft API
    try {
      console.log('Forwarding request to Recraft API:', {
        endpoint: recraftEndpoint,
        contentType,
        isFormData: body instanceof FormData,
        method: request.method,
        headers: {
          'Content-Type': contentType,
          'Accept': 'application/json'
        }
      });

      if (body instanceof FormData) {
        console.log('FormData contents:', {
          keys: Array.from(body.keys()),
          fileInfo: body.get('file') instanceof File ? {
            name: (body.get('file') as File).name,
            type: (body.get('file') as File).type,
            size: (body.get('file') as File).size
          } : null
        });
      }

      const response = await api.request({
        method: request.method,
        url: recraftEndpoint,
        data: body,
        headers: {
          'Content-Type': contentType,
          'Accept': 'application/json'
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        transformRequest: contentType.includes('multipart/form-data') 
          ? [(data) => data] // Prevent axios from transforming FormData
          : undefined
      });

      console.log('Recraft API raw response:', {
        status: response.status,
        headers: response.headers,
        data: response.data
      });

      // Format the response to match the expected structure
      const formattedResponse = formatResponse(response.data);
      
      console.log('Formatted response:', formattedResponse);
      
      return corsHeaders(NextResponse.json(formattedResponse));
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('Recraft API error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.response?.data?.error?.message,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers
          }
        });

        return corsHeaders(NextResponse.json(
          error.response?.data || { error: 'API request failed' },
          { status: error.response?.status || 500 }
        ));
      }
      throw error;
    }
  } catch (error) {
    console.error('Recraft API error:', error);
    return corsHeaders(NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    ));
  }
}

// ... rest of the file ... 