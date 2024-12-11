# API Reference

## Overview

The Recraftor API provides endpoints for image generation, processing, and token management. All endpoints require authentication and proper token balance.

## Base URLs

```
Development: http://localhost:3000/api
Production:  https://your-domain.com/api
```

## Authentication

All requests require authentication using NextAuth.js session cookies.

```http
Cookie: next-auth.session-token=<session_token>
```

## Common Headers

```http
Content-Type: application/json
Accept: application/json
```

## Endpoints

### Token Management

#### Get Token Balance

```http
GET /tokens
```

Returns user's token balance and transaction history.

**Response**
```json
{
  "balance": 100,
  "history": [
    {
      "id": "transaction_id",
      "amount": -4,
      "operation": "raster_generation",
      "description": "Used 4 tokens for raster generation",
      "createdAt": "2024-01-01T00:00:00Z",
      "metadata": {
        "category": "GENERATION",
        "cost": 4,
        "operationType": "raster_generation"
      }
    }
  ],
  "operations": {
    "costs": {
      "raster_generation": 4,
      "vector_generation": 8,
      "vectorization": 4,
      "background_removal": 4,
      "clarity_upscale": 4,
      "generative_upscale": 80,
      "style_creation": 4,
      "vector_illustration": 8
    },
    "categories": {
      "GENERATION": ["raster_generation", "vector_generation", "vector_illustration"],
      "PROCESSING": ["vectorization", "background_removal", "clarity_upscale", "generative_upscale"],
      "STYLE": ["style_creation"]
    }
  }
}
```

#### Deduct Tokens

```http
POST /tokens
```

Deducts tokens for an operation.

**Request Body**
```json
{
  "operation": "raster_generation",
  "metadata": {
    "prompt": "A beautiful sunset",
    "style": "realistic_image"
  }
}
```

**Response**
```json
{
  "success": true,
  "balance": 96,
  "operation": "raster_generation",
  "cost": 4
}
```

### Image Generation

#### Generate Image

```http
POST /recraft/generations
```

Generates an image based on the provided parameters.

**Request Body**
```json
{
  "prompt": "A beautiful sunset",
  "model": "recraftv3",
  "response_format": "url",
  "size": "1024x1024",
  "style": "realistic_image",
  "substyle": "photography",
  "controls": {
    "colors": [
      {"rgb": [255, 100, 0]}
    ]
  }
}
```

**Response**
```json
{
  "data": [
    {
      "url": "https://storage.example.com/image.png"
    }
  ],
  "created": 1704067200
}
```

#### Vectorize Image

```http
POST /recraft/vectorize
Content-Type: multipart/form-data
```

Converts a raster image to vector format.

**Request Body**
```
file: <image_file>
```

**Response**
```json
{
  "data": [
    {
      "url": "https://storage.example.com/vector.svg"
    }
  ],
  "created": 1704067200
}
```

#### Remove Background

```http
POST /recraft/remove-background
Content-Type: multipart/form-data
```

Removes the background from an image.

**Request Body**
```
file: <image_file>
response_format: "url"
```

**Response**
```json
{
  "data": [
    {
      "url": "https://storage.example.com/no-bg.png"
    }
  ],
  "created": 1704067200
}
```

#### Upscale Image

```http
POST /recraft/upscale
Content-Type: multipart/form-data
```

Upscales an image using AI.

**Request Body**
```
file: <image_file>
response_format: "url"
```

**Response**
```json
{
  "data": [
    {
      "url": "https://storage.example.com/upscaled.png"
    }
  ],
  "created": 1704067200
}
```

### Style Management

#### Create Style

```http
POST /recraft/styles
Content-Type: multipart/form-data
```

Creates a custom style using up to 5 reference images.

**Request Body**
```
style: "realistic_image" | "digital_illustration" | "vector_illustration" | "icon" | "any"
files[]: <image_file_1>
files[]: <image_file_2>
...
files[]: <image_file_5> (optional)
```

**Requirements**
- File format: PNG only
- Number of files: Minimum 1, maximum 5 images
- Each file must be a valid PNG image
- Style parameter must be one of the allowed values

**Response**
```json
{
  "id": "style_id",
  "created": 1704067200
}
```

Note: Upload between 1-5 images to create a custom style. The style ID can then be used in generation requests.

## Error Handling

### Error Response Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Authentication required |
| `INSUFFICIENT_TOKENS` | Not enough tokens |
| `INVALID_OPERATION` | Invalid operation type |
| `INVALID_INPUT` | Invalid request parameters |
| `PROCESSING_ERROR` | Image processing failed |

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request |
| 401 | Unauthorized |
| 402 | Payment Required (Insufficient Tokens) |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

## Rate Limiting

- 100 requests per minute per user
- 1000 requests per hour per user
- Rate limit headers included in response

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1704067260
```

## Webhooks

### Operation Completion

```http
POST /webhook/operation-complete
```

Sent when an asynchronous operation completes.

**Payload**
```json
{
  "operation_id": "op_123",
  "status": "completed",
  "result": {
    "url": "https://storage.example.com/result.png"
  },
  "created": 1704067200
}
```

## Security

### CORS Configuration

Allowed origins:
- Development: `http://localhost:5173`
- Production: Configured via `NEXT_PUBLIC_APP_URL`

### Request Validation

1. Origin Validation
   - Requests must come from allowed origins
   - Referer header checked

2. Token Validation
   - Valid session required
   - Sufficient token balance
   - Operation authorization

3. Input Validation
   - File size limits
   - Supported formats
   - Parameter validation

## Development Tools

### API Testing

Using cURL:

```bash
# Get token balance
curl -X GET "http://localhost:3000/api/tokens" \
  -H "Cookie: next-auth.session-token=<token>"

# Generate image
curl -X POST "http://localhost:3000/api/recraft/generations" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=<token>" \
  -d '{
    "prompt": "Test image",
    "model": "recraftv3"
  }'
```

Using Postman:
1. Import collection from `postman/recraftor-api.json`
2. Set environment variables
3. Run requests

## Best Practices

1. **Error Handling**
   - Always check response status
   - Handle rate limits gracefully
   - Implement retries with backoff

2. **Performance**
   - Use appropriate image sizes
   - Implement caching
   - Monitor response times

3. **Security**
   - Secure token storage
   - Validate all inputs
   - Monitor for abuse

## Monitoring

### Metrics

1. **Operation Metrics**
   - Success rates
   - Processing times
   - Error rates

2. **Token Usage**
   - Balance changes
   - Operation costs
   - Usage patterns

3. **API Health**
   - Response times
   - Error rates
   - Rate limit hits

## Support

- Documentation: `/docs/api`
- Issues: GitHub Issues
- Support: support@example.com 