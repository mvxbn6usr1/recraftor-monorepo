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

## Installation

Choose the appropriate installation method for your environment:

### Linux
```bash
# Download and run the setup script
curl -o- https://raw.githubusercontent.com/mvxbn6usr1/recraftor-monorepo/main/scripts/setup-linux.sh | bash
```

### macOS
```bash
# Download and run the setup script
curl -o- https://raw.githubusercontent.com/mvxbn6usr1/recraftor-monorepo/main/scripts/setup-macos.sh | bash
```

### Replit
1. Create a new Repl and import from GitHub
2. Select the recraftor-monorepo repository
3. Run the setup script:
```bash
bash scripts/setup-replit.sh
```

### Manual Installation
If you prefer to install manually or if the automated scripts don't work:

1. **System Requirements**
   - Node.js 18.x
   - pnpm
   - OpenSSL 1.1.x
   - SQLite

2. **Install Dependencies**
   ```bash
   # Install pnpm
   curl -fsSL https://get.pnpm.io/install.sh | sh -

   # Install project dependencies
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment files
   cp apps/portal/.env.example apps/portal/.env
   cp apps/recraftor/.env.example apps/recraftor/.env
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   cd apps/portal && npx prisma generate
   ```

5. **Build and Run**
   ```bash
   # Build all packages
   pnpm build

   # Start development servers
   pnpm dev
   ```

### Troubleshooting

#### OpenSSL Issues
If you encounter OpenSSL-related errors:

**Ubuntu/Debian:**
```bash
echo "deb http://security.ubuntu.com/ubuntu focal-security main" | sudo tee /etc/apt/sources.list.d/focal-security.list
sudo apt update
sudo apt install libssl1.1
```

**macOS:**
```bash
brew install openssl@1.1
brew link openssl@1.1 --force
```

**Replit:**
The Replit setup script automatically configures OpenSSL through Nix.

#### Prisma Client Issues
If Prisma client generation fails:
```bash
cd apps/portal
rm -rf node_modules/.prisma
npx prisma generate
```

For more detailed troubleshooting, see [docs/troubleshooting-prisma.md](docs/troubleshooting-prisma.md) 