# 🌰 Walnut - Modern Higher Education Platform

![Walnut Platform](/public/og-image.png)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fwalnut)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## 📚 Overview

Walnut is a modern, feature-rich higher education platform designed to provide innovative online courses for the modern learner. Built with Next.js 15, TypeScript, and Supabase, it offers a seamless learning experience with AI-powered tutoring, interactive course content, and a beautiful user interface.

### ✨ Key Features

- **🔐 Secure Authentication** - Robust user authentication using NextAuth.js
- **🧠 AI-Powered Tutoring** - Intelligent AI tutor to assist students
- **📊 Student Dashboard** - Personalized dashboard for tracking progress
- **📱 Responsive Design** - Beautiful UI that works on all devices
- **🌙 Dark Mode Support** - Toggle between light and dark themes
- **🛠️ Modern Tech Stack** - Built with Next.js 15, TypeScript, and Supabase

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for database)
- OpenAI API key (for AI tutoring functionality)

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# NextAuth configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Database connection
DATABASE_URL=your_supabase_postgres_connection_string

# For production with Vercel
VERCEL_URL=your_vercel_url
```

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/walnut.git
cd walnut

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 🏗️ Project Structure

```
walnut/
├── public/             # Static assets
├── src/
│   ├── app/            # Next.js App Router
│   ├── components/     # Reusable UI components
│   ├── lib/            # Utility functions
│   └── styles/         # Global styles
├── .env                # Environment variables (not committed)
├── next.config.js      # Next.js configuration
└── package.json        # Project dependencies
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

### Database Management

This project uses Supabase PostgreSQL for database management. The database schema is defined in [`sql/schema.sql`](sql/schema.sql).

## 🌐 API Documentation

The API documentation is available at [https://yourusername.github.io/walnut](https://yourusername.github.io/walnut) and includes details on all available endpoints, request/response formats, and authentication requirements.

### Key Endpoints

- `/api/auth/*` - Authentication endpoints powered by NextAuth.js
- `/api/ai-query` - AI tutor interaction endpoint
- `/api/chat-history` - Student chat history retrieval

## 📦 Deployment

### Vercel Deployment

This project is optimized for deployment on [Vercel](https://vercel.com/):

1. Push your code to GitHub, GitLab, or Bitbucket
2. Go to [https://vercel.com/import](https://vercel.com/import) and import your repository
3. Add the required environment variables in the Vercel project settings
4. Deploy! Vercel will automatically detect Next.js and use the correct build settings

### Environment Variables for Production

Make sure to set these environment variables in your Vercel project:

- `NEXTAUTH_SECRET` - Secret for NextAuth.js authentication
- `NEXTAUTH_URL` - Your production URL
- `DATABASE_URL` - Your Supabase PostgreSQL connection string

## 📄 License

Walnut is [MIT licensed](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Contact

Have questions? Reach out to us at [youremail@example.com](mailto:youremail@example.com)

