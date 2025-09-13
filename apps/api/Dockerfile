FROM node:20-alpine
WORKDIR /app

# Install production deps
COPY package.json ./
RUN npm install --omit=dev

# Copy source
COPY src ./src

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O - http://127.0.0.1:8080/ >/dev/null || exit 1

# Drop privileges
USER node

CMD ["node", "src/server.js"]
