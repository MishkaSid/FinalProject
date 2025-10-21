-- Create exam table if it doesn't exist
CREATE TABLE IF NOT EXISTS exam (
    ExamID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    ExamDate DATE NOT NULL,
    Grade DECIMAL(5,2) DEFAULT NULL
);

-- Create exam_result table for storing detailed exam question results
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

-- Insert a test record to verify the tables work
-- INSERT INTO exam (UserID, ExamDate, Grade) VALUES (1, CURDATE(), 85.5);
