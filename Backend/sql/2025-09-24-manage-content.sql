-- Manage Content Tables - Indexes and Foreign Keys
-- Date: 2025-09-24
-- Description: Add indexes and foreign keys for manage content tables

-- Add indexes for better query performance
-- practice_video indexes
CREATE INDEX idx_practice_video_topic_difficulty 
ON practice_video (TopicID, Difficulty);

-- practice_exercise indexes  
CREATE INDEX idx_practice_exercise_topic_difficulty 
ON practice_exercise (TopicID, Difficulty);

-- exam_question indexes
CREATE INDEX idx_exam_question_topic 
ON exam_question (TopicID);

-- Add foreign key constraints (if not already present)
-- Note: These will fail if FKs already exist, which is safe

-- practice_video foreign key
ALTER TABLE practice_video 
ADD CONSTRAINT fk_practice_video_topic 
FOREIGN KEY (TopicID) REFERENCES topic(TopicID) 
ON DELETE CASCADE;

-- practice_exercise foreign key
ALTER TABLE practice_exercise 
ADD CONSTRAINT fk_practice_exercise_topic 
FOREIGN KEY (TopicID) REFERENCES topic(TopicID) 
ON DELETE CASCADE;

-- exam_question foreign key
ALTER TABLE exam_question 
ADD CONSTRAINT fk_exam_question_topic 
FOREIGN KEY (TopicID) REFERENCES topic(TopicID) 
ON DELETE CASCADE;

-- Verify table structures are correct
-- practice_video should have: VideoID, TopicID, VideoUrl, Difficulty
-- practice_exercise should have: ExerciseID, TopicID, AnswerOptions, CorrectAnswer, ContentType, ContentValue, Difficulty
-- exam_question should have: QuestionID, TopicID, QuestionPicURL, AnswerOptions, CorrectAnswer

-- Note: AnswerOptions is stored as JSON text and will be parsed/stringified in application code
-- Difficulty enums:
-- practice_video: 'intro', 'easy', 'medium', 'exam'
-- practice_exercise: 'easy', 'medium', 'exam' (no 'intro')
