#!/bin/bash

set -e # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Error handling
trap 'last_command=$current_command; current_command=$BASH_COMMAND' DEBUG
trap 'echo -e "${RED}\"${last_command}\" command failed with exit code $?.${NC}"' EXIT

# Logging
log_file="/tmp/recraftor-setup-$$.log"
exec 1> >(tee -a "$log_file")
exec 2> >(tee -a "$log_file" >&2)

echo -e "${GREEN}Starting Recraftor setup for Replit...${NC}"
echo "Full log will be available at: $log_file"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check minimum version requirements
check_version() {
    local cmd=$1
    local version=$2
    local current_version

    case $cmd in
        "node")
            current_version=$(node -v | cut -d'v' -f2)
            ;;
        "pnpm")
            current_version=$(pnpm -v)
            ;;
        *)
            echo -e "${RED}Unknown command for version check: $cmd${NC}"
            return 1
            ;;
    esac

    if [ "$(printf '%s\n' "$version" "$current_version" | sort -V | head -n1)" != "$version" ]; then
        echo -e "${RED}$cmd version $current_version is less than required version $version${NC}"
        return 1
    fi
}

# Cleanup function
cleanup() {
    if [ $? -ne 0 ]; then
        echo -e "${RED}Setup failed. Cleaning up...${NC}"
        # Remove any partial installations
        [ -d "node_modules" ] && rm -rf node_modules
        [ -d ".pnpm-store" ] && rm -rf .pnpm-store
        [ -d "apps/portal/node_modules" ] && rm -rf apps/portal/node_modules
        [ -d "apps/recraftor/node_modules" ] && rm -rf apps/recraftor/node_modules
        echo -e "${YELLOW}Check the log file for details: $log_file${NC}"
    fi
    trap - EXIT
    exit $?
}

trap cleanup EXIT

# Verify Replit environment
verify_replit_env() {
    if [ -z "$REPL_ID" ] || [ -z "$REPL_SLUG" ]; then
        echo -e "${RED}This script must be run in a Replit environment${NC}"
        exit 1
    fi
}

# Create or update replit.nix
setup_replit_nix() {
    echo -e "${YELLOW}Setting up replit.nix...${NC}"
    cat > replit.nix << EOL || {
        echo -e "${RED}Failed to create replit.nix${NC}"
        exit 1
    }
{pkgs}: {
  deps = [
    pkgs.nodejs-18_x
    pkgs.nodePackages.pnpm
    pkgs.openssl_1_1
    pkgs.pkg-config
    pkgs.prisma
    pkgs.sqlite
  ];
}
EOL
}

# Validate environment files
validate_env() {
    local env_file=$1
    local required_vars=("DATABASE_URL" "NEXTAUTH_URL" "NEXTAUTH_SECRET")
    
    if [ ! -f "$env_file" ]; then
        echo -e "${RED}Environment file $env_file not found${NC}"
        return 1
    fi

    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" "$env_file"; then
            echo -e "${RED}Missing required environment variable: $var in $env_file${NC}"
            return 1
        fi
    done
}

# Setup project
setup_project() {
    echo -e "${YELLOW}Installing project dependencies...${NC}"
    pnpm install || {
        echo -e "${RED}Failed to install project dependencies${NC}"
        exit 1
    }

    echo -e "${YELLOW}Setting up environment files...${NC}"
    if [ ! -f apps/portal/.env ]; then
        cp apps/portal/.env.example apps/portal/.env || {
            echo -e "${RED}Failed to create portal environment file${NC}"
            exit 1
        }
        # Update DATABASE_URL for Replit
        sed -i "s#file:./dev.db#file:/home/runner/${REPL_SLUG}/prisma/dev.db#g" apps/portal/.env || {
            echo -e "${RED}Failed to update DATABASE_URL${NC}"
            exit 1
        }
    fi
    if [ ! -f apps/recraftor/.env ]; then
        cp apps/recraftor/.env.example apps/recraftor/.env || {
            echo -e "${RED}Failed to create recraftor environment file${NC}"
            exit 1
        }
    fi

    # Validate environment files
    validate_env "apps/portal/.env"
    validate_env "apps/recraftor/.env"

    echo -e "${YELLOW}Generating Prisma client...${NC}"
    cd apps/portal && npx prisma generate || {
        echo -e "${RED}Failed to generate Prisma client${NC}"
        exit 1
    }
    
    echo -e "${YELLOW}Building packages...${NC}"
    pnpm build || {
        echo -e "${RED}Failed to build packages${NC}"
        exit 1
    }
}

# Create or update .replit configuration
setup_replit_config() {
    echo -e "${YELLOW}Setting up .replit configuration...${NC}"
    cat > .replit << EOL || {
        echo -e "${RED}Failed to create .replit configuration${NC}"
        exit 1
    }
run = "cd recraftor-monorepo && pnpm dev"
hidden = [".config", "package-lock.json"]

[env]
PATH = "/home/runner/$REPL_SLUG/.config/npm/node_global/bin:/home/runner/$REPL_SLUG/node_modules/.bin:\${PATH}"
npm_config_prefix = "/home/runner/$REPL_SLUG/.config/npm/node_global"

[nix]
channel = "stable-22_11"

[packager]
language = "nodejs"

[packager.features]
packageSearch = true
guessImports = true

[languages.javascript]
pattern = "**/{*.js,*.jsx,*.ts,*.tsx}"
syntax = "javascript"

[languages.javascript.languageServer]
start = [ "typescript-language-server", "--stdio" ]
EOL
}

# Verify Nix packages
verify_nix_packages() {
    echo -e "${YELLOW}Verifying Nix packages...${NC}"
    
    # Check Node.js
    if ! check_version "node" "18.0.0"; then
        echo -e "${RED}Node.js version must be 18.x or higher${NC}"
        exit 1
    fi

    # Check pnpm
    if ! check_version "pnpm" "8.0.0"; then
        echo -e "${RED}pnpm version must be 8.x or higher${NC}"
        exit 1
    fi

    # Check OpenSSL
    if ! command_exists openssl; then
        echo -e "${RED}OpenSSL is not installed${NC}"
        exit 1
    fi
}

# Main installation flow
main() {
    echo -e "${YELLOW}Setting up Replit environment...${NC}"
    verify_replit_env
    setup_replit_nix
    setup_replit_config
    verify_nix_packages
    setup_project
    
    echo -e "${GREEN}Setup completed successfully!${NC}"
    echo -e "${YELLOW}Click the Run button to start the development servers${NC}"
}

# Run main installation
main