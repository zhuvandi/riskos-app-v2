import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xlphcwgflyocqlqybqxt.supabase.co';
const supabaseAnonKey = 'sb_publishable_qyVQsgOpnvZmyQ82rwlRaA_RqnkWlR0';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testerE2E() {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'test@riskos.com',
        password: 'password123456',
    });

    console.log("Login User:", signInData?.user?.id);
    console.log("Login Error:", signInError?.message);
}
testerE2E();
