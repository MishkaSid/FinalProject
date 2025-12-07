-- Add CASCADE DELETE to topic->course foreign key constraint
-- Date: 2025-01-XX
-- Description: Modify the foreign key constraint between topic and course tables
--              to enable cascading deletes. When a course is deleted, all related
--              topics (and their nested content) will be automatically deleted.
--
-- IMPORTANT: Run this script to enable cascading deletes for course deletion.
-- After running this, deleting a course will automatically delete:
--   - All topics in that course
--   - All practice_exercise records for those topics
--   - All practice_video records for those topics  
--   - All exam_question records for those topics

-- Step 1: Find the existing foreign key constraint name
-- Run this query first to find your constraint name:
-- SELECT CONSTRAINT_NAME 
-- FROM information_schema.KEY_COLUMN_USAGE 
-- WHERE TABLE_SCHEMA = DATABASE() 
--   AND TABLE_NAME = 'topic' 
--   AND COLUMN_NAME = 'CourseID' 
--   AND REFERENCED_TABLE_NAME = 'course';

-- Step 2: Drop the existing foreign key constraint
-- Replace 'topic_ibfk_1' with the actual constraint name from Step 1 if different
SET @constraint_name = (
  SELECT CONSTRAINT_NAME 
  FROM information_schema.KEY_COLUMN_USAGE 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'topic' 
    AND COLUMN_NAME = 'CourseID' 
    AND REFERENCED_TABLE_NAME = 'course'
  LIMIT 1
);

-- Drop the existing constraint if it exists
SET @drop_sql = CONCAT('ALTER TABLE topic DROP FOREIGN KEY ', @constraint_name);
PREPARE stmt FROM @drop_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 3: Recreate the foreign key constraint with ON DELETE CASCADE
ALTER TABLE topic 
ADD CONSTRAINT fk_topic_course 
FOREIGN KEY (CourseID) REFERENCES course(CourseID) 
ON DELETE CASCADE;

-- Verify the constraint was created correctly
-- Run: SHOW CREATE TABLE topic; to verify it shows ON DELETE CASCADE

