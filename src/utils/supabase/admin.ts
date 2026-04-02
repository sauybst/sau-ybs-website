import { createClient } from '@supabase/supabase-js';

// FAIL-FAST: Service Role Key yoksa sistem çalışmaz.
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('FATAL ERROR: Supabase URL veya Service Role Key eksik!');
}

// Bu istemci (client) RLS kurallarını bypass eder. 
export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);