-- SQL Script to setup Real-time Transactions in Supabase

-- 1. Create the 'students' table
CREATE TABLE IF NOT EXISTS public.students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    grade TEXT,
    total_fees NUMERIC DEFAULT 75000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create the 'transactions' table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT REFERENCES public.students(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    type TEXT DEFAULT 'credit',
    method TEXT,
    reference TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable Realtime for both tables
-- (Note: In some Supabase setups, you may also need to enable this via the Dashboard: Database -> Replication)
alter publication supabase_realtime add table public.students;
alter publication supabase_realtime add table public.transactions;

-- 4. Insert some mock data to get started
INSERT INTO public.students (id, name, grade, total_fees) VALUES
('S001', 'John Doe', 'Grade 5', 75000),
('S002', 'Jane Smith', 'Grade 3', 75000),
('S003', 'Michael Johnson', 'Grade 8', 75000)
ON CONFLICT (id) DO NOTHING;

-- Insert a sample transaction for John Doe
INSERT INTO public.transactions (student_id, amount, method, type) VALUES
('S001', 15000, 'mpesa', 'credit');

-- Allow clients to read data (fixes UI not updating)
CREATE POLICY "Enable read access for all users" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.students FOR SELECT USING (true);


-- 5. Create 'fee_structures' table
CREATE TABLE IF NOT EXISTS public.fee_structures (
    term TEXT PRIMARY KEY,
    amount NUMERIC NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

alter publication supabase_realtime add table public.fee_structures;

ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.fee_structures FOR SELECT USING (true);
CREATE POLICY "Enable inserts for all users" ON public.fee_structures FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable updates for all users" ON public.fee_structures FOR UPDATE USING (true);

INSERT INTO public.fee_structures (term, amount) VALUES
('Term 1', 30000),
('Term 2', 30000),
('Term 3', 30000)
ON CONFLICT (term) DO NOTHING;

-- 6. Create 'school_events' table for the Calendar of Events
CREATE TABLE IF NOT EXISTS public.school_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    color TEXT DEFAULT 'blue',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

alter publication supabase_realtime add table public.school_events;

ALTER TABLE public.school_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.school_events FOR SELECT USING (true);
CREATE POLICY "Enable inserts for all users" ON public.school_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable updates for all users" ON public.school_events FOR UPDATE USING (true);
CREATE POLICY "Enable deletes for all users" ON public.school_events FOR DELETE USING (true);

-- 7. Create 'class_fee_structures' table
CREATE TABLE IF NOT EXISTS public.class_fee_structures (
    grade TEXT PRIMARY KEY,
    fees NUMERIC NOT NULL DEFAULT 0,
    meals NUMERIC NOT NULL DEFAULT 0,
    exam NUMERIC NOT NULL DEFAULT 0,
    total NUMERIC NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

alter publication supabase_realtime add table public.class_fee_structures;

ALTER TABLE public.class_fee_structures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.class_fee_structures FOR SELECT USING (true);
CREATE POLICY "Enable inserts for all users" ON public.class_fee_structures FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable updates for all users" ON public.class_fee_structures FOR UPDATE USING (true);

INSERT INTO public.class_fee_structures (grade, fees, meals, exam, total) VALUES
('Playgroup, P1 and PP2', 3500, 1800, 300, 5600),
('Grades 1, 2 and 3', 4000, 2000, 300, 6300),
('Grade P4', 4200, 2100, 300, 6600),
('Grade 5', 4500, 2100, 300, 6900),
('Grade 6', 5000, 2100, 300, 7400)
ON CONFLICT (grade) DO NOTHING;


-- 8. Create 'exam_results' table
CREATE TABLE IF NOT EXISTS public.exam_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    term TEXT NOT NULL,
    academic_year INTEGER NOT NULL,
    student_grade TEXT NOT NULL,
    scores JSONB DEFAULT '{}'::jsonb,
    total_marks NUMERIC DEFAULT 0,
    average NUMERIC DEFAULT 0,
    performance_grade TEXT,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, term, academic_year)
);

alter publication supabase_realtime add table public.exam_results;

ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.exam_results FOR SELECT USING (true);
CREATE POLICY "Enable inserts for all users" ON public.exam_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable updates for all users" ON public.exam_results FOR UPDATE USING (true);
CREATE POLICY "Enable deletes for all users" ON public.exam_results FOR DELETE USING (true);
