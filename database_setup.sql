-- Supabase Database Setup SQL
-- Copy and paste this script into the SQL Editor in your Supabase Dashboard

-- 1. Create Profile Table
CREATE TABLE public.profile (
    id INT PRIMARY KEY,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    hero_tag TEXT,
    hero_desc TEXT,
    about_text_1 TEXT,
    about_text_2 TEXT,
    education_year TEXT,
    education_degree TEXT,
    education_inst TEXT,
    education_desc TEXT,
    email TEXT,
    location TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on Profile
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;

-- 2. Create Skills Table
CREATE TABLE public.skills (
    id SERIAL PRIMARY KEY,
    category TEXT NOT NULL, -- e.g., 'Languages', 'Web Technologies', 'Tools', 'Soft Skills'
    name TEXT NOT NULL
);

-- Enable RLS on Skills
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

-- 3. Create Projects Table
CREATE TABLE public.projects (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL, -- e.g., 'Web Application', 'Web Design'
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    tags TEXT[] NOT NULL, -- Array of strings for project tags
    github_url TEXT NOT NULL
);

-- Enable RLS on Projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-----------------------------------------------------------
-- RLS POLICIES (Access Rules)
-----------------------------------------------------------

-- Profile Policies
CREATE POLICY "Allow public read access to profile" ON public.profile FOR SELECT USING (true);
CREATE POLICY "Allow admin write access to profile" ON public.profile FOR ALL TO authenticated USING (true);

-- Skills Policies
CREATE POLICY "Allow public read access to skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Allow admin write access to skills" ON public.skills FOR ALL TO authenticated USING (true);

-- Projects Policies
CREATE POLICY "Allow public read access to projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Allow admin write access to projects" ON public.projects FOR ALL TO authenticated USING (true);

-----------------------------------------------------------
-- INSERT SAMPLE PORTFOLIO DATA
-----------------------------------------------------------

-- Insert Initial Profile
INSERT INTO public.profile (
    id, name, title, hero_tag, hero_desc, 
    about_text_1, about_text_2, 
    education_year, education_degree, education_inst, education_desc, 
    email, location
) VALUES (
    1, 
    'Shoaib Mahin', 
    'Computer Science & Engineering Student', 
    'Welcome to my space', 
    'I build clean, efficient, and user-centric web applications and software. Passionate about learning new technologies and solving complex computational problems.',
    'I am currently pursuing a Bachelor''s degree in Computer Science & Engineering (CSE). From my early semesters, I fell in love with algorithm design, software architecture, and the endless possibilities of web development.',
    'My academic journey has equipped me with a strong foundation in core computer science principles, including Data Structures, Algorithms, Database Management Systems, and Object-Oriented Programming. I enjoy transforming abstract logic into robust, functional software applications.',
    '2023 - Present',
    'B.Sc. in Computer Science & Engineering',
    'Department of CSE',
    'Focusing on software development, data structures, analysis of algorithms, and web engineering. Active participant in coding contests and programming clubs.',
    'shoaib.mahin@example.com',
    'Dhaka, Bangladesh'
) ON CONFLICT (id) DO NOTHING;

-- Insert Initial Skills
INSERT INTO public.skills (category, name) VALUES
('Languages', 'C/C++'),
('Languages', 'Java'),
('Languages', 'Python'),
('Languages', 'PHP'),
('Languages', 'JavaScript'),
('Web Technologies', 'HTML5'),
('Web Technologies', 'CSS3'),
('Web Technologies', 'Bootstrap'),
('Web Technologies', 'React.js'),
('Web Technologies', 'MySQL'),
('Tools & Platforms', 'Git & GitHub'),
('Tools & Platforms', 'VS Code'),
('Tools & Platforms', 'XAMPP'),
('Tools & Platforms', 'Linux'),
('Tools & Platforms', 'Figma'),
('Soft Skills', 'Problem Solving'),
('Soft Skills', 'Teamwork'),
('Soft Skills', 'Quick Learner'),
('Soft Skills', 'Communication');

-- Insert Initial Projects
INSERT INTO public.projects (type, title, description, tags, github_url) VALUES
('Web Application', 'Student Database Portal', 'A web portal developed for academic institutes to manage student enrollments, academic transcripts, and attendance securely.', ARRAY['PHP', 'MySQL', 'HTML', 'CSS'], 'https://github.com'),
('Web Design', 'Minimalist Portfolio', 'My personal digital portfolio showcasing my profile, academic projects, technical skills, and a way to reach out to me.', ARRAY['HTML', 'CSS', 'Vanilla JS'], 'https://github.com'),
('Frontend JS', 'Algorithm Visualizer', 'An interactive, graphical web app that visualizes sorting (Bubble, Quick, Merge) and pathfinding algorithms in real-time.', ARRAY['JavaScript', 'HTML5', 'CSS Grid'], 'https://github.com');
