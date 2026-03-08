-- SAU YBS Supabase Schema and RLS Policies

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles." ON public.profiles FOR SELECT USING (auth.jwt() ->> 'role' = 'admin' OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- 2. Board Members
CREATE TABLE IF NOT EXISTS public.board_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term_year TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  full_name TEXT NOT NULL,
  board_role TEXT NOT NULL,
  image_url TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for board_members
ALTER TABLE public.board_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Board members viewable by everyone." ON public.board_members FOR SELECT USING (true);
CREATE POLICY "Only authenticated users can insert board_members." ON public.board_members FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can update board_members." ON public.board_members FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can delete board_members." ON public.board_members FOR DELETE USING (auth.role() = 'authenticated');

-- 3. Events
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  registration_url TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events viewable by everyone." ON public.events FOR SELECT USING (true);
CREATE POLICY "Only authenticated users can insert events." ON public.events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can update events." ON public.events FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can delete events." ON public.events FOR DELETE USING (auth.role() = 'authenticated');


-- 4. Blogs
CREATE TABLE IF NOT EXISTS public.blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  author_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  tur TEXT
);

-- RLS for blogs
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Blogs viewable by everyone." ON public.blogs FOR SELECT USING (true);
CREATE POLICY "Only authenticated users can insert blogs." ON public.blogs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can update blogs." ON public.blogs FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can delete blogs." ON public.blogs FOR DELETE USING (auth.role() = 'authenticated');

-- 5. Projects
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  developer_names TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  project_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Projects viewable by everyone." ON public.projects FOR SELECT USING (true);
CREATE POLICY "Only authenticated users can insert projects." ON public.projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can update projects." ON public.projects FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can delete projects." ON public.projects FOR DELETE USING (auth.role() = 'authenticated');

-- 6. Job Postings
CREATE TABLE IF NOT EXISTS public.job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  company_logo_url TEXT,
  position_name TEXT NOT NULL,
  work_model TEXT NOT NULL,
  description TEXT NOT NULL,
  deadline_date TIMESTAMP WITH TIME ZONE,
  application_link TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for job_postings
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Job postings viewable by everyone." ON public.job_postings FOR SELECT USING (true);
CREATE POLICY "Only authenticated users can insert job_postings." ON public.job_postings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can update job_postings." ON public.job_postings FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can delete job_postings." ON public.job_postings FOR DELETE USING (auth.role() = 'authenticated');

-- 7. Trigger to auto-create profiles for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role)
  VALUES (new.id, 'Yeni', 'Kullanıcı', 'editor');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sadece tetikleyiciyi ekliyoruz. Eğer trigger daha önceden varsa hata vermemesi için DROP IF EXISTS kullanabiliriz:
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
