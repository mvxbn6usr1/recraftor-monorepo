#!/bin/bash

# Exit on error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Source and destination directories
SOURCE_DIR=".."
DEST_DIR="."

echo -e "${YELLOW}Starting migration process...${NC}"

# Step 1: Verify source directories exist
echo -e "\n${YELLOW}Verifying source directories...${NC}"
for dir in "portal" "Recraftor" "business"; do
  if [ ! -d "$SOURCE_DIR/$dir" ]; then
    echo -e "${RED}Error: Directory $SOURCE_DIR/$dir not found${NC}"
    echo -e "${YELLOW}Please ensure you're running this script from the recraftor-monorepo directory${NC}"
    echo -e "${YELLOW}and that the source directories are in the parent directory.${NC}"
    exit 1
  fi
done
echo -e "${GREEN}Source directories verified${NC}"

# Step 2: Set up shared package
echo -e "\n${YELLOW}Setting up shared package...${NC}"
mkdir -p packages/shared/src/{types,utils}

# Copy types
echo "Copying shared types..."
cp "$SOURCE_DIR/Recraftor/src/types/recraft.ts" "packages/shared/src/types/index.ts"

# Create package index
cat > packages/shared/src/index.ts << EOL
export * from './types';
export * from './utils';
EOL

echo -e "${GREEN}Shared package setup completed${NC}"

# Step 3: Copy applications (without modifying originals)
echo -e "\n${YELLOW}Copying applications...${NC}"

# Portal
echo "Copying Portal..."
mkdir -p apps/portal
cp -r "$SOURCE_DIR/portal/"* apps/portal/
cp "$SOURCE_DIR/portal/.env.example" apps/portal/.env.example 2>/dev/null || :
cp "$SOURCE_DIR/portal/.env.local" apps/portal/.env.local 2>/dev/null || :

# Preserve original dependencies and add workspace deps
if [ -f "$SOURCE_DIR/portal/package.json" ]; then
  jq -s '.[0] * {
    "name": "@recraftor/portal",
    "private": true,
    "dependencies": (.[0].dependencies + {
      "@recraftor/shared": "workspace:*",
      "@recraftor/token-service": "workspace:*",
      "@recraftor/api-client": "workspace:*"
    })
  }' "$SOURCE_DIR/portal/package.json" > apps/portal/package.json
else
  echo -e "${RED}Error: portal/package.json not found${NC}"
  exit 1
fi

# Recraftor
echo "Copying Recraftor..."
mkdir -p apps/recraftor
cp -r "$SOURCE_DIR/Recraftor/"* apps/recraftor/
cp "$SOURCE_DIR/Recraftor/.env.example" apps/recraftor/.env.example 2>/dev/null || :
cp "$SOURCE_DIR/Recraftor/.env" apps/recraftor/.env 2>/dev/null || :

# Preserve original dependencies and add workspace deps
if [ -f "$SOURCE_DIR/Recraftor/package.json" ]; then
  jq -s '.[0] * {
    "name": "@recraftor/app",
    "private": true,
    "dependencies": (.[0].dependencies + {
      "@recraftor/shared": "workspace:*",
      "@recraftor/api-client": "workspace:*"
    })
  }' "$SOURCE_DIR/Recraftor/package.json" > apps/recraftor/package.json
else
  echo -e "${RED}Error: Recraftor/package.json not found${NC}"
  exit 1
fi

# Step 4: Copy documentation
echo -e "\n${YELLOW}Copying documentation...${NC}"
mkdir -p docs
cp -r "$SOURCE_DIR/business" docs/

# Step 5: Create token-service package
echo -e "\n${YELLOW}Setting up token-service package...${NC}"
mkdir -p packages/token-service/src
cp "$SOURCE_DIR/portal/src/lib/token-service.ts" packages/token-service/src/index.ts
cp -r "$SOURCE_DIR/portal/prisma" packages/token-service/prisma 2>/dev/null || :

# Step 6: Create api-client package
echo -e "\n${YELLOW}Setting up api-client package...${NC}"
mkdir -p packages/api-client/src
cp "$SOURCE_DIR/Recraftor/src/lib/api-config.ts" packages/api-client/src/index.ts

# Step 7: Create TypeScript configs
echo -e "\n${YELLOW}Setting up TypeScript configurations...${NC}"

# Root tsconfig.json
cat > tsconfig.json << EOL
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [
    { "path": "./packages/shared" },
    { "path": "./packages/token-service" },
    { "path": "./packages/api-client" }
  ]
}
EOL

# Create .gitignore
cat > .gitignore << EOL
# Dependencies
node_modules
.pnp
.pnp.js

# Testing
coverage

# Next.js
.next/
out/
build
dist

# Misc
.DS_Store
*.pem
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Turbo
.turbo

# Vercel
.vercel
EOL

echo -e "\n${GREEN}Migration completed!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Run 'pnpm install' to set up dependencies"
echo "2. Review the copied code and package.json files"
echo "3. Update import paths in the applications"
echo "4. Test each application individually" 