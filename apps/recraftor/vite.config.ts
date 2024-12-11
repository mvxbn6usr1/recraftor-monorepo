import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, ConfigEnv, UserConfig } from 'vite';
import type { ViteDevServer } from 'vite';
import type { Connect } from 'vite';

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  const allowedOrigins = {
    development: env.VITE_PORTAL_URL || 'http://localhost:3000',
    production: [
      'https://your-production-domain.com',
      'https://your-staging-domain.com'
    ]
  };

  // Middleware to check Referer
  const refererCheckMiddleware = (
    req: Connect.IncomingMessage,
    res: Connect.ServerResponse,
    next: Connect.NextFunction
  ) => {
    const referer = req.headers.referer;
    const validOrigin = mode === 'production'
      ? allowedOrigins.production.some(origin => referer?.startsWith(origin))
      : referer?.startsWith(allowedOrigins.development);

    // Allow OPTIONS requests for CORS
    if (req.method === 'OPTIONS') {
      next();
      return;
    }

    // Block requests without valid referer
    if (!referer || !validOrigin) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ 
        error: 'Access denied. This application can only be accessed through the authorized portal.' 
      }));
      return;
    }

    next();
  };

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: {
      include: ['idb'],
    },
    server: {
      cors: {
        origin: mode === 'production' 
          ? allowedOrigins.production 
          : allowedOrigins.development,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization'],
      },
      configureServer: (server: ViteDevServer) => {
        server.middlewares.use(refererCheckMiddleware);
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
  };
});
