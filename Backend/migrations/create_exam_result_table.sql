-- Create exam_result table for storing detailed exam question results
-- This table stores individual question results for each exam
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

