# Manage Content API Documentation

## Overview
This document describes the new admin endpoints for managing educational content including videos, exam questions, and practice exercises.

## Authentication
All admin endpoints require authentication with a valid JWT token and admin/manager/teacher role.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

## Endpoints

### Videos Management

#### List Videos by Topic
```bash
GET /api/topics/:topicId/videos?difficulty=intro|easy|medium|exam
```

**Example:**
```bash
curl -H "Authorization: Bearer your-token" \
     "http://localhost:5000/api/topics/1/videos?difficulty=easy"
```

**Response:**
```json
[
  {
    "videoId": 1,
    "topicId": 1,
    "videoUrl": "https://youtube.com/watch?v=example",
    "difficulty": "easy"
  }
]
```

#### Create Video
```bash
POST /api/videos
```

**Body:**
```json
{
  "topicId": 1,
  "videoUrl": "https://youtube.com/watch?v=advanced",
  "difficulty": "medium"
}
```

**Example:**
```bash
curl -X POST \
     -H "Authorization: Bearer your-token" \
     -H "Content-Type: application/json" \
     -d '{"topicId":1,"videoUrl":"https://youtube.com/watch?v=advanced","difficulty":"medium"}' \
     "http://localhost:5000/api/videos"
```

#### Update Video
```bash
PUT /api/videos/:videoId
```

**Body:**
```json
{
  "videoUrl": "https://youtube.com/watch?v=updated",
  "difficulty": "exam"
}
```

#### Delete Video
```bash
DELETE /api/videos/:videoId
```

### Exam Questions Management

#### List Exam Questions by Topic
```bash
GET /api/topics/:topicId/exam-questions
```

**Example:**
```bash
curl -H "Authorization: Bearer your-token" \
     "http://localhost:5000/api/topics/1/exam-questions"
```

**Response:**
```json
[
  {
    "questionId": 1,
    "topicId": 1,
    "questionPicURL": "https://example.com/question1.jpg",
    "answerOptions": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option B"
  }
]
```

#### Create Exam Question
```bash
POST /api/exam-questions
```

**Body:**
```json
{
  "topicId": 1,
  "questionPicURL": "https://example.com/question2.jpg",
  "answerOptions": ["A", "B", "C", "D"],
  "correctAnswer": "C"
}
```

#### Update Exam Question
```bash
PUT /api/exam-questions/:questionId
```

#### Delete Exam Question
```bash
DELETE /api/exam-questions/:questionId
```

### Practice Exercises Management

#### List Practice Exercises by Topic
```bash
GET /api/topics/:topicId/practice-exercises?difficulty=easy|medium|exam
```

**Example:**
```bash
curl -H "Authorization: Bearer your-token" \
     "http://localhost:5000/api/topics/1/practice-exercises?difficulty=easy"
```

**Response:**
```json
[
  {
    "exerciseId": 1,
    "topicId": 1,
    "answerOptions": ["2", "4", "6", "8"],
    "correctAnswer": "4",
    "contentType": "text",
    "contentValue": "What is 2 + 2?",
    "difficulty": "easy"
  }
]
```

#### Create Practice Exercise
```bash
POST /api/practice-exercises
```

**Body:**
```json
{
  "topicId": 1,
  "contentType": "text",
  "contentValue": "What is 5 + 3?",
  "answerOptions": ["6", "7", "8", "9"],
  "correctAnswer": "8",
  "difficulty": "easy"
}
```

#### Update Practice Exercise
```bash
PUT /api/practice-exercises/:exerciseId
```

#### Delete Practice Exercise
```bash
DELETE /api/practice-exercises/:exerciseId
```

## Data Validation

### Video Difficulty
- `intro` - Introduction level
- `easy` - Easy level
- `medium` - Medium level
- `exam` - Exam level

### Practice Exercise Difficulty
- `easy` - Easy level
- `medium` - Medium level
- `exam` - Exam level

### Content Types
- `text` - Text content
- `image` - Image URL
- `video` - Video URL

### Answer Options
- Must be an array of strings
- Minimum 2 options, maximum 50 options
- Cannot be empty

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "error": "Access token required"
}
```

### 403 Forbidden
```json
{
  "error": "Admin access required"
}
```

### 404 Not Found
```json
{
  "error": "Video not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Server error"
}
```

## Frontend Integration

The frontend provides three admin pages:
- `/admin/topics/:topicId/videos` - Video management
- `/admin/topics/:topicId/exam` - Exam questions management  
- `/admin/topics/:topicId/practice` - Practice exercises management

Access these pages through the "ניהול תוכן" button on topic cards in the Manage Content section.
