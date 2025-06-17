# -------- Stage 1: Builder --------
  FROM node:20-bullseye-slim AS builder

  # Install required build tools and OpenSSL 1.1
  RUN apt-get update && apt-get install -y \
      build-essential \
      python3 \
      libssl1.1 \
      && rm -rf /var/lib/apt/lists/*
  
  WORKDIR /app
  
  # Copy only the necessary files
  COPY package*.json ./
  
  # Copy full source code and environment
  COPY . .
  COPY .env .env
  
  # Generate Prisma Client
  RUN npx prisma generate
  
  # Build NestJS project
  RUN npm run build --force
  
  # Optional: Clean unused files to reduce final size
  RUN rm -rf prisma test .github && \
      find node_modules -type f -name "*.map" -delete
  
  
  # -------- Stage 2: Runtime (distroless) --------
  FROM gcr.io/distroless/nodejs20
  
  WORKDIR /app
  
  # Copy production artifacts from builder
  COPY --from=builder /app/node_modules ./node_modules
  COPY --from=builder /app/package.json ./package.json
  COPY --from=builder /app/dist ./dist
  COPY --from=builder /app/.env .env
  
  # Start app without shell
  CMD ["dist/src/main.js"]
  