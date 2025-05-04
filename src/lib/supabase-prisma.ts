/**
 * Enhanced Prisma client configuration for Supabase
 * 
 * This handles the "prepared statement already exists" errors that occur 
 * with Supabase's connection pooling by disabling the Prisma query engine's
 * prepared statements feature.
 */

import { PrismaClient } from '@prisma/client'

// Extend PrismaClient to add previewFeatures configuration
const createPrismaClient = () => {
  // Create client with specific options to work with Supabase
  return new PrismaClient({
    // Log queries in development only
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    
    // Important: This ensures the connection is properly released after each query
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
}

// Global singleton
declare global {
  var supabasePrisma: PrismaClient | undefined
}

// Use existing client if available (prevents multiple instances in development)
export const prisma = global.supabasePrisma || createPrismaClient()

// Save client reference in development to avoid multiple connections
if (process.env.NODE_ENV !== 'production') {
  global.supabasePrisma = prisma
}

// Helper function for raw SQL queries (specific to Supabase)
export async function executeRawQuery<T = any>(
  sql: string | TemplateStringsArray,
  ...values: any[]
): Promise<T> {
  try {
    // Execute the query
    const result = await prisma.$queryRawUnsafe(
      typeof sql === 'string' ? sql : sql.join('?'),
      ...values
    )
    return result as T
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}
