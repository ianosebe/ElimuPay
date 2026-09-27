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
