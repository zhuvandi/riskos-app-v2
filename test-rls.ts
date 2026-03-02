import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xlphcwgflyocqlqybqxt.supabase.co';
const supabaseAnonKey = 'sb_publishable_qyVQsgOpnvZmyQ82rwlRaA_RqnkWlR0';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testerE2E() {
    console.log("Starting Alternative Payload Test...");

    const testEmail = 'test@riskos.com';
    const testPassword = 'password123456';

    // Login
    let user: any = null;
    let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
    });

    if (signInError) {
        console.error("Login failed, attempting signup...", signInError.message);
        const { data, error } = await supabase.auth.signUp({ email: testEmail, password: testPassword });
        user = data?.user || null;
    } else {
        user = signInData?.user || null;
    }

    if (!user) {
        console.error("No valid user...");
        return;
    }

    console.log("Tester User Authenticated Automatically:", user.id);

    // Try without user_id
    let { error: err1 } = await supabase.from('trades').insert([{
        pair: 'BTC/USDT',
        type: 'BUY',
        amount: 2.0,
        entry_price: 65000,
        stop_loss: 63000,
        emotion_score: 9
    }]);
    console.log("Result WITHOUT user_id:", err1?.message || "SUCCESS");

    // Try with only requested fields
    let { error: err2 } = await supabase.from('trades').insert([{
        user_id: user.id,
        pair: 'BTC/USDT',
        type: 'BUY',
        amount: 2.0,
        entry_price: 65000,
        stop_loss: 63000,
        emotion_score: 9
    }]);
    console.log("Result WITH user_id:", err2?.message || "SUCCESS");
}

testerE2E();
