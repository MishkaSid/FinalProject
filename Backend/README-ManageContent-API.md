# Manage Content API Documentation

## Overview
This document provides API endpoints for managing educational content including videos, exam questions, and practice exercises.

## Authentication
All endpoints require admin authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Base URL
```
http://localhost:5000/api
```

## Endpoints

### Videos

#### Get videos by topic
```bash
GET /topics/:topicId/videos?difficulty=<intro|easy|medium|exam>
```

**Example:**
```bash
curl -X GET "http://localhost:5000/api/topics/1/videos?difficulty=easy" \
  -H "Authorization: Bearer your-jwt-token"
```

**Response:**
```json
[
  {
    "videoId": 1,
    "topicId": 1,
    "videoUrl": "https://example.com/video1",
    "difficulty": "easy"
  }
]
```

#### Create video
```bash
POST /videos
```

**Request Body:**
```json
{
  "topicId": 1,
  "videoUrl": "https://example.com/video1",
  "difficulty": "easy"
}
```

**Example:**
```bash
curl -X POST "http://localhost:5000/api/videos" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "topicId": 1,
    "videoUrl": "https://example.com/video1",
    "difficulty": "easy"
  }'
```

#### Update video
```bash
PUT /videos/:videoId
```

**Example:**
```bash
curl -X PUT "http://localhost:5000/api/videos/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "videoUrl": "https://example.com/updated-video1",
    "difficulty": "medium"
  }'
```

#### Delete video
```bash
DELETE /videos/:videoId
```

**Example:**
```bash
curl -X DELETE "http://localhost:5000/api/videos/1" \
  -H "Authorization: Bearer your-jwt-token"
```

### Exam Questions

#### Get exam questions by topic
```bash
GET /topics/:topicId/exam-questions
```

**Example:**
```bash
curl -X GET "http://localhost:5000/api/topics/1/exam-questions" \
  -H "Authorization: Bearer your-jwt-token"
```

**Response:**
```json
[
  {
    "questionId": 1,
    "topicId": 1,
    "questionPicURL": "https://example.com/question1.jpg",
    "answerOptions": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A"
  }
]
```

#### Create exam question
```bash
POST /exam-questions
```

**Request Body:**
```json
{
  "topicId": 1,
  "questionPicURL": "https://example.com/question1.jpg",
  "answerOptions": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "Option A"
}
```

**Example:**
```bash
curl -X POST "http://localhost:5000/api/exam-questions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "topicId": 1,
    "questionPicURL": "https://example.com/question1.jpg",
    "answerOptions": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A"
  }'
```

#### Update exam question
```bash
PUT /exam-questions/:questionId
```

**Example:**
```bash
curl -X PUT "http://localhost:5000/api/exam-questions/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "answerOptions": ["New Option A", "New Option B", "New Option C"],
    "correctAnswer": "New Option A"
  }'
```

#### Delete exam question
```bash
DELETE /exam-questions/:questionId
```

**Example:**
```bash
curl -X DELETE "http://localhost:5000/api/exam-questions/1" \
  -H "Authorization: Bearer your-jwt-token"
```

### Practice Exercises

#### Get practice exercises by topic
```bash
GET /topics/:topicId/practice-exercises?difficulty=<easy|medium|exam>
```

**Example:**
```bash
curl -X GET "http://localhost:5000/api/topics/1/practice-exercises?difficulty=easy" \
  -H "Authorization: Bearer your-jwt-token"
```

**Response:**
```json
[
  {
    "exerciseId": 1,
    "topicId": 1,
    "answerOptions": ["Answer 1", "Answer 2", "Answer 3"],
    "correctAnswer": "Answer 1",
    "contentType": "text",
    "contentValue": "Solve for x: 2x + 5 = 15",
    "difficulty": "easy"
  }
]
```

#### Create practice exercise
```bash
POST /practice-exercises
```

**Request Body:**
```json
{
  "topicId": 1,
  "answerOptions": ["Answer 1", "Answer 2", "Answer 3"],
  "correctAnswer": "Answer 1",
  "contentType": "text",
  "contentValue": "Solve for x: 2x + 5 = 15",
  "difficulty": "easy"
}
```

**Example:**
```bash
curl -X POST "http://localhost:5000/api/practice-exercises" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "topicId": 1,
    "answerOptions": ["Answer 1", "Answer 2", "Answer 3"],
    "correctAnswer": "Answer 1",
    "contentType": "text",
    "contentValue": "Solve for x: 2x + 5 = 15",
    "difficulty": "easy"
  }'
```

#### Update practice exercise
```bash
PUT /practice-exercises/:exerciseId
```

**Example:**
```bash
curl -X PUT "http://localhost:5000/api/practice-exercises/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "contentValue": "Updated exercise content",
    "difficulty": "medium"
  }'
```

#### Delete practice exercise
```bash
DELETE /practice-exercises/:exerciseId
```

**Example:**
```bash
curl -X DELETE "http://localhost:5000/api/practice-exercises/1" \
  -H "Authorization: Bearer your-jwt-token"
```

## Data Types

### Difficulty Levels
- **Videos**: `intro`, `easy`, `medium`, `exam`
- **Practice Exercises**: `easy`, `medium`, `exam` (no `intro`)

### Content Types (Practice Exercises)
- `text`: Text-based content
- `image`: Image URL
- `video`: Video URL

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
  "error": "Access denied"
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

## Validation Rules

1. **AnswerOptions**: Must be a non-empty array with maximum 50 items
2. **Difficulty**: Must match the enum values for each table
3. **Required Fields**: All fields marked as required must be provided
4. **TopicID**: Must reference an existing topic

## Database Schema

### practice_video
- VideoID (int, AI, PK)
- TopicID (int, FK)
- VideoUrl (varchar(500))
- Difficulty (enum: 'intro', 'easy', 'medium', 'exam')

### exam_question
- QuestionID (int, AI, PK)
- TopicID (int, FK)
- QuestionPicURL (varchar(255))
- AnswerOptions (longtext, JSON)
- CorrectAnswer (varchar(255))

### practice_exercise
- ExerciseID (int, AI, PK)
- TopicID (int, FK)
- AnswerOptions (longtext, JSON)
- CorrectAnswer (varchar(255))
- ContentType (varchar(32))
- ContentValue (varchar(1024))
- Difficulty (enum: 'easy', 'medium', 'exam')
