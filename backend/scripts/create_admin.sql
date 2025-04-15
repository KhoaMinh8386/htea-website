INSERT INTO users (username, email, password, role, full_name, created_at, updated_at)
VALUES (
    'adminkhoa',
    'adminkhoa@example.com',
    '$2b$10$CbV0HxE.uiQKsSgzf6fSUeUErO1LRf8XnLLDlSB4fMj9DGFpx3ffG',
    'admin',
    'Khoa Admin',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
); 