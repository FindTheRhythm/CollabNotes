-- seeds_initial_data.sql

-- Insert admin user (password: Admin@1234)
INSERT INTO users (email, username, password_hash, role)
VALUES (
    'admin@collabnotes.local',
    'admin',
    '$2a$10$8YEj8rN8rQpI1ZsXhfIVpOKJvV5xGsIpQS0J7J9ZjK5vQsN8nQVpa',
    'ADMIN'
)
ON CONFLICT (email) DO NOTHING;

-- Insert test users (password: User@1234 for all)
INSERT INTO users (email, username, password_hash, role)
VALUES 
    (
        'user1@collabnotes.local',
        'user1',
        '$2a$10$8YEj8rN8rQpI1ZsXhfIVpOKJvV5xGsIpQS0J7J9ZjK5vQsN8nQVpa',
        'USER'
    ),
    (
        'user2@collabnotes.local',
        'user2',
        '$2a$10$8YEj8rN8rQpI1ZsXhfIVpOKJvV5xGsIpQS0J7J9ZjK5vQsN8nQVpa',
        'USER'
    ),
    (
        'editor@collabnotes.local',
        'editor',
        '$2a$10$8YEj8rN8rQpI1ZsXhfIVpOKJvV5xGsIpQS0J7J9ZjK5vQsN8nQVpa',
        'EDITOR'
    )
ON CONFLICT (email) DO NOTHING;
