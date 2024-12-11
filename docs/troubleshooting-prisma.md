# Prisma Troubleshooting Guide

## OpenSSL Issues

### The Problem

When encountering the error:
```
prisma:warn Prisma failed to detect the libssl/openssl version to use, and may not work as expected. Defaulting to "openssl-1.1.x".
Please manually install OpenSSL and try installing Prisma again.
```

This occurs because:
1. Prisma requires OpenSSL to establish secure connections
2. The system's OpenSSL version is either:
   - Not installed
   - Not properly linked
   - Incompatible version
3. Prisma cannot automatically detect the correct OpenSSL version

### Solutions

#### Ubuntu/Debian
```bash
# Install OpenSSL 1.1
sudo apt-get update
sudo apt-get install openssl libssl1.1

# If libssl1.1 is not available in default repos
wget http://nz2.archive.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.1f-1ubuntu2_amd64.deb
sudo dpkg -i libssl1.1_1.1.1f-1ubuntu2_amd64.deb

# Verify installation
openssl version
```

#### macOS
```bash
# Using Homebrew
brew install openssl@1.1

# Link OpenSSL
brew link openssl@1.1 --force

# Add to PATH
echo 'export PATH="/usr/local/opt/openssl@1.1/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

#### Windows
```powershell
# Using Chocolatey
choco install openssl

# Using Scoop
scoop install openssl

# Verify installation
openssl version
```

### Project-Specific Solutions

1. **Specify OpenSSL Version**
   ```env
   # In .env file
   PRISMA_QUERY_ENGINE_LIBRARY="libquery_engine.so.node"
   PRISMA_ENGINE_PROTOCOL="openssl-1.1.x"
   ```

2. **Force Binary Download**
   ```bash
   # Clear Prisma cache
   rm -rf node_modules/.prisma

   # Reinstall dependencies
   pnpm install

   # Generate Prisma client with specific binary
   PRISMA_ENGINES_MIRROR=https://binaries.prisma.sh pnpm prisma generate
   ```

3. **Docker Solution**
   ```dockerfile
   FROM node:18-slim

   # Install OpenSSL 1.1
   RUN apt-get update && apt-get install -y openssl libssl1.1

   # Continue with your Dockerfile...
   ```

### Prevention Strategies

1. **Development Environment**
   - Document OpenSSL requirements
   - Include version check scripts
   - Maintain consistent versions across team

2. **CI/CD Pipeline**
   ```yaml
   # GitHub Actions example
   steps:
     - name: Install OpenSSL
       run: |
         sudo apt-get update
         sudo apt-get install -y openssl libssl1.1

     - name: Setup Node
       uses: actions/setup-node@v3
       with:
         node-version: '18'

     - name: Install dependencies
       run: pnpm install
   ```

3. **Production Deployment**
   - Verify OpenSSL installation
   - Document required versions
   - Include in deployment checklist

### Verification Steps

1. **Check OpenSSL Version**
   ```bash
   openssl version
   ```

2. **Verify Prisma Engine**
   ```bash
   # Check binary location
   ls -la node_modules/.prisma/client

   # Verify engine compatibility
   pnpm prisma -v
   ```

3. **Test Database Connection**
   ```bash
   pnpm prisma db pull
   ```

### Common Issues

1. **Binary Download Failure**
   ```bash
   # Solution: Use alternative mirror
   PRISMA_ENGINES_MIRROR=https://binaries.prisma.sh pnpm prisma generate
   ```

2. **Version Mismatch**
   ```bash
   # Solution: Install specific version
   brew install openssl@1.1
   ```

3. **Path Issues**
   ```bash
   # Solution: Add to PATH
   export PATH="/usr/local/opt/openssl@1.1/bin:$PATH"
   ```

### Environment-Specific Notes

#### Development
- Use consistent OpenSSL versions
- Document setup requirements
- Include version check scripts

#### CI/CD
- Install required OpenSSL version
- Cache dependencies
- Verify installation

#### Production
- Use Docker with correct OpenSSL
- Document deployment requirements
- Include health checks

### Additional Resources

- [Prisma Engine Configuration](https://www.prisma.io/docs/concepts/components/prisma-engines)
- [OpenSSL Documentation](https://www.openssl.org/docs/)
- [Docker OpenSSL Guide](https://docs.docker.com/engine/security/trust/trust_key_mng/)

### Monitoring and Maintenance

1. **Version Tracking**
   - Keep track of OpenSSL versions
   - Monitor for security updates
   - Plan upgrade strategy

2. **Health Checks**
   ```bash
   # Add to your health check script
   if ! openssl version | grep -q "1.1"; then
     echo "OpenSSL 1.1 not found"
     exit 1
   fi
   ```

3. **Update Strategy**
   - Plan regular updates
   - Test compatibility
   - Document upgrade process