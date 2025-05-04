import { NextConfig } from 'next'

/**
 * Get the base URL for the application, handling Vercel deployments automatically
 */
const getBaseUrl = () => {
  // Vercel automatically sets these environment variables
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  
  // For preview deployments
  if (process.env.VERCEL_ENV === 'preview') {
    return `https://${process.env.VERCEL_URL}`
  }
  
  // For production deployment with custom domain
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }
  
  // Fallback to NextAuth URL if it's set
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  
  // Fallback to localhost for local development
  return 'http://localhost:3000'
}

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    // Make base URL available to the client-side code
    NEXT_PUBLIC_BASE_URL: getBaseUrl(),
  },
  // Add any other configuration options here
}

export default nextConfig
