# Recraftor Portal

Internal portal application for managing Recraftor services and user accounts.

## Overview

The portal provides:
- User authentication and management
- Token system integration
- Recraftor application embedding
- API proxying and security
- User dashboard and analytics

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Architecture

### Core Components

- `src/app/` - Next.js App Router pages and API routes
  - `(dashboard)/` - Protected dashboard routes
  - `api/` - Backend API endpoints
  - `auth/` - Authentication pages
  - `pricing/` - Subscription plans
- `src/components/` - Reusable React components
  - `auth/` - Authentication forms
  - `layout/` - Layout components
  - `navigation/` - Navigation components
  - `ui/` - Base UI components
- `src/lib/` - Core utilities and services
  - `auth.ts` - Authentication configuration
  - `prisma.ts` - Database client
  - `utils.ts` - Utility functions

### Token System

The token system is implemented as a shared package `@recraftor/token-service` with:

#### Operations
- Image Generation
  - `raster_generation` (4 tokens)
  - `vector_generation` (8 tokens)
  - `vector_illustration` (8 tokens)

- Image Processing
  - `vectorization` (4 tokens)
  - `background_removal` (4 tokens)
  - `clarity_upscale` (4 tokens)
  - `generative_upscale` (80 tokens)

- Style Operations
  - `style_creation` (4 tokens)

#### Features
- Token balance tracking
- Transaction history
- Operation validation
- Monthly renewals
- Plan-based token allocation
- Professional plan token rollover

### API Integration

#### Recraft API Proxy
- Secure token validation
- Request transformation
- Response formatting
- Error handling
- CORS configuration

#### Token API
- Balance checking
- Token deduction
- Transaction history
- Operation validation

### Authentication

Uses NextAuth.js with:
- Email/password authentication
- Session management
- Protected API routes
- Secure cookie handling
- CORS configuration

### Security Features

- Origin validation
- CORS headers
- Token validation
- Request sanitization
- Error handling
- Rate limiting
- Session management

## Environment Setup

Required variables in `.env`:
```bash
# Database
DATABASE_URL="file:./dev.db"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Recraftor Integration
NEXT_PUBLIC_APP_URL="http://localhost:5173"
RECRAFT_API_TOKEN="your-recraft-api-token"
```

## API Routes

### Token Management
- `GET /api/tokens` - Get balance and history
- `POST /api/tokens` - Deduct tokens
- `PUT /api/tokens` - Add tokens

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in
- `GET /api/auth/session` - Get session

### Recraft Integration
- `POST /api/recraft/generations` - Generate images
- `POST /api/recraft/vectorize` - Vectorize images
- `POST /api/recraft/remove-background` - Remove backgrounds
- `POST /api/recraft/upscale` - Upscale images
- `POST /api/recraft/generative-upscale` - AI upscale
- `POST /api/recraft/styles` - Create styles

## Database Schema

### User Management
- `User` - User accounts
- `Account` - OAuth accounts
- `Session` - Active sessions
- `VerificationToken` - Email verification

### Token System
- `TokenBalance` - User token balances
- `TokenTransaction` - Token operations

## Error Handling

1. Token Operations
   - `InsufficientTokensError` - Not enough tokens
   - `InvalidOperationError` - Invalid operation type
   - Transaction failures

2. API Requests
   - Authentication errors
   - Validation errors
   - Rate limiting
   - External API errors

3. Security
   - CORS violations
   - Invalid origins
   - Session expiration
   - Token validation

## Deployment

1. Build the application:
   ```bash
   pnpm build
   ```

2. Set production environment:
   - Configure DATABASE_URL
   - Set NEXTAUTH_URL
   - Set RECRAFT_API_TOKEN
   - Configure CORS origins

3. Start the server:
   ```bash
   pnpm start
   ```

## Monitoring

Key metrics to monitor:
1. Token Operations
   - Balance changes
   - Failed operations
   - Usage patterns

2. API Performance
   - Response times
   - Error rates
   - Rate limiting hits

3. Security Events
   - Authentication failures
   - CORS violations
   - Invalid tokens

## Troubleshooting

Common issues:

1. Token Operations
   - Check token balance
   - Verify operation type
   - Check transaction history

2. API Integration
   - Verify CORS settings
   - Check API token
   - Validate request format

3. Authentication
   - Check session status
   - Verify credentials
   - Check CORS headers
