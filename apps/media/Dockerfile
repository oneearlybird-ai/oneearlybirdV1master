FROM node:20-alpine
WORKDIR /app

# Install prod dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy source
COPY . .

# Environment
ENV NODE_ENV=production

# Platform provides $PORT (e.g., ECS/ALB); default to 8080 for local
ENV PORT=8080
EXPOSE 8080

# Start the WS server
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O - http://127.0.0.1:8080/ >/dev/null || exit 1

# Drop privileges
USER node

CMD ["npm","start"]
