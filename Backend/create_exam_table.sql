-- Create exam table if it doesn't exist
CREATE TABLE IF NOT EXISTS exam (
    ExamID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    ExamDate DATE NOT NULL,
    Grade DECIMAL(5,2) NOT NULL
);

-- Insert a test record to verify the table works
INSERT INTO exam (UserID, ExamDate, Grade) VALUES (1, CURDATE(), 85.5);
