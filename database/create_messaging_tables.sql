CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    sender_role VARCHAR(32) NOT NULL,
    recipient_id INT NOT NULL,
    recipient_role VARCHAR(32) NOT NULL,
    subject VARCHAR(255),
    body TEXT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_sender_recipient (sender_id, recipient_id),
    INDEX idx_recipient_read (recipient_id, is_read)
);

CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_role VARCHAR(32) NOT NULL,
    channel ENUM('push', 'email') NOT NULL DEFAULT 'push',
    title VARCHAR(255) NOT NULL,
    message TEXT,
    payload TEXT,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_read (user_id, is_read)
);
