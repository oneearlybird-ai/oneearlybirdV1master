FROM node:20-alpine
WORKDIR /app

# Install prod dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy source
COPY . .

# Environment
ENV NODE_ENV=production

# Railway/Fly provide $PORT; default to 8080 for local
ENV PORT=8080
EXPOSE 8080

# Start the WS server
CMD ["npm","start"]

