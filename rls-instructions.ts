import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xlphcwgflyocqlqybqxt.supabase.co';
// The service_role key has the power to bypass RLS. For demo and fixing purposes, we will supply instructions or attempt a patch.
const supabaseAnonKey = 'sb_publishable_qyVQsgOpnvZmyQ82rwlRaA_RqnkWlR0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkFix() {
    console.log("RiskOS: The Supabase table 'trades' currently has Row-Level Security (RLS) enabled but lacks an insert policy for authenticated users.");
    console.log("In Supabase SQL Editor, you must run:");
    console.log(`
        CREATE POLICY "Enable insert for authenticated users only"
        ON "public"."trades"
        AS PERMISSIVE FOR INSERT
        TO authenticated
        WITH CHECK (true);
        
        CREATE POLICY "Enable select for users based on user_id"
        ON "public"."trades"
        AS PERMISSIVE FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);
    `);
}

checkFix();
