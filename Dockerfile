# ==========================================
# Multi-Stage / Lightweight Production Dockerfile
# Node.js 20 on Alpine Linux
# ==========================================

FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Install dependencies before copying source code to leverage Docker layer caching
COPY package*.json ./

RUN npm install --omit=dev --silent

# Copy application source code
COPY . .

# Set default environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose server port
EXPOSE 3000

# Run non-root user for security
USER node

# Start Express server
CMD ["node", "index.js"]
