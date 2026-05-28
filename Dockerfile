# Dockerfile for api-server

# Stage 1: Base - A slim Node.js image with pnpm installed globally.
FROM node:20-slim AS base
WORKDIR /usr/src/app
RUN npm install -g pnpm@9

# Stage 2: Dependencies - Install only PRODUCTION dependencies for a lean final image.
# This stage is separate so we can cache the node_modules layer effectively.
FROM base AS deps
# Copy only the package manager and dependency definition files.
# The glob patterns (*) handle optional files like .npmrc.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* .npmrc* ./
# Create the directory structure for pnpm workspaces and copy their package.json files.
COPY lib/db/package.json ./lib/db/
COPY artifacts/riisemap/package.json ./artifacts/riisemap/
COPY artifacts/api-server/package.json ./artifacts/api-server/
# Install only production dependencies. The --prod flag is crucial.
RUN pnpm install --frozen-lockfile --prod

# Stage 3: Build - Build the TypeScript source into JavaScript.
# This stage uses a separate node_modules layer with dev dependencies.
FROM base AS build
# Copy the entire repository source code.
COPY . .
# Install ALL dependencies, including dev dependencies needed for building (like TypeScript and esbuild).
RUN pnpm install --frozen-lockfile
# Run the build script for the api-server workspace.
RUN pnpm --filter @workspace/api-server build

# Stage 4: Final - Assemble the lean production image.
FROM base AS final
ENV NODE_ENV=production
WORKDIR /usr/src/app
# Copy the compiled JavaScript from the 'build' stage.
COPY --from=build /usr/src/app/artifacts/api-server/dist ./dist
# Copy the lean, production-only node_modules from the 'deps' stage.
COPY --from=deps /usr/src/app/node_modules ./node_modules
# The api-server listens on port 3001.
EXPOSE 3001
# The command to start the production server.
CMD ["node", "dist/index.js"]