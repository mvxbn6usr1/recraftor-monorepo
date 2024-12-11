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

echo -e "${GREEN}Starting Recraftor setup for macOS...${NC}"
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
        "brew")
            current_version=$(brew --version | head -n1 | cut -d' ' -f2)
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

# Check macOS version
check_macos_version() {
    local min_version="10.15" # Catalina
    local current_version=$(sw_vers -productVersion)
    
    if [ "$(printf '%s\n' "$min_version" "$current_version" | sort -V | head -n1)" != "$min_version" ]; then
        echo -e "${RED}macOS version $current_version is not supported. Minimum required version is $min_version${NC}"
        exit 1
    fi
}

# Install Homebrew if not installed
install_homebrew() {
    if ! command_exists brew; then
        echo -e "${YELLOW}Installing Homebrew...${NC}"
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" || {
            echo -e "${RED}Failed to install Homebrew${NC}"
            exit 1
        }
        
        # Add Homebrew to PATH for Apple Silicon Macs
        if [[ $(uname -m) == 'arm64' ]]; then
            echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
            eval "$(/opt/homebrew/bin/brew shellenv)"
        fi
    else
        echo -e "${GREEN}Homebrew is already installed${NC}"
        brew update || {
            echo -e "${RED}Failed to update Homebrew${NC}"
            exit 1
        }
    fi

    # Check Homebrew version
    if ! check_version "brew" "3.0.0"; then
        echo -e "${RED}Please upgrade Homebrew to version 3.0.0 or higher${NC}"
        exit 1
    fi
}

# Install system dependencies
install_system_dependencies() {
    echo -e "${YELLOW}Installing system dependencies...${NC}"
    brew install openssl@1.1 pkg-config sqlite || {
        echo -e "${RED}Failed to install system dependencies${NC}"
        exit 1
    }

    # Link OpenSSL 1.1
    echo -e "${YELLOW}Linking OpenSSL 1.1...${NC}"
    brew link openssl@1.1 --force || {
        echo -e "${RED}Failed to link OpenSSL${NC}"
        exit 1
    }

    # Set OpenSSL environment variables
    local shell_rc="$HOME/.zshrc"
    [ -f "$HOME/.bashrc" ] && shell_rc="$HOME/.bashrc"

    {
        echo 'export PATH="/usr/local/opt/openssl@1.1/bin:$PATH"'
        echo 'export LDFLAGS="-L/usr/local/opt/openssl@1.1/lib"'
        echo 'export CPPFLAGS="-I/usr/local/opt/openssl@1.1/include"'
        echo 'export PKG_CONFIG_PATH="/usr/local/opt/openssl@1.1/lib/pkgconfig"'
    } >> "$shell_rc"
    source "$shell_rc"
}

# Install Node.js using nvm
install_node() {
    if ! command_exists node; then
        echo -e "${YELLOW}Installing Node.js...${NC}"
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash || {
            echo -e "${RED}Failed to install nvm${NC}"
            exit 1
        }
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        nvm install 18 || {
            echo -e "${RED}Failed to install Node.js${NC}"
            exit 1
        }
        nvm use 18
        
        # Verify installation
        if ! check_version "node" "18.0.0"; then
            echo -e "${RED}Node.js installation failed or version is incorrect${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}Node.js is already installed${NC}"
        # Check version
        if ! check_version "node" "18.0.0"; then
            echo -e "${RED}Node.js version must be 18.x or higher${NC}"
            exit 1
        fi
    fi
}

# Install pnpm
install_pnpm() {
    if ! command_exists pnpm; then
        echo -e "${YELLOW}Installing pnpm...${NC}"
        curl -fsSL https://get.pnpm.io/install.sh | sh - || {
            echo -e "${RED}Failed to install pnpm${NC}"
            exit 1
        }
        export PNPM_HOME="$HOME/.local/share/pnpm"
        export PATH="$PNPM_HOME:$PATH"
        
        # Verify installation
        if ! check_version "pnpm" "8.0.0"; then
            echo -e "${RED}pnpm installation failed or version is incorrect${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}pnpm is already installed${NC}"
        # Check version
        if ! check_version "pnpm" "8.0.0"; then
            echo -e "${RED}pnpm version must be 8.x or higher${NC}"
            exit 1
        fi
    fi
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

# Main installation flow
main() {
    echo -e "${YELLOW}Checking system requirements...${NC}"
    check_macos_version
    install_homebrew
    install_system_dependencies
    install_node
    install_pnpm
    setup_project
    
    echo -e "${GREEN}Setup completed successfully!${NC}"
    echo -e "${YELLOW}To start the development servers, run:${NC}"
    echo -e "cd recraftor-monorepo"
    echo -e "pnpm dev"
}

# Run main installation
main