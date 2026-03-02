import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = 'https://xlphcwgflyocqlqybqxt.supabase.co';
const supabaseAnonKey = 'sb_publishable_qyVQsgOpnvZmyQ82rwlRaA_RqnkWlR0';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testerE2E() {
    console.log("Starting E2E Tester DB Test...");

    const testEmail = 'test@riskos.com';
    const testPassword = 'password123456';

    let user: any = null;

    // Attempt Login
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
    });

    if (signInError) {
        console.log("Login failed, attempting signup for tester...");
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
        });

        if (signUpError) {
            console.error("Critical Auth Error on tester signup:", signUpError.message);
            return;
        }
        user = signUpData?.user || null;
    } else {
        user = signInData?.user || null;
    }

    if (!user) {
        console.error("No valid user session obtained.");
        return;
    }

    console.log("Tester User Authenticated Automatically:", user.id);
    console.log("Attempting Insert Trade as Tester...");

    const { data: data2, error: err2 } = await supabase.from('trades').insert([{
        user_id: user.id,
        pair: 'BTC/USDT',
        type: 'BUY',
        amount: 2.0,
        entry_price: 65000,
        stop_loss: 63000,
        emotion_score: 9
    }]);

    if (err2) {
        console.error("Insert Failed!", err2.message, err2.code);
    } else {
        console.log("Insert Success! Trades table accepted the BTC/USDT row.");
    }
}

testerE2E();
