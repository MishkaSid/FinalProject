-- Add CASCADE DELETE to topic->course foreign key constraint (Simple Version)
-- Date: 2025-01-XX
-- Description: Simple version that assumes the default MySQL constraint name 'topic_ibfk_1'
--              If this fails, use the dynamic version: add-course-cascade-delete.sql

-- Drop the existing foreign key constraint
ALTER TABLE topic 
DROP FOREIGN KEY topic_ibfk_1;

-- Recreate the foreign key constraint with ON DELETE CASCADE
ALTER TABLE topic 
ADD CONSTRAINT fk_topic_course 
FOREIGN KEY (CourseID) REFERENCES course(CourseID) 
ON DELETE CASCADE;

-- Verify: Run this to check the constraint was created correctly:
-- SHOW CREATE TABLE topic;

