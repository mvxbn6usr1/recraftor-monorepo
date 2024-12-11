# Recraftor Application

Internal Vite-based application for AI image generation and manipulation.

## Overview

Recraftor provides:
- AI image generation with multiple styles
- Image vectorization and processing
- Background removal and upscaling
- Style creation and management
- Token-based operation system
- Portal integration

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Architecture

### Core Components

#### UI Layer
- `src/components/` - React components
  - `ui/` - Base UI components
    - `image-modal.tsx` - Image preview and actions
    - `color-picker.tsx` - RGB color selection
    - `card.tsx` - Card layout components
    - `dialog.tsx` - Modal dialogs
    - `menubar.tsx` - Navigation menus
    - `tabs.tsx` - Tab panels
    - `resizable.tsx` - Resizable panels
    - `accordion.tsx` - Collapsible sections
  - `gallery/` - Image management
    - `ImageGallery.tsx` - Image grid display
    - `ImageMetadata.tsx` - Image information
  - `sidebars/` - Tool controls
    - `GenerateSidebar.tsx` - Generation options
  - `modals/` - Modal components
    - `ResponsiveImageModal.tsx` - Responsive image viewer
  - `mobile/` - Mobile-specific components
    - `MobileLayout.tsx` - Mobile layout wrapper
    - `MobileHeader.tsx` - Mobile header
    - `MobileToolbar.tsx` - Mobile tool selection

#### Business Logic
- `src/hooks/` - Custom React hooks
  - `use-image-management.ts` - Image operations
  - `use-media-query.ts` - Responsive design
  - `use-resize-observer.ts` - Layout management

#### Core Utilities
- `src/lib/` - Core utilities
  - `recraft.ts` - API integration
  - `api-config.ts` - API configuration
  - `image-storage.ts` - Local storage
  - `image-cache.ts` - Image caching
  - `utils/` - Utility functions

#### Type Definitions
- `src/types/` - TypeScript definitions
  - `recraft.ts` - API types
  - `image.ts` - Image types
  - `style.ts` - Style types

### Image Operations

#### Generation
- Raster images
- Vector illustrations
- Digital art
- Icons

#### Processing
- Vectorization
- Background removal
- Clarity upscale
- Generative upscale

#### Style Management
- Style creation
- Style application
- Custom style storage
- Style metadata

### User Interface

#### Layout System
- Responsive design
- Mobile-first approach
- Resizable panels
- Adaptive layouts

#### Component Library
- Accessible components
- Keyboard navigation
- Screen reader support
- Touch interactions

#### Interaction Patterns
- Drag and drop
- Context menus
- Tool selection
- Image manipulation

### Portal Integration

#### Communication
- PostMessage protocol
- Origin validation
- Error handling
- State synchronization

#### Token System
1. Token Check
   ```typescript
   await window.requestTokenOperation('check_balance', {
     operation: 'raster_generation'
   });
   ```

2. Token Deduction
   ```typescript
   await window.requestTokenOperation('deduct_tokens', {
     operation: 'vector_generation',
     metadata: { /* operation details */ }
   });
   ```

### Data Management

#### Image Storage
- IndexedDB for persistence
- Blob storage for images
- Metadata management
- Transaction support

#### Image Cache
- In-memory caching
- URL object management
- Size limits
- Automatic cleanup

### Security Features

- Origin validation
- Parent verification
- Message validation
- Token authorization
- Input sanitization

## Environment Setup

Required variables in `.env`:
```bash
# Portal Integration
VITE_PORTAL_URL="http://localhost:3000"

# Environment
VITE_ENV="development"
```

## Error Handling

1. API Errors
   - Token validation
   - Operation limits
   - Input validation
   - Network issues

2. Portal Communication
   - Message validation
   - Origin verification
   - Response timeout
   - State recovery

3. Image Processing
   - Format validation
   - Size limits
   - Processing errors
   - Upload failures

## Performance Optimization

- Image lazy loading
- Virtual scrolling
- Debounced operations
- Cache management
- Memory cleanup
- URL object lifecycle
- Blob management

## Deployment

1. Build the application:
   ```bash
   pnpm build
   ```

2. Configure environment:
   - Set production portal URL
   - Configure CORS settings
   - Set up error tracking

3. Deploy static files:
   - Serve from CDN
   - Configure caching
   - Set security headers

## Monitoring

Key metrics to track:
1. Operation Performance
   - Generation time
   - Processing speed
   - Error rates
   - Success rates

2. User Experience
   - Load times
   - Response times
   - Error feedback
   - UI interactions

3. Resource Usage
   - Memory usage
   - Network calls
   - Cache hits
   - Token usage
   - Blob storage
   - IndexedDB usage

## Troubleshooting

Common issues:

1. Portal Communication
   - Check origin configuration
   - Verify message format
   - Check token requests
   - Validate responses

2. Image Operations
   - Validate input formats
   - Check token balance
   - Verify API responses
   - Check error logs

3. Performance Issues
   - Monitor image caching
   - Check memory usage
   - Verify lazy loading
   - Analyze network calls
   - Check blob lifecycle
   - Verify URL cleanup