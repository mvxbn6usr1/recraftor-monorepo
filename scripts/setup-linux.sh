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

echo -e "${GREEN}Starting Recraftor setup for Linux...${NC}"
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

# Function to install system dependencies based on distribution
install_system_dependencies() {
    if command_exists apt-get; then
        echo -e "${YELLOW}Detected Debian/Ubuntu system${NC}"
        sudo apt-get update || { echo -e "${RED}Failed to update package list${NC}"; exit 1; }
        sudo apt-get install -y curl git openssl libssl1.1 pkg-config sqlite3 build-essential python3 || {
            echo -e "${RED}Failed to install system dependencies${NC}"
            exit 1
        }
        
        # Add OpenSSL 1.1 repository if needed (for Ubuntu 22.04+)
        if ! dpkg -l | grep -q libssl1.1; then
            echo -e "${YELLOW}Adding OpenSSL 1.1 repository...${NC}"
            echo "deb http://security.ubuntu.com/ubuntu focal-security main" | sudo tee /etc/apt/sources.list.d/focal-security.list
            sudo apt-get update || { echo -e "${RED}Failed to update package list${NC}"; exit 1; }
            sudo apt-get install -y libssl1.1 || {
                echo -e "${RED}Failed to install libssl1.1${NC}"
                exit 1
            }
        fi
    elif command_exists yum; then
        echo -e "${YELLOW}Detected RHEL/CentOS system${NC}"
        sudo yum update -y || { echo -e "${RED}Failed to update package list${NC}"; exit 1; }
        sudo yum install -y curl git openssl openssl-devel pkg-config sqlite gcc gcc-c++ make python3 || {
            echo -e "${RED}Failed to install system dependencies${NC}"
            exit 1
        }
    elif command_exists pacman; then
        echo -e "${YELLOW}Detected Arch Linux system${NC}"
        sudo pacman -Syu --noconfirm || { echo -e "${RED}Failed to update package list${NC}"; exit 1; }
        sudo pacman -S --noconfirm curl git openssl pkg-config sqlite base-devel python3 || {
            echo -e "${RED}Failed to install system dependencies${NC}"
            exit 1
        }
    else
        echo -e "${RED}Unsupported Linux distribution${NC}"
        echo "Please install the following packages manually:"
        echo "- curl"
        echo "- git"
        echo "- openssl"
        echo "- pkg-config"
        echo "- sqlite"
        echo "- build tools (gcc, make, etc.)"
        echo "- python3"
        exit 1
    fi
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