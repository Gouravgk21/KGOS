# =============================================================================
# KGOS X 2031 — PRODUCTION DOCKER CONTAINER SPECIFICATION
# =============================================================================

FROM node:20-alpine AS base

# Install build dependencies (openssl is required for Prisma client binary)
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies cleanly
RUN npm ci

# Copy the rest of the application files
COPY . .

# Generate Prisma Client bindings
RUN npx prisma generate

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js application
RUN npm run build

# Production Runner stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache openssl

# Set proper non-root user permissions for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy build artifacts and dependencies from the build stage
COPY --from=base /app/public ./public
COPY --from=base /app/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/prisma ./prisma

USER nextjs

EXPOSE 3000

# Start Next.js server
CMD ["npm", "run", "start"]
