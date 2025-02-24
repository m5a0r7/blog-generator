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

# Copy the entrypoint script first and set permissions
COPY docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh

# Copy project files
COPY . .

# Copy Prisma files
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Set default port
ENV PORT=3000

# Expose port from environment variable
EXPOSE ${PORT}

# Use bash to execute the entrypoint script
ENTRYPOINT ["/bin/bash", "/app/docker-entrypoint.sh"]
CMD ["npm", "start"] 