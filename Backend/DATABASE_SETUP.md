# Database Setup Guide

## Required Tables for Student Dashboard

The student dashboard requires the following tables to function correctly:

### 1. exam table
Stores exam records for each student.

```sql
CREATE TABLE IF NOT EXISTS exam (
    ExamID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    ExamDate DATE NOT NULL,
    Grade DECIMAL(5,2) DEFAULT NULL
);
```

### 2. exam_result table
Stores detailed results for each question in an exam.

```sql
CREATE TABLE IF NOT EXISTS exam_result (
    ResultID INT AUTO_INCREMENT PRIMARY KEY,
    ExamID INT NOT NULL,
    QuestionID INT NOT NULL,
    Position INT NOT NULL DEFAULT 0,
    IsCorrect TINYINT(1) NOT NULL DEFAULT 0,
    Grade DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (ExamID) REFERENCES exam(ExamID) ON DELETE CASCADE,
    INDEX idx_exam_id (ExamID),
    INDEX idx_question_id (QuestionID)
);
```

## Setup Instructions

### Option 1: Run the SQL file
```bash
mysql -u your_username -p your_database_name < Backend/create_exam_table.sql
```

### Option 2: Run the migration manually
```bash
mysql -u your_username -p your_database_name < Backend/migrations/create_exam_result_table.sql
```

### Option 3: Use the test endpoint
Start the server and visit:
```
http://localhost:5000/api/general/test-exam-table
```

This will automatically create the tables if they don't exist (no authentication required).

## Verifying the Setup

After setup, you can verify the tables exist by running:

```sql
SHOW TABLES LIKE 'exam%';
DESCRIBE exam;
DESCRIBE exam_result;
```

## Data Flow

1. When a student submits an exam:
   - A record is created in the `exam` table with `UserID` and `ExamDate`
   - Multiple records are created in `exam_result` for each question with the grade

2. When loading the dashboard:
   - `lastExam`: Fetches the most recent exam from `exam` table and calculates average grade from `exam_result`
   - `overallAverage`: Calculates the average of all exam averages
   - `totalExams`: Counts the total number of completed exams

## Troubleshooting

If the dashboard shows "אין נתונים" (No data):

1. Check if the tables exist: `SHOW TABLES LIKE 'exam%';`
2. Check if there are any exam records: `SELECT * FROM exam WHERE UserID = ?;`
3. Check if there are any exam_result records: `SELECT * FROM exam_result WHERE ExamID IN (SELECT ExamID FROM exam WHERE UserID = ?);`
4. Check the backend console logs for any SQL errors
5. Ensure the student has taken at least one exam

