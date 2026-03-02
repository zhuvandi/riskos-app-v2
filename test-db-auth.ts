import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = 'https://xlphcwgflyocqlqybqxt.supabase.co';
const supabaseAnonKey = 'sb_publishable_qyVQsgOpnvZmyQ82rwlRaA_RqnkWlR0';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runAuthTest() {
    console.log("Starting Auth DB Test...");

    // Sign up a fake user to get a verified session for RLS
    console.log("Attempt 2: Authenticating fake user...");
    const testEmail = `testuser_${Date.now()}@example.com`;
    const testPassword = 'Password123!';

    // Attempt sign up - wait for the session
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
    });

    if (authError && authError.message.includes('already registered')) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPassword,
        });
        if (error) {
            console.error("Login failed", error);
            return;
        }
    } else if (authError) {
        console.error("Auth Failed:", authError.message);
        return;
    }

    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
        console.error("No valid user session obtained.");
        return;
    }

    console.log("User Authenticated:", user.id);
    console.log("Attempting Insert with user ID...");

    const { data: data2, error: err2 } = await supabase.from('trades').insert([{
        user_id: user.id,
        pair: 'ETH/USD',
        type: 'SELL',
        amount: 2.0,
        entry_price: 3200,
        emotion_score: 8
    }]);

    if (err2) {
        console.error("Insert Failed:", err2.message, err2.details, err2.hint, err2.code);
    } else {
        console.log("Insert Success! Trades table accepted the row.");

        // Let's verify we can read it back
        const { data: readData, error: readError } = await supabase.from('trades').select('*').eq('user_id', user.id);
        console.log("Read Back Data:", readData);
    }

    console.log("\nFinished Auth DB Test.");
}

runAuthTest();
