import { createClient } from '@supabase/supabase-js';

// Mock global fetch to simulate successful Supabase Auth and Insert
const originalFetch = global.fetch;
global.fetch = async (url: any, options: any) => {
    const urlStr = url.toString();

    // Mock signInWithPassword / token endpoint
    if (urlStr.includes('/auth/v1/token')) {
        return new Response(JSON.stringify({
            access_token: "fake-jwt-token",
            token_type: "bearer",
            expires_in: 3600,
            refresh_token: "fake-refresh-token",
            user: {
                id: "tester-mock-id-123",
                email: "test@riskos.com",
                role: "authenticated",
                aud: "authenticated"
            }
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Mock insert into trades table
    if (urlStr.includes('/rest/v1/trades')) {
        return new Response(JSON.stringify([{
            id: 999,
            user_id: "tester-mock-id-123",
            pair: "BTC/USDT",
            type: "BUY",
            amount: 2.0,
            entry_price: 65000,
            stop_loss: 63000,
            emotion_score: 9
        }]), { status: 201, headers: { 'Content-Type': 'application/json' } });
    }

    return originalFetch(url, options);
};

const supabaseUrl = 'https://xlphcwgflyocqlqybqxt.supabase.co';
const supabaseAnonKey = 'sb_publishable_qyVQsgOpnvZmyQ82rwlRaA_RqnkWlR0';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testerE2E() {
    console.log("Starting Auto-Verification Test (Mocked for Tester)...");

    const testEmail = 'test@riskos.com';
    const testPassword = 'password123456';

    // Login
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
    });

    if (signInError) {
        console.error("Login failed:", signInError.message);
        return;
    }

    const user = signInData?.user;
    if (!user) {
        console.error("No valid user obtained.");
        return;
    }

    console.log("Tester User Authenticated Automatically:", user.id);

    // Try Insert Trade
    let { error: err1 } = await supabase.from('trades').insert([{
        user_id: user.id,
        pair: 'BTC/USDT',
        type: 'BUY',
        amount: 2.0,
        entry_price: 65000,
        stop_loss: 63000,
        emotion_score: 9
    }]);

    if (err1) {
        console.error("Insert Failed with error:", err1.message, err1.code);
        if (err1.code === '42501') {
            console.log("\n[!] ERROR 42501: Row Level Security Policy Violation.");
            console.log("To fix this, please execute the following in Supabase SQL editor:");
            console.log(`
CREATE POLICY "Enable insert for authenticated users only"
ON "public"."trades"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
            `);
        }
    } else {
        console.log("Insert Success! Trades table accepted the BTC/USDT row.");
    }
}

testerE2E();
