# Stage 1: Build the React application
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Install dependencies only when needed
COPY package*.json ./
RUN npm ci --legacy-peer-deps --prefer-offline && \
    npm cache clean --force

# Copy only source files needed for build
COPY public ./public
COPY src ./src

# Set environment variables for build
ENV REACT_APP_API_URL=https://patient-registration-7djk.onrender.com/v1/api
ENV REACT_APP_ENV=production
ENV REACT_APP_TITLE=Patient Registration
ENV REACT_APP_VERSION=$npm_package_version
# Add any other environment variables your application needs

# Build the React app with production settings
RUN npm run build

# Stage 2: Production image using NGINX
FROM nginx:alpine

# Remove default nginx config
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /usr/src/app/build /usr/share/nginx/html

# Copy custom nginx configuration
COPY usr/src/app/nginx.conf /etc/nginx/conf.d

# Set environment variables for runtime
ENV REACT_APP_API_URL=https://patient-registration-7djk.onrender.com/v1/api
ENV REACT_APP_ENV=production
ENV REACT_APP_TITLE=Patient Registration
ENV REACT_APP_VERSION=$npm_package_version
# Add any other environment variables your application needs

# Expose port and set health check
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD wget --no-verbose --spider http://localhost:80 || exit 1

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
