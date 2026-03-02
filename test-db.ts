import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = 'https://xlphcwgflyocqlqybqxt.supabase.co';
const supabaseAnonKey = 'sb_publishable_qyVQsgOpnvZmyQ82rwlRaA_RqnkWlR0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTest() {
    console.log("Starting DB Test...");

    // Test 1: Insert without a user session (to see if RLS blocks it)
    console.log("Attempt 1: Insert without authentication...");
    const { data: data1, error: err1 } = await supabase.from('trades').insert([{
        pair: 'TEST/USD',
        type: 'BUY',
        amount: 1.5,
        entry_price: 50000,
        emotion_score: 5
    }]);

    if (err1) {
        console.error("Attempt 1 Failed:", err1.message, err1.details, err1.hint, err1.code);
    } else {
        console.log("Attempt 1 Success:", data1);
    }

    console.log("\nFinished DB Test.");
}

runTest();
