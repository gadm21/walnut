# Deployment Guide

This guide will walk you through deploying the Walnut platform to Vercel for production use.

## Vercel Deployment

Vercel is the recommended hosting platform for Walnut, as it's optimized for Next.js applications.

### Prerequisites

- A [Vercel](https://vercel.com) account
- Your project code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
- A Supabase database for production

### Deployment Steps

1. **Push your code to GitHub**:
   
   Ensure your code is committed and pushed to your GitHub repository.

2. **Import your repository to Vercel**:

   - Go to [https://vercel.com/import](https://vercel.com/import)
   - Select your Git provider (GitHub, GitLab, or Bitbucket)
   - Authorize Vercel to access your repositories
   - Select the repository you want to deploy

3. **Configure the project**:

   - Vercel will automatically detect that your project is a Next.js application
   - You can keep the default settings for Build and Output Directory
   - Click "Continue" to proceed to the environment variables

4. **Set up environment variables**:

   Add the following environment variables:

   ```
   NEXTAUTH_SECRET=<your-secure-secret>
   NEXTAUTH_URL=<your-production-url>
   DATABASE_URL=<your-supabase-postgres-connection>
   ```

   If you're using the remote AI service, also add:
   
   ```
   AI_SERVICE_URL=https://lms-swart-five.vercel.app/query
   ```

5. **Deploy**:

   Click "Deploy" and wait for Vercel to build and deploy your application.

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXTAUTH_SECRET` | Secret key for NextAuth.js sessions | `abcdefghijklmnopqrstuvwxyz123456` |
| `NEXTAUTH_URL` | Your production URL | `https://your-app.vercel.app` |
| `DATABASE_URL` | Supabase PostgreSQL connection string | `postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres` |

### Optional Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `AI_SERVICE_URL` | URL for the AI tutoring service | `https://lms-swart-five.vercel.app/query` |
| `VERCEL_URL` | Automatically set by Vercel | `your-app.vercel.app` |

## Custom Domains

To set up a custom domain:

1. Go to your project on Vercel
2. Navigate to "Settings" > "Domains"
3. Add your custom domain
4. Follow the instructions to configure DNS settings

## Continuous Deployment

Vercel automatically sets up continuous deployment for your project. When you push changes to your repository, Vercel will automatically rebuild and deploy your application.

To customize this behavior:

1. Go to your project on Vercel
2. Navigate to "Settings" > "Git"
3. Configure the production branch and deployment settings

## Monitoring and Logs

Vercel provides built-in monitoring and logs for your application:

1. Go to your project on Vercel
2. Navigate to "Analytics" to view performance metrics
3. Navigate to "Logs" to view application logs

## Troubleshooting

### Build Failures

If your build fails, check the build logs for errors:

1. Go to your project on Vercel
2. Click on the failed deployment
3. View the build logs to identify the issue

Common issues include:
- Missing environment variables
- Dependency installation failures
- Build script errors

### Database Connection Issues

If your application can't connect to the database:

1. Verify your `DATABASE_URL` environment variable
2. Ensure your Supabase project allows connections from Vercel IPs
3. Check network settings in Supabase

## Scaling

Vercel automatically handles scaling for your application. If you need additional resources or features, you can upgrade your Vercel plan.

For database scaling, refer to Supabase documentation on scaling options.
