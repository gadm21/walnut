# API Reference

This document provides detailed information about the Walnut platform API endpoints.

## Base URL

For local development: `http://localhost:3000/api`
For production: `https://your-app-name.vercel.app/api`

## Authentication API

### POST /api/auth/register

Create a new user account.

**Request Body:**

```json
{
  "username": "johndoe",
  "password": "securepassword123",
  "email": "john@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "userId": "123",
  "message": "Account created successfully"
}
```

### POST /api/auth/login

Authenticate a user and get access token.

**Request Body:**

```json
{
  "username": "johndoe",
  "password": "securepassword123"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

### GET /api/auth/session

Get the current user session information.

**Response:**

```json
{
  "user": {
    "id": "123",
    "username": "johndoe",
    "email": "john@example.com"
  },
  "expires": "2023-12-31T23:59:59.999Z"
}
```

## User API

### GET /api/user/profile

Get the current user's profile.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "userId": "123",
  "username": "johndoe",
  "email": "john@example.com",
  "createdAt": "2023-01-01T12:00:00Z",
  "enrolledCourses": 3
}
```

### PUT /api/user/profile

Update the current user's profile.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "email": "newemail@example.com",
  "password": "newpassword123" // Optional
}
```

**Response:**

```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

## Courses API

### GET /api/courses

Get a list of available courses.

**Query Parameters:**

- `limit` (optional): Number of courses to return (default: 20)
- `page` (optional): Page number for pagination (default: 1)
- `search` (optional): Search term to filter courses

**Response:**

```json
{
  "courses": [
    {
      "id": "1",
      "title": "Introduction to AI",
      "description": "Learn the basics of artificial intelligence",
      "instructor": "Dr. Jane Smith",
      "durationHours": 12,
      "level": "Beginner"
    },
    // More courses...
  ],
  "totalCourses": 42,
  "totalPages": 3
}
```

### GET /api/courses/{id}

Get details about a specific course.

**Response:**

```json
{
  "id": "1",
  "title": "Introduction to AI",
  "description": "Learn the basics of artificial intelligence",
  "instructor": "Dr. Jane Smith",
  "durationHours": 12,
  "level": "Beginner",
  "modules": [
    {
      "id": "1-1",
      "title": "What is AI?",
      "lessons": [
        {
          "id": "1-1-1",
          "title": "Definition and History",
          "duration": "45 minutes"
        }
        // More lessons...
      ]
    }
    // More modules...
  ]
}
```

### POST /api/courses/{id}/enroll

Enroll the current user in a course.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "enrollmentId": "456",
  "courseId": "1",
  "enrolledAt": "2023-05-01T15:30:00Z"
}
```

## AI Tutor API

### POST /api/ai-query

Send a question to the AI tutor.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "query": "What is machine learning?",
  "chatId": "1-lesson-1-3"
}
```

**Response:**

```json
{
  "response": "Machine learning is a branch of artificial intelligence that focuses on building systems that can learn from and make decisions based on data...",
  "query": "What is machine learning?",
  "chat_id": "1-lesson-1-3",
  "queryId": 42
}
```

### GET /api/chat-history

Get chat history for a specific conversation.

**Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `chatId`: The ID of the chat conversation

**Response:**

```json
{
  "chatId": "1-lesson-1-3",
  "messages": [
    {
      "id": "1",
      "role": "user",
      "content": "What is machine learning?",
      "timestamp": "2023-05-01T15:35:00Z"
    },
    {
      "id": "2",
      "role": "assistant",
      "content": "Machine learning is a branch of artificial intelligence...",
      "timestamp": "2023-05-01T15:35:02Z"
    }
    // More messages...
  ]
}
```

## Error Responses

All API endpoints follow a standard error response format:

```json
{
  "error": "Error message",
  "detail": "Detailed description of the error",
  "status": 400
}
```

Common error status codes:

- `400`: Bad Request - Invalid parameters or request body
- `401`: Unauthorized - Missing or invalid authentication
- `403`: Forbidden - User does not have permission for the action
- `404`: Not Found - Resource does not exist
- `500`: Internal Server Error - Server-side error occurred
