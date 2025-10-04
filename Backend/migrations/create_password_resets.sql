CREATE TABLE IF NOT EXISTS password_resets (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  used TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_password_resets_user_id (user_id),
  UNIQUE KEY uniq_password_resets_token (token_hash),
  CONSTRAINT fk_password_resets_user
    FOREIGN KEY (user_id) REFERENCES users(UserID) ON DELETE CASCADE
);
