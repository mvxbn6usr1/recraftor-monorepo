'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface RecraftorClientProps {
  userId: string;
}

interface TokenResponse {
  balance: number;
  history: Array<{
    operation: string;
    amount: number;
    description: string;
    createdAt: string;
    metadata?: string;
  }>;
}

interface TokenDeductionResponse {
  success: boolean;
  balance: number;
  operation: string;
  cost: number;
}

interface TokenError {
  error: string;
  code?: string;
  message?: string;
  validOperations?: string[];
}

// Map Recraft operations to our token operations
const OPERATION_MAP = {
  generate: (style?: string) => style === 'vector_illustration' ? 'vector_illustration' : 'raster_generation',
  vectorize: 'vectorization',
  remove_background: 'background_removal',
  upscale: 'clarity_upscale',
  generative_upscale: 'generative_upscale',
  create_style: 'style_creation',
} as const;

export function RecraftorClient({ userId }: RecraftorClientProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const recraftorUrl = process.env.NEXT_PUBLIC_RECRAFTOR_URL;
  if (!recraftorUrl) {
    throw new Error('NEXT_PUBLIC_RECRAFTOR_URL environment variable is not set');
  }
  const recraftorOrigin = new URL(recraftorUrl).origin;

  // Fetch token balance
  const fetchTokenBalance = useCallback(async () => {
    try {
      const response = await fetch('/api/tokens');
      if (!response.ok) throw new Error('Failed to fetch token balance');
      const data: TokenResponse = await response.json();
      setTokenBalance(data.balance);
    } catch (error) {
      console.error('Error fetching token balance:', error);
      toast.error('Failed to fetch token balance');
    }
  }, []);

  // Map Recraft operation to token operation
  const mapOperation = useCallback((operation: string, metadata?: any) => {
    if (operation === 'generate' && metadata?.style) {
      return OPERATION_MAP.generate(metadata.style);
    }
    return OPERATION_MAP[operation as keyof typeof OPERATION_MAP] || operation;
  }, []);

  // Handle token deduction
  const handleTokenDeduction = useCallback(async (operation: string, metadata?: any) => {
    try {
      const mappedOperation = mapOperation(operation, metadata);
      console.log('Attempting token deduction:', { 
        originalOperation: operation,
        mappedOperation,
        metadata 
      });
      
      const response = await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          operation: mappedOperation,
          metadata: {
            ...metadata,
            originalOperation: operation
          }
        }),
      });

      const data: TokenDeductionResponse | TokenError = await response.json();

      if (!response.ok) {
        console.error('Token deduction failed:', { 
          status: response.status, 
          data 
        });

        const error = data as TokenError;

        switch (response.status) {
          case 402: // Insufficient tokens
            toast.error('Insufficient Tokens', {
              description: error.error
            });
            break;

          case 400: // Invalid operation
            if (error.code === 'INVALID_OPERATION') {
              toast.error('Invalid Operation', {
                description: `Valid operations: ${error.validOperations?.join(', ')}`
              });
            } else {
              toast.error('Bad Request', {
                description: error.error
              });
            }
            break;

          case 401: // Unauthorized
            toast.error('Unauthorized', {
              description: 'Please sign in to continue'
            });
            break;

          default:
            toast.error('Operation Failed', {
              description: error.message || error.error || 'An unexpected error occurred'
            });
        }

        return false;
      }

      const success = data as TokenDeductionResponse;
      console.log('Token deduction successful:', success);
      
      setTokenBalance(success.balance);
      
      toast.success('Operation processed successfully', {
        description: `Used ${success.cost} tokens. New balance: ${success.balance}`
      });
      
      return true;
    } catch (error) {
      console.error('Error processing token deduction:', error);
      
      toast.error('Failed to process operation', {
        description: error instanceof Error 
          ? error.message 
          : 'Please try again or contact support if the issue persists'
      });
      
      return false;
    }
  }, [mapOperation]);

  // Initialize communication with Recraftor
  const initializeRecraftor = useCallback(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'INITIALIZE', userId },
        recraftorOrigin
      );
    }
  }, [userId, recraftorOrigin]);

  // Handle messages from Recraftor
  const handleMessage = useCallback(async (event: MessageEvent) => {
    // Strict origin validation
    if (event.origin !== recraftorOrigin) {
      console.warn('Received message from unauthorized origin:', event.origin);
      return;
    }

    try {
      console.log('Received message from Recraftor:', event.data);

      switch (event.data.type) {
        case 'RECRAFTOR_READY':
          setIsLoading(false);
          initializeRecraftor();
          break;

        case 'RECRAFTOR_ERROR':
          console.error('Recraftor error:', event.data.error);
          setError(event.data.error);
          toast.error('Recraftor Error', {
            description: event.data.error
          });
          break;

        case 'RECRAFTOR_LOADED':
          setIsLoading(false);
          await fetchTokenBalance();
          break;

        case 'OPERATION_REQUEST':
          console.log('Processing operation request:', event.data);
          const { operation, metadata } = event.data;
          const success = await handleTokenDeduction(operation, metadata);
          
          // Respond to Recraftor with operation result
          if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage(
              {
                type: 'OPERATION_RESPONSE',
                success,
                operation,
                remainingTokens: tokenBalance,
                error: !success ? 'Failed to process operation' : undefined
              },
              recraftorOrigin
            );
          }
          break;

        default:
          console.log('Unhandled message type:', event.data.type);
      }
    } catch (err) {
      console.error('Error processing message:', err);
      setError('An unexpected error occurred');
      toast.error('Error', {
        description: 'Failed to process Recraftor message'
      });

      // Notify Recraftor of the error
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          {
            type: 'OPERATION_RESPONSE',
            success: false,
            error: 'Internal error processing operation'
          },
          recraftorOrigin
        );
      }
    }
  }, [recraftorOrigin, initializeRecraftor, handleTokenDeduction, tokenBalance, fetchTokenBalance]);

  // Set up message listener and fetch initial token balance
  useEffect(() => {
    fetchTokenBalance();
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage, fetchTokenBalance]);

  // Handle iframe load error
  const handleIframeError = () => {
    setError('Failed to load Recraftor. Please try again later.');
    setIsLoading(false);
  };

  // Handle iframe load success
  const handleIframeLoad = () => {
    console.log('Iframe loaded, waiting for ready signal...');
  };

  if (error) {
    return (
      <div className="flex h-[calc(100vh-5rem)] w-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Error</h3>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-5rem)]">
      {tokenBalance !== null && (
        <div className="absolute top-4 right-4 z-10 bg-black/75 backdrop-blur-sm rounded-md px-3 py-1.5 text-sm text-white">
          {tokenBalance} tokens remaining
        </div>
      )}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-black" />
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={`${recraftorUrl}?userId=${encodeURIComponent(userId)}`}
        className="w-full h-full border-none"
        allow="clipboard-write"
        onError={handleIframeError}
        onLoad={handleIframeLoad}
      />
    </div>
  );
} 