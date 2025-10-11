-- Create site_visit table for tracking user visits
-- This table is used for analytics to track site visits over time

CREATE TABLE IF NOT EXISTS site_visit (
  VisitID INT AUTO_INCREMENT PRIMARY KEY,
  UserID VARCHAR(20) NOT NULL,
  VisitedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Path VARCHAR(255),
  
  -- Add index for common queries
  INDEX idx_site_visit_user (UserID),
  INDEX idx_site_visit_date (VisitedAt),
  
  -- Foreign key to users table
  CONSTRAINT fk_site_visit_user 
    FOREIGN KEY (UserID) 
    REFERENCES users(UserID) 
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

