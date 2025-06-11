# Stage 1: Build the React application
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or npm-shrinkwrap.json)
COPY package*.json ./

# Install all dependencies, including devDependencies, for building
RUN npm install

# Copy the rest of the application source code
COPY . .

# Run the build script
RUN npm run build

# Stage 2: Production environment
FROM node:18-alpine AS production

WORKDIR /usr/src/app

# Copy package.json and package-lock.json for installing production dependencies
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy the built application from the builder stage
COPY --from=builder /usr/src/app/build ./build

# Copy the server script
COPY server.js .

# Expose the port the app runs on
EXPOSE 3000

# Set the environment variable for the port
ENV PORT 3000

# Command to run the application
CMD ["node", "server.js"]
