# Docker Setup Guide

This guide provides complete instructions for running the Historical Document Archive System using Docker and Docker Compose.

## 📋 Prerequisites

- **Docker** (v20.10+)
- **Docker Compose** (v2.0+)
- **Git** (for cloning the repository)
- At least **4GB RAM** available for Docker
- At least **10GB** free disk space

### Installation Links

- [Docker Desktop](https://www.docker.com/products/docker-desktop) (Windows/Mac)
- [Docker Engine](https://docs.docker.com/engine/install/) (Linux)

## 🚀 Quick Start

### 1. Clone and Navigate

```bash
git clone <your-repository-url>
cd graduation-project
```

### 2. Start Development Environment

```bash
# Start all services in development mode
docker-compose up -d

# View logs (optional)
docker-compose logs -f
```

### 3. Initialize Database

```bash
# Generate Prisma client and push schema
docker-compose exec server npx prisma generate
docker-compose exec server npx prisma db push
```

### 4. Access Services

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Database**: localhost:5432 (postgres/8663)

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   React Client  │    │  Node.js Server  │    │   PostgreSQL     │
│   (Port 5173)   │◄──►│   (Port 5000)    │◄──►│   (Port 5432)    │
│   Vite Dev      │    │   TypeScript     │    │   Database       │
└─────────────────┘    └──────────────────┘    └──────────────────┘
```

## 📁 Project Structure

```
graduation-project/
├── client/                 # React frontend
│   ├── Dockerfile         # Client container definition
│   ├── .dockerignore      # Files to exclude from build
│   └── ...
├── server/                 # Node.js backend
│   ├── Dockerfile         # Server container definition
│   ├── .dockerignore      # Files to exclude from build
│   └── ...
├── nginx/                  # Production reverse proxy
│   ├── nginx.conf         # Main nginx configuration
│   └── conf.d/            # Site-specific configs
├── docker-compose.yml      # Development setup
├── docker-compose.prod.yml # Production setup
├── docker-compose.override.yml # Local overrides
├── .dockerignore          # Root-level exclusions
├── DOCKER_GUIDE.md        # This guide
└── DATABASE_SETUP.md      # Database specific guide
```

## 🛠️ Development Workflow

### Starting Services

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d database
docker-compose up -d server
docker-compose up -d client

# Start with logs visible
docker-compose up
```

### Monitoring Services

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f [service_name]

# View resource usage
docker stats
```

### Development Commands

```bash
# Install new packages
docker-compose exec server npm install package-name
docker-compose exec client npm install package-name

# Run database operations
docker-compose exec server npx prisma generate
docker-compose exec server npx prisma db push
docker-compose exec server npx prisma migrate dev

# Run server manually (alternative to npm run dev)
docker-compose exec server ts-node ./index.ts

# Access service shell
docker-compose exec server sh
docker-compose exec client sh
docker-compose exec database psql -U postgres -d mydb
```

### Hot Reloading

Both client and server support hot reloading in development mode:

- **Client**: Vite automatically reloads on file changes
- **Server**: ts-node restarts on TypeScript file changes
- **Database**: Prisma client regenerates on schema changes

## 🏭 Production Deployment

### Build Production Images

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production environment
docker-compose -f docker-compose.prod.yml up -d
```

### Production Architecture

```
Internet → Nginx Proxy → React App (Static Files)
              ↓
         Node.js API → PostgreSQL Database
```

### Production Features

- **Nginx Reverse Proxy** - Load balancing and SSL termination
- **Optimized Images** - Multi-stage builds for smaller containers
- **Security Headers** - Enhanced security configuration
- **Gzip Compression** - Reduced bandwidth usage
- **Health Checks** - Automatic service monitoring
- **Rate Limiting** - Protection against abuse

## 🔧 Configuration

### Environment Variables

#### Server (`/server/.env`)
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:8663@database:5432/mydb
GOOGLE_CREDENTIALS_PATH=./src/config/service-account-key.json
GOOGLE_DRIVE_FOLDER_ID=your_folder_id
GROQ_API_KEY=your_groq_api_key
JWT_SECRET=your-jwt-secret
```

#### Client (Built into Docker Compose)
```env
VITE_API_URL=http://localhost:5000/api
```

### Docker Compose Override

Create `docker-compose.override.yml` for local customizations:

```yaml
version: '3.8'
services:
  server:
    ports:
      - "5001:5000"  # Different port
    environment:
      - DEBUG=true
```

## 📊 Monitoring and Debugging

### Health Checks

All services include health checks:

```bash
# Check service health
docker-compose ps

# Manual health check
curl http://localhost:5000/health
curl http://localhost:5173
```

### Log Analysis

```bash
# View all logs
docker-compose logs

# Follow specific service logs
docker-compose logs -f server

# Filter logs by time
docker-compose logs --since 30m server

# Save logs to file
docker-compose logs > app-logs.txt
```

### Performance Monitoring

```bash
# Container resource usage
docker stats

# Service-specific metrics
docker-compose exec server npm run health-check
```

## 🗄️ Database Management

### Backup and Restore

```bash
# Create backup
docker-compose exec database pg_dump -U postgres mydb > backup-$(date +%Y%m%d).sql

# Restore from backup
docker-compose exec -T database psql -U postgres mydb < backup-20231201.sql
```

### Database Tools

```bash
# Prisma Studio (Database GUI)
docker-compose exec server npx prisma studio

# Direct SQL access
docker-compose exec database psql -U postgres -d mydb
```

## 🔧 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find what's using the port
lsof -i :5432
lsof -i :5000
lsof -i :5173

# Kill the process or change ports in docker-compose.yml
```

#### Database Connection Issues
```bash
# Check database is running
docker-compose ps database

# Test database connection
docker-compose exec server npx prisma db push
```

#### Build Failures
```bash
# Clean build
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

#### Volume Issues
```bash
# Reset volumes
docker-compose down -v
docker volume prune
docker-compose up -d
```

### Service-Specific Debugging

#### Server Issues
```bash
# Check server logs
docker-compose logs server

# Access server container
docker-compose exec server sh

# Test API endpoints
curl http://localhost:5000/health
```

#### Client Issues
```bash
# Check client logs
docker-compose logs client

# Rebuild client
docker-compose build client
docker-compose up -d client
```

## 🧹 Cleanup

### Regular Cleanup

```bash
# Stop services
docker-compose down

# Remove unused containers, networks, images
docker system prune

# Remove volumes (⚠️ deletes data)
docker-compose down -v
```

### Complete Reset

```bash
# Nuclear option - removes everything
docker-compose down -v --rmi all
docker system prune -a --volumes
```

## 🔐 Security Considerations

### Development
- Default passwords are used (change for production)
- Services are exposed on localhost
- Debug mode enabled

### Production
- Use strong passwords and secrets
- Configure SSL/TLS certificates
- Set up proper firewall rules
- Regular security updates
- Monitor for vulnerabilities

### Best Practices
- Don't commit `.env` files
- Use Docker secrets for sensitive data
- Regular dependency updates
- Scan images for vulnerabilities

## 📈 Performance Optimization

### Development
- Use bind mounts for hot reloading
- Exclude `node_modules` from bind mounts
- Adjust resource limits if needed

### Production
- Multi-stage builds for smaller images
- Use production optimizations
- Configure nginx caching
- Set up monitoring and alerting

## 🆘 Getting Help

### Useful Commands
```bash
# Docker system information
docker info
docker version

# Service inspection
docker-compose config
docker inspect <container_name>

# Network debugging
docker network ls
docker network inspect wwii_scanner_network
```

### Log Locations
- **Application logs**: `./server/logs/`
- **Nginx logs**: `./nginx/logs/`
- **Container logs**: `docker-compose logs`

### Support Resources
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Node.js Docker Hub](https://hub.docker.com/_/node)

---

**Ready to get started?** Run `docker-compose up -d` and visit http://localhost:5173! 🚀 