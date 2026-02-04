# ============================================
# Golden Raspberry Awards API - Dockerfile
# Multi-stage build for optimized production image
# ============================================

# Stage 1: Build
FROM node:22-alpine AS builder

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build TypeScript
RUN pnpm build

# ============================================
# Stage 2: Production
FROM node:22-alpine AS production

# Install build dependencies for better-sqlite3 native compilation
RUN apk add --no-cache python3 make g++

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install production dependencies and force rebuild of native modules
RUN pnpm install --prod --frozen-lockfile && \
    cd /app/node_modules/.pnpm/better-sqlite3@*/node_modules/better-sqlite3 && \
    npm run build-release

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Copy data directory with CSV file
COPY data ./data

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Run the application
CMD ["node", "dist/server.js"]

# ============================================
# Stage 3: Test
FROM node:22-alpine AS test

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install all dependencies and force rebuild
RUN pnpm install --frozen-lockfile && \
    cd /app/node_modules/.pnpm/better-sqlite3@*/node_modules/better-sqlite3 && \
    npm run build-release

# Copy source code and tests
COPY . .

# Set environment variables
ENV NODE_ENV=test

# Run tests
CMD ["pnpm", "test"]
