-- Connectly platform schema (MySQL 8.0)
CREATE DATABASE IF NOT EXISTS connectly CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE connectly;

-- ========== USERS ==========
CREATE TABLE IF NOT EXISTS users (
  id                VARCHAR(36)  PRIMARY KEY,
  name              VARCHAR(120) NOT NULL,
  email             VARCHAR(160) NOT NULL UNIQUE,
  password_hash     VARCHAR(255) NULL,          -- NULL for SSO-only accounts
  avatar            VARCHAR(500),
  role              ENUM('ceo','executive','admin','hr','manager','host','employee','guest') NOT NULL DEFAULT 'employee',
  department        VARCHAR(120),
  title             VARCHAR(160),
  status            ENUM('online','away','busy','offline') NOT NULL DEFAULT 'offline',
  timezone          VARCHAR(40),
  phone             VARCHAR(40),
  location          VARCHAR(160),
  bio               TEXT,
  skills            JSON,
  meetings_hosted   INT DEFAULT 0,
  meetings_attended INT DEFAULT 0,
  is_verified       TINYINT(1) NOT NULL DEFAULT 0,
  two_fa_enabled    TINYINT(1) NOT NULL DEFAULT 0,
  sso_provider      VARCHAR(40) NULL,
  joined            DATE,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  INDEX idx_users_department (department),
  INDEX idx_users_status (status)
) ENGINE=InnoDB;

-- ========== REFRESH TOKENS ==========
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          VARCHAR(36) PRIMARY KEY,
  user_id     VARCHAR(36) NOT NULL,
  token       VARCHAR(500) NOT NULL,
  expires_at  TIMESTAMP NOT NULL,
  revoked     TINYINT(1) NOT NULL DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_refresh_user (user_id)
) ENGINE=InnoDB;

-- ========== OTP / PASSWORD RESET CODES ==========
CREATE TABLE IF NOT EXISTS auth_codes (
  id          VARCHAR(36) PRIMARY KEY,
  user_id     VARCHAR(36) NOT NULL,
  code        VARCHAR(255) NOT NULL,   -- OTP digits, or reset token, or 2FA code
  type        ENUM('otp','2fa','password_reset') NOT NULL,
  expires_at  TIMESTAMP NOT NULL,
  consumed    TINYINT(1) NOT NULL DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_authcodes_user_type (user_id, type)
) ENGINE=InnoDB;

-- ========== MEETINGS ==========
CREATE TABLE IF NOT EXISTS meetings (
  id              VARCHAR(36) PRIMARY KEY,
  title           VARCHAR(200) NOT NULL,
  type            ENUM('instant','scheduled','recurring') NOT NULL DEFAULT 'scheduled',
  meeting_date    DATE NOT NULL,
  meeting_time    TIME NOT NULL,
  duration        INT NOT NULL DEFAULT 30,       -- minutes
  host_id         VARCHAR(36) NOT NULL,
  status          ENUM('upcoming','live','ended','cancelled') NOT NULL DEFAULT 'upcoming',
  password        VARCHAR(60) NULL,
  recording       TINYINT(1) NOT NULL DEFAULT 0,
  description     TEXT,
  meeting_code    VARCHAR(60) NOT NULL UNIQUE,
  join_url        VARCHAR(500),
  background      VARCHAR(500),
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_meetings_date (meeting_date),
  INDEX idx_meetings_status (status),
  INDEX idx_meetings_host (host_id)
) ENGINE=InnoDB;

-- ========== MEETING PARTICIPANTS ==========
CREATE TABLE IF NOT EXISTS meeting_participants (
  id             VARCHAR(36) PRIMARY KEY,
  meeting_id     VARCHAR(36) NOT NULL,
  user_id        VARCHAR(36) NOT NULL,
  co_host        TINYINT(1) NOT NULL DEFAULT 0,
  perm_mic       TINYINT(1) NOT NULL DEFAULT 1,
  perm_video     TINYINT(1) NOT NULL DEFAULT 1,
  perm_chat      TINYINT(1) NOT NULL DEFAULT 1,
  perm_screen    TINYINT(1) NOT NULL DEFAULT 0,
  joined_at      TIMESTAMP NULL,
  left_at        TIMESTAMP NULL,
  FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_meeting_user (meeting_id, user_id),
  INDEX idx_participants_meeting (meeting_id)
) ENGINE=InnoDB;

