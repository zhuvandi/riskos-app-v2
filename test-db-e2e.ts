import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = 'https://xlphcwgflyocqlqybqxt.supabase.co';
const supabaseAnonKey = 'sb_publishable_qyVQsgOpnvZmyQ82rwlRaA_RqnkWlR0';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function endToEndTest() {
    console.log("Starting E2E DB Test...");

    const testEmail = 'realtest@riskos.com';
    const testPassword = 'Password123!';

    let user;

    // 1. Try to login
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
    });

    if (signInError) {
        console.log("Login failed, attempting signup...");
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
        });

        if (signUpError) {
            console.error("Critical Auth Error:", signUpError.message);
            return;
        }
        user = signUpData.user;
    } else {
        user = signInData.user;
    }

    if (!user) {
        console.error("No valid user session obtained.");
        return;
    }

    console.log("User Authenticated Successfully:", user.id);
    console.log("Attempting Insert Trade...");

    const { data: data2, error: err2 } = await supabase.from('trades').insert([{
        user_id: user.id,
        pair: 'SOL/USD',
        type: 'BUY',
        amount: 15.5,
        entry_price: 154.20,
        stop_loss: 140.00,
        emotion_score: 3
    }]);

    if (err2) {
        console.error("Insert Failed!", err2.message, err2.details, err2.hint, err2.code);
    } else {
        console.log("Insert Success! Trades table accepted the row.");

        // Let's verify we can read it back and that length > 0
        const { data: readData, error: readError } = await supabase.from('trades').select('*').eq('user_id', user.id);
        if (readError) {
            console.error("Read Error:", readError.message);
        } else {
            console.log(`Read Success! Found ${readData.length} records for user.`);
            console.log(readData[0]);
        }
    }

    console.log("\nFinished E2E DB Test.");
}

endToEndTest();
