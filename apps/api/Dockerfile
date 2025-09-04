
# ---- builder ----
FROM node:20-bookworm AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable && pnpm i --frozen-lockfile || pnpm i
COPY . .
RUN pnpm build

# ---- runtime ----
FROM node:20-bookworm
WORKDIR /app
ENV NODE_ENV=production PORT=4000
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
EXPOSE 4000
CMD ["node", "dist/main.js"]