-- ========== RECORDINGS ==========
CREATE TABLE IF NOT EXISTS recordings (
  id            VARCHAR(36) PRIMARY KEY,
  meeting_id    VARCHAR(36) NOT NULL,
  title         VARCHAR(200) NOT NULL,
  recorded_date DATE NOT NULL,
  duration      INT NOT NULL DEFAULT 0,     -- seconds
  file_size     INT NOT NULL DEFAULT 0,     -- MB
  format        VARCHAR(10) NOT NULL DEFAULT 'mp4',
  url           VARCHAR(500),
  thumbnail     VARCHAR(500),
  status        ENUM('processing','ready','failed') NOT NULL DEFAULT 'processing',
  participants  INT DEFAULT 0,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
  INDEX idx_recordings_meeting (meeting_id)
) ENGINE=InnoDB;

-- ========== CHAT MESSAGES ==========
CREATE TABLE IF NOT EXISTS messages (
  id           VARCHAR(36) PRIMARY KEY,
  from_user_id VARCHAR(36) NOT NULL,
  to_user_id   VARCHAR(36) NULL,        -- NULL when channel_id is used (group chat)
  channel_id   VARCHAR(60) NULL,
  text         TEXT NOT NULL,
  msg_type     ENUM('direct','channel') NOT NULL DEFAULT 'direct',
  reply_to     VARCHAR(36) NULL,
  is_read      TINYINT(1) NOT NULL DEFAULT 0,
  is_pinned    TINYINT(1) NOT NULL DEFAULT 0,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_messages_thread (from_user_id, to_user_id),
  INDEX idx_messages_channel (channel_id)
) ENGINE=InnoDB;

-- ========== FILES ==========
CREATE TABLE IF NOT EXISTS files (
  id           VARCHAR(36) PRIMARY KEY,
  owner_id     VARCHAR(36) NOT NULL,
  meeting_id   VARCHAR(36) NULL,
  name         VARCHAR(255) NOT NULL,
  size         INT NOT NULL DEFAULT 0,
  mime_type    VARCHAR(120),
  storage_path VARCHAR(500) NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ========== NOTIFICATIONS ==========
CREATE TABLE IF NOT EXISTS notifications (
  id          VARCHAR(36) PRIMARY KEY,
  user_id     VARCHAR(36) NOT NULL,
  type        VARCHAR(60) NOT NULL,
  priority    ENUM('info','warning','urgent') NOT NULL DEFAULT 'info',
  title       VARCHAR(200) NOT NULL,
  description VARCHAR(500),
  link        VARCHAR(300),
  is_read     TINYINT(1) NOT NULL DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notifications_user (user_id, is_read)
) ENGINE=InnoDB;

-- ========== ANALYTICS (simple event/aggregate log for dashboards) ==========
CREATE TABLE IF NOT EXISTS analytics_events (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id     VARCHAR(36) NULL,
  meeting_id  VARCHAR(36) NULL,
  event_type  VARCHAR(60) NOT NULL,   -- e.g. meeting_started, meeting_ended, login, recording_created
  metadata    JSON,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE SET NULL,
  INDEX idx_analytics_type (event_type),
  INDEX idx_analytics_created (created_at)
) ENGINE=InnoDB;

-- ========== SECURITY / AUDIT LOG ==========
CREATE TABLE IF NOT EXISTS audit_log (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id     VARCHAR(36) NULL,
  action      VARCHAR(120) NOT NULL,
  ip_address  VARCHAR(64),
  user_agent  VARCHAR(255),
  metadata    JSON,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_audit_user (user_id),
  INDEX idx_audit_action (action)
) ENGINE=InnoDB;
