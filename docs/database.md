# Database Setup Guide

This guide covers the setup and management of the Prisma database used in the Recraftor monorepo.

## Overview

The project uses Prisma with SQLite for development and can be configured for PostgreSQL in production. The database primarily handles:
- User authentication
- Token management
- Transaction history
- Style storage

## Quick Start

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm prisma generate

# Create database and run migrations
pnpm prisma migrate dev

# Open Prisma Studio
pnpm prisma studio
```

## Database Setup

### 1. Environment Configuration

Create a `.env` file in the portal app:

```env
# Development (SQLite)
DATABASE_URL="file:./dev.db"

# Production (PostgreSQL example)
# DATABASE_URL="postgresql://user:password@localhost:5432/recraftor?schema=public"
```

### 2. Initialize Database

```bash
# Create a new migration
pnpm prisma migrate dev --name init

# Apply migrations without modifying the schema
pnpm prisma migrate deploy

# Reset database (caution: deletes all data)
pnpm prisma migrate reset
```

## Schema Overview

### User Management
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  password      String
  image         String?
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  accounts      Account[]
  sessions      Session[]
  tokenBalance  TokenBalance?
  tokenHistory  TokenTransaction[]
}
```

### Token System
```prisma
model TokenBalance {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  amount        Int      @default(0)
  plan          String   @default("none")
  renewalDate   DateTime
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model TokenTransaction {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  amount        Int
  operation     String
  description   String?
  createdAt     DateTime @default(now())
  metadata      String?
}
```

## Common Operations

### 1. Database Management
```bash
# View database in Prisma Studio
pnpm prisma studio

# Format schema file
pnpm prisma format

# Validate schema
pnpm prisma validate
```

### 2. Migration Management
```bash
# Create a new migration
pnpm prisma migrate dev --name <migration_name>

# View migration history
pnpm prisma migrate status

# Apply pending migrations
pnpm prisma migrate deploy
```

### 3. Client Generation
```bash
# Generate Prisma Client
pnpm prisma generate

# Generate TypeScript types
pnpm prisma generate --generator typegraphql
```

## Development Workflow

1. **Schema Changes**
   ```bash
   # 1. Edit schema.prisma
   # 2. Create migration
   pnpm prisma migrate dev --name <descriptive_name>
   # 3. Generate client
   pnpm prisma generate
   ```

2. **Data Seeding**
   ```bash
   # 1. Create seed file
   # 2. Run seed command
   pnpm prisma db seed
   ```

3. **Testing**
   ```bash
   # Create test database
   pnpm prisma migrate deploy --preview-feature

   # Run tests
   pnpm test
   ```

## Production Deployment

1. **Database Setup**
   ```bash
   # Set production DATABASE_URL in .env

   # Apply migrations
   pnpm prisma migrate deploy
   ```

2. **Monitoring**
   ```bash
   # Check migration status
   pnpm prisma migrate status

   # Validate database
   pnpm prisma validate
   ```

## Troubleshooting

### Common Issues

1. **Migration Conflicts**
   ```bash
   # Reset database (development only)
   pnpm prisma migrate reset

   # Force apply migrations
   pnpm prisma migrate deploy --force
   ```

2. **Schema Drift**
   ```bash
   # Check for drift
   pnpm prisma migrate diff

   # Reset and apply migrations
   pnpm prisma migrate reset
   pnpm prisma migrate deploy
   ```

3. **Client Generation Issues**
   ```bash
   # Clear generated files
   rm -rf node_modules/.prisma

   # Regenerate client
   pnpm prisma generate
   ```

### Data Recovery

1. **Backup Database**
   ```bash
   # SQLite
   cp prisma/dev.db prisma/backup.db

   # PostgreSQL
   pg_dump -U user -d database > backup.sql
   ```

2. **Restore Database**
   ```bash
   # SQLite
   cp prisma/backup.db prisma/dev.db

   # PostgreSQL
   psql -U user -d database < backup.sql
   ```

## Best Practices

1. **Schema Management**
   - Use descriptive model and field names
   - Add appropriate indexes for performance
   - Document relations with comments
   - Use appropriate field types

2. **Migration Strategy**
   - Create atomic migrations
   - Use descriptive migration names
   - Test migrations on sample data
   - Back up data before migrations

3. **Performance**
   - Index frequently queried fields
   - Use appropriate relation types
   - Monitor query performance
   - Implement connection pooling

## Security Considerations

1. **Database Access**
   - Use environment variables for credentials
   - Implement connection pooling
   - Set appropriate user permissions
   - Enable SSL for remote connections

2. **Data Protection**
   - Hash sensitive data
   - Implement row-level security
   - Regular security audits
   - Backup strategy

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Migration Guide](https://www.prisma.io/docs/guides/deployment/deploy-database-changes-with-prisma-migrate)
- [Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization) 