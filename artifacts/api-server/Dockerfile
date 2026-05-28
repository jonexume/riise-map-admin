# Dockerfile for api-server

# 1. Base Stage: Install pnpm
FROM node:20-slim AS base
WORKDIR /usr/src/app
RUN npm install -g pnpm@9

# 2. Dependencies Stage: Install all workspace dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* .npmrc* ./
COPY lib/db/package.json ./lib/db/
COPY artifacts/riisemap/package.json ./artifacts/riisemap/
COPY artifacts/api-server/package.json ./artifacts/api-server/
RUN pnpm install --frozen-lockfile --prod

# 3. Build Stage: Copy all source and build the api-server
FROM base AS build
COPY . .
# First, install ALL dependencies (including dev)
RUN pnpm install --frozen-lockfile
# Then, build the specific workspace package
RUN pnpm --filter @workspace/api-server build

# 4. Production Stage: Create the final, lean image
FROM base AS final
ENV NODE_ENV=production
# Copy only the built artifacts and production node_modules
COPY --from=build /usr/src/app/artifacts/api-server/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
# Expose the port the server will run on
EXPOSE 3001
# Define the command to run the built server
CMD ["node", "dist/index.js"]