#!/bin/bash
set -e

# Wait for database to be ready
echo "Waiting for database to be ready..."
npx wait-on tcp:postgres.railway.internal:5432

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting the application on port ${PORT:-3000}..."
exec "$@" 
