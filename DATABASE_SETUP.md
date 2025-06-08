# Database Setup Guide

This guide explains how to set up and manage the PostgreSQL database in your Docker environment.

## Quick Start

The database is automatically set up when you run Docker Compose. No manual setup is required for basic usage.

```bash
# Start all services including database
docker-compose up -d

# Check database status
docker-compose ps database
```

## Database Configuration

### Environment Variables

The database uses these environment variables (configured in `docker-compose.yml`):

```yaml
POSTGRES_DB: mydb
POSTGRES_USER: postgres  
POSTGRES_PASSWORD: 8663
```

### Connection Details

- **Host**: `localhost` (from host machine) or `database` (from other containers)
- **Port**: `5432`
- **Database**: `mydb`
- **Username**: `postgres`
- **Password**: `8663`

### Connection Strings

**From host machine:**
```
DATABASE_URL=postgresql://postgres:8663@localhost:5432/mydb
```

**From other containers:**
```
DATABASE_URL=postgresql://postgres:8663@database:5432/mydb
```

## Database Management

### Running Prisma Commands

Execute Prisma commands from within the server container:

```bash
# Generate Prisma client
docker-compose exec server npx prisma generate

# Push schema changes to database
docker-compose exec server npx prisma db push

# Run migrations
docker-compose exec server npx prisma migrate dev

# Open Prisma Studio
docker-compose exec server npx prisma studio
```

### Direct Database Access

Connect to the PostgreSQL database directly:

```bash
# Connect via Docker
docker-compose exec database psql -U postgres -d mydb

# Connect from host (requires PostgreSQL client)
psql -h localhost -p 5432 -U postgres -d mydb
```

### Common SQL Commands

```sql
-- List all tables
\dt

-- Describe a table
\d table_name

-- List all databases
\l

-- Switch database
\c database_name

-- Exit
\q
```

## Data Persistence

Database data is persisted in a Docker volume:

```bash
# View volume information
docker volume inspect wwii_scanner_postgres_data

# Backup database
docker-compose exec database pg_dump -U postgres mydb > backup.sql

# Restore database
docker-compose exec -T database psql -U postgres mydb < backup.sql
```

## Troubleshooting

### Database Won't Start

1. Check if port 5432 is already in use:
   ```bash
   lsof -i :5432
   ```

2. Remove existing containers and volumes:
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

### Connection Issues

1. Verify the database is running:
   ```bash
   docker-compose ps database
   ```

2. Check database logs:
   ```bash
   docker-compose logs database
   ```

3. Test connection:
   ```bash
   docker-compose exec server npm run db:generate
   ```

### Reset Database

To completely reset the database:

```bash
# Stop services
docker-compose down

# Remove database volume
docker volume rm wwii_scanner_postgres_data

# Start services (this will recreate the database)
docker-compose up -d
```

## Production Considerations

For production deployment:

1. **Change default credentials** - Update the database password
2. **Use secrets management** - Store credentials securely
3. **Enable SSL** - Configure SSL connections
4. **Regular backups** - Set up automated backup schedules
5. **Monitoring** - Add database monitoring and alerting

### Production Environment Variables

```yaml
# Use strong passwords
POSTGRES_PASSWORD: your-strong-password-here

# Enable SSL
POSTGRES_SSLMODE: require

# Connection pooling
DATABASE_URL: postgresql://postgres:password@database:5432/mydb?sslmode=require&connection_limit=20
```

## Migration Workflow

### Development
```bash
# Make schema changes in schema.prisma
# Generate migration
docker-compose exec server npx prisma migrate dev --name your_migration_name

# Apply changes
docker-compose exec server npx prisma generate
```

### Production
```bash
# Deploy migrations
docker-compose exec server npx prisma migrate deploy

# Generate client
docker-compose exec server npx prisma generate
```

## Performance Tuning

For better performance in production:

1. **Increase shared_buffers** in PostgreSQL config
2. **Configure connection pooling** (consider PgBouncer)
3. **Monitor query performance** using EXPLAIN
4. **Set up proper indexes** for frequently queried columns
5. **Regular VACUUM and ANALYZE** operations

```sql
-- Example performance queries
EXPLAIN ANALYZE SELECT * FROM your_table WHERE column = 'value';
SELECT * FROM pg_stat_activity;
``` 