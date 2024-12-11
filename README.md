# Recraftor Monorepo

This monorepo contains all Recraftor applications and shared packages.

## Structure

```
recraftor-monorepo/
├── apps/
│   ├── portal/           # Next.js portal application
│   └── recraftor/        # Vite-based Recraftor application
├── packages/
│   ├── shared/           # Shared types and utilities
│   ├── token-service/    # Token management service
│   └── api-client/       # API client utilities
├── scripts/              # Shared scripts
└── docs/                 # Documentation
```

## Getting Started

1. **Clone the Repository**
   ```bash
   git clone [repository-url]
   cd recraftor-monorepo
   ```

2. **Install Dependencies**
   ```bash
   # Install pnpm if not already installed
   npm install -g pnpm

   # Install project dependencies
   pnpm install
   ```

3. **Environment Setup**
   The repository includes development environment files:
   - `apps/portal/.env` - Portal application environment
   - `apps/portal/.env.local` - Local portal overrides
   - `apps/recraftor/.env` - Recraftor application environment
   - `apps/recraftor/.env.local` - Local Recraftor overrides

   For production deployment, create:
   - `.env.production` - Production environment
   - `.env.staging` - Staging environment (if needed)

4. **Development**
   ```bash
   # Start all applications in development mode
   pnpm dev

   # Build all packages and applications
   pnpm build

   # Run linting
   pnpm lint
   ```

## Environment Variables

### Portal Application
Required variables for the portal:
- `DATABASE_URL` - Database connection string
- `NEXTAUTH_URL` - NextAuth base URL
- `NEXTAUTH_SECRET` - NextAuth secret key
- `NEXT_PUBLIC_RECRAFTOR_URL` - Recraftor application URL
- `RECRAFT_API_TOKEN` - Recraft API authentication token

### Recraftor Application
Required variables for Recraftor:
- `VITE_PORTAL_URL` - Portal application URL
- `VITE_ENV` - Environment indicator (development/production)

## Package Management

- All dependencies are managed through pnpm workspaces
- Shared packages are referenced using workspace: protocol
- Version management is handled at the monorepo level

## Contributing

1. Create a new branch for your changes
2. Make your changes
3. Run tests and linting
4. Create a pull request

## Security Notes

- Development environment files are included in the repository
- Production credentials should never be committed
- Use separate environment files for production deployment
- Always review environment files before committing

## Deployment

1. **Staging**
   - Create `.env.staging` with staging credentials
   - Deploy using staging configuration

2. **Production**
   - Create `.env.production` with production credentials
   - Follow security best practices for credential management
   - Deploy using production configuration 