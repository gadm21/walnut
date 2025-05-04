#!/bin/bash

# Print current directory
echo "Current directory: $(pwd)"

# Generate Prisma client from schema
echo "Generating Prisma client..."
npx prisma generate

# Create migrations
echo "Creating migrations..."
npx prisma migrate dev --name sync_all_tables --create-only

# Apply migrations to database
echo "Applying migrations to database..."
npx prisma migrate deploy

# Seed database (if needed)
# echo "Seeding database..."
# npx prisma db seed

echo "Migration complete!"
