'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface RecraftorClientProps {
  userId: string;
  recraftorUrl: string;
}

export function RecraftorClient({ userId, recraftorUrl }: RecraftorClientProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Initialize communication with Recraftor
  const initializeRecraftor = useCallback(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'INITIALIZE', userId },
        recraftorUrl
      );
    }
  }, [userId, recraftorUrl]);

  // Handle messages from Recraftor
  const handleMessage = useCallback((event: MessageEvent) => {
    // Verify origin
    if (event.origin !== recraftorUrl) {
      console.warn('Received message from unauthorized origin:', event.origin);
      return;
    }

    try {
      switch (event.data.type) {
        case 'RECRAFTOR_READY':
          setIsLoading(false);
          initializeRecraftor();
          break;
        case 'RECRAFTOR_ERROR':
          setError(event.data.error);
          break;
        case 'RECRAFTOR_LOADED':
          setIsLoading(false);
          break;
        default:
          console.log('Unhandled message type:', event.data.type);
      }
    } catch (err) {
      console.error('Error processing message:', err);
      setError('An unexpected error occurred');
    }
  }, [recraftorUrl, initializeRecraftor]);

  // Set up message listener
  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  // Handle iframe load error
  const handleIframeError = () => {
    setError('Failed to load Recraftor. Please try again later.');
    setIsLoading(false);
  };

  // Handle iframe load success
  const handleIframeLoad = () => {
    // The iframe has loaded, but we'll wait for the RECRAFTOR_READY message
    // before considering it fully initialized
    console.log('Iframe loaded, waiting for ready signal...');
  };

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
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
    <div className="relative w-full h-screen">
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