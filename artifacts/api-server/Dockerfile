# Use official Node.js 20 image
FROM node:20-slim AS base

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9

# Copy workspace configuration
COPY package.json pnpm-workspace.yaml .npmrc ./
COPY lib/db/package.json ./lib/db/
COPY artifacts/api-server/package.json ./artifacts/api-server/

# Install dependencies
FROM base AS deps
WORKDIR /app
RUN pnpm install --frozen-lockfile

# Build the application
FROM deps AS builder
WORKDIR /app
COPY . .
RUN pnpm --filter @workspace/api-server build

# Production stage
FROM base AS production
WORKDIR /app

# Copy only necessary files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/artifacts/api-server/dist ./artifacts/api-server/dist
COPY --from=builder /app/lib/db ./lib/db
COPY package.json pnpm-workspace.yaml .npmrc ./

# Expose port
EXPOSE 3000

# Start the server
CMD ["pnpm", "--filter", "@workspace/api-server", "start"]