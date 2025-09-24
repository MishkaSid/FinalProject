-- Migration: Create practice tracking tables
-- Date: 2025-01-XX
-- Description: Add tables for tracking student practice attempts and video watch time

-- Create practice_attempt table
CREATE TABLE IF NOT EXISTS practice_attempt (
  AttemptID     INT AUTO_INCREMENT PRIMARY KEY,
  UserID        INT NOT NULL,
  ExerciseID    INT NOT NULL,
  SelectedAnswer VARCHAR(255) NOT NULL,
  IsCorrect     TINYINT(1) NOT NULL,
  AttemptedAt   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX (UserID), 
  INDEX (ExerciseID),
  FOREIGN KEY (ExerciseID) REFERENCES practice_exercise(ExerciseID),
  FOREIGN KEY (UserID) REFERENCES users(UserID)
);

-- Create video_watch table
CREATE TABLE IF NOT EXISTS video_watch (
  WatchID    INT AUTO_INCREMENT PRIMARY KEY,
  UserID     INT NOT NULL,
  VideoID    INT NOT NULL,
  Seconds    INT NOT NULL,
  WatchedAt  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX (UserID), 
  INDEX (VideoID),
  FOREIGN KEY (VideoID) REFERENCES practice_video(VideoID),
  FOREIGN KEY (UserID) REFERENCES users(UserID)
);

-- Add indexes for better query performance
CREATE INDEX idx_practice_attempt_user_date ON practice_attempt(UserID, AttemptedAt);
CREATE INDEX idx_video_watch_user_date ON video_watch(UserID, WatchedAt);
