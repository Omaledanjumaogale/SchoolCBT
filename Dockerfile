# syntax=docker/dockerfile:1
# SchoolCBT — Multi-stage Dockerfile for Node.js SvelteKit production build
# Target: Minimal runtime image running Cloudflare adapter build via Vite preview

# ─── Stage 1: Build ─────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copy source and build
COPY . .
RUN npm run build

# ─── Stage 2: Runtime ────────────────────────────────────────
FROM node:20-alpine AS runtime

WORKDIR /app

# Copy only what's needed for npm run preview
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.svelte-kit ./.svelte-kit
COPY --from=builder /app/vite.config.ts ./
COPY --from=builder /app/svelte.config.js ./
COPY --from=builder /app/tailwind.config.ts ./
COPY --from=builder /app/postcss.config.js ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/static ./static

# Security: run as non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 4173

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]