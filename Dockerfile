# ================================================
# AsmForge IDE - Production Dockerfile
# Multi-stage build for optimized image
# ================================================

# Stage 1: Build dependencies and compile
FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    libsecret-dev

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./
COPY browser-app/package*.json ./browser-app/
COPY packages/assembly-language-support/package*.json ./packages/assembly-language-support/
COPY packages/nova-ai/package*.json ./packages/nova-ai/
COPY packages/nova-core/package*.json ./packages/nova-core/
COPY packages/nova-debug/package*.json ./packages/nova-debug/
COPY packages/nova-assembly-lsp/package*.json ./packages/nova-assembly-lsp/
COPY packages/memory-viewer/package*.json ./packages/memory-viewer/
COPY packages/register-viewer/package*.json ./packages/register-viewer/
COPY packages/toolchain/package*.json ./packages/toolchain/

# Install dependencies
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# Build the application
RUN npm run build:all

# Stage 2: Production runtime
FROM node:20-alpine AS runtime

# Security: Create non-root user
RUN addgroup -g 1001 -S asmforge && \
    adduser -S asmforge -u 1001 -G asmforge

# Install runtime dependencies only
RUN apk add --no-cache \
    libsecret \
    git \
    curl

WORKDIR /app

# Copy built application from builder
COPY --from=builder --chown=asmforge:asmforge /app/browser-app/lib ./browser-app/lib
COPY --from=builder --chown=asmforge:asmforge /app/browser-app/src-gen ./browser-app/src-gen
COPY --from=builder --chown=asmforge:asmforge /app/browser-app/package*.json ./browser-app/
COPY --from=builder --chown=asmforge:asmforge /app/packages ./packages
COPY --from=builder --chown=asmforge:asmforge /app/node_modules ./node_modules
COPY --from=builder --chown=asmforge:asmforge /app/package*.json ./

# Copy plugins if they exist
COPY --from=builder --chown=asmforge:asmforge /app/plugins ./plugins

# Set environment
ENV NODE_ENV=production
ENV THEIA_DEFAULT_PLUGINS=local-dir:plugins

# Switch to non-root user
USER asmforge

# Expose Theia port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Start command
CMD ["node", "browser-app/src-gen/backend/main.js", "--hostname=0.0.0.0"]
