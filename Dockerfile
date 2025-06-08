# Step 1: Build the app
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps
COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline

# Copy all source code
COPY . .

# Build Next.js app
RUN npm run build

# Step 2: Run optimized app
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy the output from build phase
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Healthcheck (optional)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD wget -qO- http://localhost:3000 || exit 1

EXPOSE 3000

CMD ["node", "server.js"]
