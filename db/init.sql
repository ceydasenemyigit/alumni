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

-- 5. Job Postings Table
CREATE TABLE IF NOT EXISTS job_postings (
    id SERIAL PRIMARY KEY,
    title VARCHAR(160) NOT NULL,
    company VARCHAR(120) NOT NULL,
    location VARCHAR(100) NOT NULL DEFAULT 'Remote',
    employment_type VARCHAR(30) NOT NULL DEFAULT 'Full-Time' CHECK (employment_type IN ('Full-Time', 'Part-Time', 'Contract', 'Internship', 'Remote')),
    description TEXT NOT NULL,
    requirements TEXT,
    salary_range VARCHAR(80),
    application_url VARCHAR(255),
    posted_by_user_id INT REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    deadline DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Applications Table (N:M Action Table between Users & Job Postings)
CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_posting_id INT NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    resume_url VARCHAR(255),
    cover_letter TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN')),
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_applications_user_job UNIQUE (user_id, job_posting_id)
);

-- Indexes for performance & query optimization
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_grad_year ON users(graduation_year);
CREATE INDEX IF NOT EXISTS idx_announcements_category ON announcements(category);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_postings_active ON job_postings(is_active);
CREATE INDEX IF NOT EXISTS idx_job_postings_employment_type ON job_postings(employment_type);
CREATE INDEX IF NOT EXISTS idx_job_postings_posted_by ON job_postings(posted_by_user_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_created_at ON job_postings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_posting_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_user_job ON applications(user_id, job_posting_id);

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

-- Job Postings
INSERT INTO job_postings (id, title, company, location, employment_type, description, requirements, salary_range, application_url, posted_by_user_id, is_active, deadline) VALUES
(1, 'Junior Full-Stack Engineer', 'Global Tech Solutions', 'Istanbul / Hybrid', 'Full-Time', 'Join our core platform engineering team working with Node.js, Express, and PostgreSQL.', 'Proficiency in JavaScript/TypeScript, SQL, and REST APIs.', '$40,000 - $60,000', 'https://careers.globaltech.example.com/apply/1', 1, true, '2026-12-31'),
(2, 'Summer Software Engineering Intern', 'CloudScale Dynamics', 'Remote', 'Internship', 'Exciting 3-month paid summer internship program for junior/senior computer engineering students.', 'Strong foundational CS knowledge, data structures, and Git experience.', '$25/hour', 'mailto:internships@cloudscale.example.com', 3, true, '2026-05-15'),
(3, 'Senior Backend Architect', 'FinTech Horizon', 'Istanbul / Hybrid', 'Full-Time', 'Lead high-throughput payment processing architecture, distributed systems, and Kafka event streaming.', '5+ years Node.js or Go, PostgreSQL, Redis, Kubernetes, high availability system design.', '$85,000 - $110,000', 'https://careers.fintechhorizon.example.com/apply/backend', 1, true, '2026-11-30'),
(4, 'Data Analyst & BI Specialist', 'Apex Data Insights', 'Maslak, Istanbul', 'Full-Time', 'Transform raw product and alumni analytics into actionable business dashboards and forecasts.', 'SQL, Python/Pandas, PowerBI/Tableau, data warehousing fundamentals.', '$45,000 - $65,000', 'https://careers.apexinsights.example.com/data-analyst', 2, true, '2026-10-31'),
(5, 'DevOps & Cloud Infrastructure Engineer', 'Nexus Cyber Systems', 'Ankara / Hybrid', 'Full-Time', 'Manage AWS cloud infrastructure, Terraform IaC, GitHub Actions CI/CD pipelines, and observability.', 'AWS, Terraform, Docker, Kubernetes, Linux, Prometheus/Grafana.', '$70,000 - $95,000', 'https://careers.nexuscyber.example.com/devops', 3, true, '2026-12-15'),
(6, 'Part-Time Frontend Developer', 'Creative Wave Studio', 'Remote', 'Part-Time', 'Build modern responsive landing pages and interactive student/alumni portal user interfaces.', 'React/Next.js, Tailwind CSS, HTML5/CSS3, responsive design.', '$25 - $35/hour', 'mailto:jobs@creativewave.example.com', 1, true, '2026-08-31')
ON CONFLICT (id) DO NOTHING;

-- Applications (N:M Action Table Seeds)
INSERT INTO applications (id, user_id, job_posting_id, resume_url, cover_letter, status) VALUES
(1, 2, 2, 'https://storage.example.com/resumes/ayse_kaya_cv.pdf', 'I am very eager to apply for this summer internship program at CloudScale Dynamics to leverage my CS foundations.', 'REVIEWING'),
(2, 1, 2, 'https://storage.example.com/resumes/emre_yilmaz_cv.pdf', 'Interested in contributing and mentoring within cloud infrastructure systems.', 'PENDING')
ON CONFLICT (user_id, job_posting_id) DO NOTHING;

-- Reset sequences
SELECT setval('departments_id_seq', (SELECT MAX(id) FROM departments));
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('announcements_id_seq', (SELECT MAX(id) FROM announcements));
SELECT setval('job_postings_id_seq', (SELECT MAX(id) FROM job_postings));
SELECT setval('applications_id_seq', (SELECT MAX(id) FROM applications));

