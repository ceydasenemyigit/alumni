-- ===================================================
-- Alumni Tracking System - PostgreSQL Database Initialization
-- ===================================================

-- Create Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    faculty VARCHAR(120) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(160) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    first_name VARCHAR(80) NOT NULL,
    last_name VARCHAR(80) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'ALUMNI' CHECK (role IN ('STUDENT', 'ALUMNI', 'ADMIN')),
    department_id INT REFERENCES departments(id) ON DELETE SET NULL,
    department_name VARCHAR(120),
    graduation_year INT CHECK (graduation_year BETWEEN 1950 AND 2035),
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Alumni Profiles (Extended metadata for graduates)
CREATE TABLE IF NOT EXISTS alumni_profiles (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    current_company VARCHAR(120),
    current_title VARCHAR(120),
    industry VARCHAR(80),
    city VARCHAR(80),
    country VARCHAR(80) DEFAULT 'Turkey',
    linkedin_url VARCHAR(255),
    github_url VARCHAR(255),
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(100) NOT NULL DEFAULT 'Alumni Administration',
    category VARCHAR(50) NOT NULL DEFAULT 'General' CHECK (category IN ('Event', 'Career', 'Academic', 'General')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance & query optimization
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_grad_year ON users(graduation_year);
CREATE INDEX IF NOT EXISTS idx_announcements_category ON announcements(category);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);

-- ===================================================
-- Initial Seed Data
-- ===================================================

-- Departments
INSERT INTO departments (id, name, faculty) VALUES
(1, 'Computer Engineering', 'Faculty of Engineering'),
(2, 'Electrical & Electronics Engineering', 'Faculty of Engineering'),
(3, 'Industrial Engineering', 'Faculty of Engineering'),
(4, 'Business Administration', 'Faculty of Economics and Administrative Sciences')
ON CONFLICT (id) DO NOTHING;

-- Users
INSERT INTO users (id, email, first_name, last_name, role, department_id, department_name, graduation_year, is_verified) VALUES
(1, 'emre.yilmaz@alumni.istanbul.edu.tr', 'Emre', 'Yılmaz', 'ALUMNI', 1, 'Computer Engineering', 2024, true),
(2, 'ayse.kaya@alumni.istanbul.edu.tr', 'Ayşe', 'Kaya', 'STUDENT', 1, 'Computer Engineering', 2025, true),
(3, 'admin@alumni.istanbul.edu.tr', 'Admin', 'User', 'ADMIN', 1, 'Computer Engineering', 2020, true)
ON CONFLICT (id) DO NOTHING;

-- Alumni Profiles
INSERT INTO alumni_profiles (user_id, current_company, current_title, industry, city, country, linkedin_url, bio) VALUES
(1, 'Global Tech Solutions', 'Software Engineer', 'Information Technology', 'Istanbul', 'Turkey', 'https://linkedin.com/in/emreyilmaz', 'Passionate full-stack developer and Istanbul University alumnus.')
ON CONFLICT (user_id) DO NOTHING;

-- Announcements
INSERT INTO announcements (id, title, content, author, category) VALUES
(1, 'Annual Alumni Homecoming 2026', 'Join us for the annual Istanbul University Alumni Gathering on campus with keynote speakers, networking sessions, and gala dinner.', 'Alumni Relations Office', 'Event'),
(2, 'Tech Mentorship Program Applications Open', 'We are pairing recent graduates with experienced alumni in the tech industry. Applications close by the end of this month.', 'Career Development Center', 'Career'),
(3, 'Campus Library Digital Access for Alumni', 'All registered alumni now have off-campus digital access to university academic journals and research repositories.', 'University Library', 'General')
ON CONFLICT (id) DO NOTHING;

-- Reset sequences
SELECT setval('departments_id_seq', (SELECT MAX(id) FROM departments));
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('announcements_id_seq', (SELECT MAX(id) FROM announcements));
