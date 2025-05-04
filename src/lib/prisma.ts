import { PrismaClient } from '@prisma/client'

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Add specific connection pool configuration for Supabase
const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Configure connection pool to handle Supabase's connection limits
    // This is important to prevent "prepared statement already exists" errors
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export const prisma = global.prisma || prismaClientSingleton()

// Use a single instance of Prisma Client in development
if (process.env.NODE_ENV !== 'production') global.prisma = prisma
