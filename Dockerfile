# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (skip prepare script which runs husky)
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only (skip prepare script)
RUN npm ci --omit=dev --ignore-scripts

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Run the app
CMD ["node", "dist/index.js"]
