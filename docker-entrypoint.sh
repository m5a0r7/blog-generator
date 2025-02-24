#!/bin/bash

# Wait for database to be ready
echo "Waiting for database to be ready..."
npx wait-on tcp:db:5432

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting the application..."
exec "$@" 