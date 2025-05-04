import { Pool } from 'pg';

// Parse the DATABASE_URL to get the connection parameters
const parseConnectionString = (url: string) => {
  // Expected format: postgresql://user:password@host:port/database
  const regex = /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
  const match = url.match(regex);
  
  if (!match) {
    throw new Error('Invalid DATABASE_URL format');
  }
  
  const [, user, password, host, port, database] = match;
  return {
    user,
    password,
    host,
    port: parseInt(port, 10),
    database,
    ssl: {
      rejectUnauthorized: false, // Important: Allows self-signed certificates
    },
  };
};

// Singleton pattern for pool
class PostgresClient {
  private static instance: PostgresClient;
  private pool: Pool | null = null;

  private constructor() {}

  public static getInstance(): PostgresClient {
    if (!PostgresClient.instance) {
      PostgresClient.instance = new PostgresClient();
    }
    return PostgresClient.instance;
  }

  public getPool(): Pool {
    if (!this.pool) {
      const connectionString = process.env.DATABASE_URL;
      if (!connectionString) {
        throw new Error('DATABASE_URL environment variable is required');
      }
      
      // Ensure we have the right PATH environment variable for connections
      if (process.env.NODE_ENV === 'development' && !process.env.PATH?.includes('/opt/homebrew/bin')) {
        // Add homebrew bin path if it's missing - this helps with cert issues on macOS
        process.env.PATH = `/opt/homebrew/bin:${process.env.PATH || ''}`;
        console.log('Added /opt/homebrew/bin to PATH for PostgreSQL connections');
      }
      
      // For development environment, log the connection for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log(`Connecting to PostgreSQL database - ${connectionString.split('@')[1]}`);
      }
      
      try {
        const config = parseConnectionString(connectionString);
        this.pool = new Pool({
          ...config,
          max: 10, // Maximum number of clients in the pool
          idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
          connectionTimeoutMillis: 5000, // How long to wait before timing out when connecting a new client
        });
        
        // Log connection issues for debugging
        this.pool.on('error', (err) => {
          console.error('Unexpected error on idle client', err);
          // Attempt to recreate the pool on the next query if there's an error
          this.pool = null;
        });
      } catch (error) {
        console.error('Error creating PostgreSQL pool:', error);
        throw error;
      }
    }
    
    return this.pool;
  }
}

export const getPool = (): Pool => {
  return PostgresClient.getInstance().getPool();
};

/**
 * Executes a SQL query with parameters and retry logic
 */
export async function query<T = any>(text: string, params: any[] = [], maxRetries = 3): Promise<T[]> {
  let retries = 0;
  let lastError: any;

  while (retries < maxRetries) {
    const pool = getPool();
    let client;

    try {
      client = await pool.connect();
      const result = await client.query(text, params);
      return result.rows as T[];
    } catch (error: any) {
      lastError = error;
      retries++;
      
      // Log the error
      console.error(`Database query error (attempt ${retries}/${maxRetries}):`, {
        message: error.message,
        code: error.code,
        query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      });
      
      // Only retry on connection-related errors, not query errors
      if (error.code && !['08006', '08001', '08004', '08007', '08P01'].includes(error.code)) {
        throw error; // Don't retry on query syntax errors
      }
      
      // Wait before retry (exponential backoff: 300ms, 900ms, 2700ms)
      if (retries < maxRetries) {
        const delay = 300 * Math.pow(3, retries - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } finally {
      if (client) {
        client.release(true); // Release with error flag to ensure the client is destroyed
      }
    }
  }

  // All retries failed
  throw lastError || new Error('Query failed after max retries');
}

/**
 * Execute a query and return the first result or null, with improved error handling
 */
export async function queryOne<T = any>(text: string, params: any[] = []): Promise<T | null> {
  try {
    const results = await query<T>(text, params);
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Error in queryOne:', error);
    throw error;
  }
}

/**
 * Execute a transaction with multiple queries
 */
export async function transaction<T = any>(callback: (client: any) => Promise<T>): Promise<T> {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
