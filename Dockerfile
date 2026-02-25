# 1. Base image
FROM node:20-alpine AS base

RUN apk add --no-cache openssl

# 2. Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
# Install dependencies based on lock file
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# 3. Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG DATABASE_URL="postgresql://user:password@localhost:5432/saas_builder?schema=public"
ENV DATABASE_URL=$DATABASE_URL
# Generate Prisma Client (if using Prisma)
RUN npx prisma generate

# Build Next.js
RUN npm run build

# 4. Runner (Production Image)
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

COPY --from=builder /app/prisma ./prisma
# Automatically leverage output traces to reduce image size
# You MUST set "output: 'standalone'" in next.config.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]