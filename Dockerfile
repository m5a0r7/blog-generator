# Base image
FROM node:18-alpine

# Install bash and other necessary utilities
RUN apk add --no-cache bash

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Copy Prisma files
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Set default port and make it available at runtime
ENV PORT=3000
ENV NODE_ENV=production

# Expose port
EXPOSE ${PORT}

# Start the application with explicit port
CMD ["sh", "-c", "next start -p ${PORT}"] 