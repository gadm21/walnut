# Getting Started

This guide will help you set up the Walnut platform on your local machine for development and testing purposes.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (version 18 or later)
- npm or Yarn package manager
- Git

You'll also need accounts for the following services:

- [Supabase](https://supabase.com/) for database
- [Vercel](https://vercel.com/) for deployment (optional for local development)

## Installation

Clone the repository to your local machine:

```bash
git clone https://github.com/yourusername/walnut.git
cd walnut
```

Install the dependencies:

```bash
npm install
# or
yarn install
```

## Environment Setup

Create a `.env` file in the root directory of your project with the following variables:

```env
# NextAuth configuration
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=http://localhost:3000

# Database connection
DATABASE_URL=postgresql://postgres.yoursupabaseid:yourpassword@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# For remote AI service (if using)
AI_SERVICE_URL=https://lms-swart-five.vercel.app/query
```

### NextAuth Secret

Generate a secure random string for the `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

### Database Connection

1. Create a new project in [Supabase](https://supabase.com/)
2. Navigate to Project Settings > Database
3. Copy the connection string and replace the placeholders in your `.env` file

## Development

Start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Database Schema

The project uses Supabase PostgreSQL database with the following main tables:

- `users` - User accounts and profile information
- `courses` - Course catalog and metadata
- `enrollments` - User course enrollments
- `lessons` - Course lesson content
- `Query` - AI tutor conversation history

You can find the full database schema in the `sql/schema.sql` file.

## Building for Production

To build the application for production:

```bash
npm run build
# or
yarn build
```

## Running Tests

```bash
npm run test
# or
yarn test
```

## Next Steps

Once you have the application running locally, check out the [Features](features.md) section to learn more about what Walnut can do, or visit the [Architecture](architecture.md) section to understand the project structure.
