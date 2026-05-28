# Dockerfile for api-server (Single-Stage for Cache Busting)

# Use a single stage to ensure all commands are run without caching issues.
FROM node:20-slim

# Install pnpm
WORKDIR /usr/src/app
RUN npm install -g pnpm@9

# Copy all source code into the image.
# The .dockerignore file will prevent node_modules from being copied.
COPY . .

# Install all dependencies (dev and prod) and build the application.
RUN pnpm install
RUN pnpm --filter @workspace/api-server build

# Set the final environment and command
ENV NODE_ENV=production
WORKDIR /usr/src/app

# The api-server listens on port 3001.
EXPOSE 3001

# The command to start the production server from the correct location.
CMD ["node", "artifacts/api-server/dist/index.js"]
