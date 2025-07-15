# Use official Node.js runtime as the base image
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Development stage
FROM base AS development

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# # Build stage
# FROM base AS build

# # Copy package files
# COPY package*.json ./

# # Install dependencies
# RUN npm ci

# # Copy source code
# COPY . .

# # Build the application
# RUN npm run build

# # Production stage
# FROM nginx:alpine AS production

# # Copy custom nginx config
# COPY <<EOF /etc/nginx/conf.d/default.conf
# server {
#     listen 80;
#     server_name localhost;
#     root /usr/share/nginx/html;
#     index index.html index.htm;

#     # Handle client-side routing
#     location / {
#         try_files \$uri \$uri/ /index.html;
#     }

#     # Handle API proxy to backend
#     location /api {
#         proxy_pass http://server:5000;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade \$http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host \$host;
#         proxy_set_header X-Real-IP \$remote_addr;
#         proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto \$scheme;
#         proxy_cache_bypass \$http_upgrade;
#     }

#     # Enable gzip compression
#     gzip on;
#     gzip_vary on;
#     gzip_min_length 1024;
#     gzip_proxied expired no-cache no-store private must-revalidate auth;
#     gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

#     # Security headers
#     add_header X-Frame-Options "SAMEORIGIN" always;
#     add_header X-XSS-Protection "1; mode=block" always;
#     add_header X-Content-Type-Options "nosniff" always;
#     add_header Referrer-Policy "no-referrer-when-downgrade" always;
#     add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
# }
# EOF

# # Copy built application from build stage
# COPY --from=build /app/build/client /usr/share/nginx/html

# # Create non-root user
# RUN addgroup -g 1001 -S nginx
# RUN adduser -S nginx -u 1001

# # Set proper permissions
# RUN chown -R nginx:nginx /usr/share/nginx/html
# RUN chown -R nginx:nginx /var/cache/nginx
# RUN chown -R nginx:nginx /var/log/nginx
# RUN chown -R nginx:nginx /etc/nginx/conf.d
# RUN touch /var/run/nginx.pid
# RUN chown -R nginx:nginx /var/run/nginx.pid

# USER nginx

# # Expose port
# EXPOSE 80

# # Health check
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#   CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

# # Start nginx
# CMD ["nginx", "-g", "daemon off;"] 