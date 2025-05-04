# Architecture

This document outlines the architecture and technical design of the Walnut platform.

## Project Structure

The Walnut platform follows a modular architecture based on Next.js 15's App Router pattern:

```
walnut/
├── public/               # Static assets
├── src/
│   ├── app/              # Next.js App Router pages and layout
│   │   ├── api/          # API routes
│   │   ├── (auth)/       # Authentication routes (login, register)
│   │   ├── dashboard/    # Student dashboard
│   │   ├── courses/      # Course catalog and course pages
│   │   └── layout.tsx    # Root layout with providers
│   ├── components/       # Reusable UI components
│   │   ├── ui/           # Base UI components
│   │   ├── layout/       # Layout components
│   │   └── lms/          # LMS-specific components
│   ├── lib/              # Utility functions and services
│   │   ├── auth/         # Authentication utilities
│   │   ├── db/           # Database utilities
│   │   └── utils/        # Helper functions
│   └── styles/           # Global styles
├── docs/                 # Documentation (for GitHub Pages)
├── sql/                  # Database schema and migrations
├── .env                  # Environment variables (not committed)
├── next.config.js        # Next.js configuration
└── package.json          # Project dependencies
```

## Tech Stack

Walnut is built with modern technologies:

### Frontend

- **Next.js 15**: React framework with server-side rendering and App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **next-themes**: For dark/light mode theming
- **React Hook Form**: Form validation and handling
- **ShadcnUI**: Accessible UI components

### Backend

- **Next.js API Routes**: Server-side API endpoints
- **NextAuth.js**: Authentication framework
- **PostgreSQL**: Relational database (via Supabase)
- **Supabase**: Database hosting and management
- **OpenAI API**: For AI tutoring capabilities

### DevOps

- **Vercel**: Hosting and deployment
- **GitHub Actions**: CI/CD pipelines
- **ESLint**: Code quality and style enforcement
- **Jest**: Testing framework

## Database Schema

The core database schema includes these main tables:

### Users Table

```sql
CREATE TABLE users (
  userId SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Courses Table

```sql
CREATE TABLE courses (
  courseId SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructor VARCHAR(255) NOT NULL,
  image_url VARCHAR(512),
  level VARCHAR(50) NOT NULL,
  duration_hours INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Enrollments Table

```sql
CREATE TABLE enrollments (
  enrollmentId SERIAL PRIMARY KEY,
  userId INTEGER REFERENCES users(userId),
  courseId INTEGER REFERENCES courses(courseId),
  progress INTEGER DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Lessons Table

```sql
CREATE TABLE lessons (
  lessonId SERIAL PRIMARY KEY,
  courseId INTEGER REFERENCES courses(courseId),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  order_index INTEGER NOT NULL,
  duration_minutes INTEGER
);
```

### Query Table (AI Tutor History)

```sql
CREATE TABLE "Query" (
  queryId SERIAL PRIMARY KEY,
  userId INTEGER REFERENCES users(userId),
  chatId VARCHAR(255),
  query_text TEXT NOT NULL,
  response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Authentication Flow

Walnut uses NextAuth.js for authentication with the following flow:

1. User submits credentials via login form
2. NextAuth.js verifies credentials against database
3. On successful authentication, JWT token is created and stored in HTTP-only cookie
4. Token is validated on each authenticated request
5. Protected routes and API endpoints check authentication status

## AI Tutoring Architecture

The AI tutoring system works as follows:

1. User submits a question through the AI Tutor interface
2. Request is sent to the `/api/ai-query` endpoint
3. The endpoint forwards the request to the AI service
4. AI service processes the query and generates a response
5. Response is sent back to the client and stored in the database

## Deployment Architecture

Walnut is deployed on Vercel with the following architecture:

1. Next.js application is built into static assets and serverless functions
2. Vercel hosts static assets on its global CDN
3. API routes are deployed as serverless functions
4. Database is hosted on Supabase
5. Environment variables store configuration and secrets

## Performance Optimizations

Walnut implements various performance optimizations:

- **Static Site Generation (SSG)** for content-heavy pages
- **Incremental Static Regeneration (ISR)** for updated content
- **Image optimization** via Next.js Image component
- **Code splitting** for reduced bundle sizes
- **Cache headers** for static assets
- **Server-side rendering** for dynamic pages
- **Edge caching** for improved global performance

## Security Measures

Security is a priority in Walnut's architecture:

- **HTTP-only cookies** for authentication tokens
- **CSRF protection** via NextAuth.js
- **Content Security Policy** headers
- **SQL injection prevention** via parameterized queries
- **Rate limiting** on API endpoints
- **Input validation** for all user-submitted data
- **Secure headers** via Vercel configuration
