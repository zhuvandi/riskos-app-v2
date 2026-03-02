import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xlphcwgflyocqlqybqxt.supabase.co';
const supabaseAnonKey = 'sb_publishable_qyVQsgOpnvZmyQ82rwlRaA_RqnkWlR0';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAnon() {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
        console.error("Anon Login Failed:", error.message);
    } else {
        console.error("Anon Login Success:", data.user?.id);
        const { error: insertErr } = await supabase.from('trades').insert([{
            user_id: data.user?.id,
            pair: 'BTC/USDT',
            type: 'BUY',
            amount: 2.0,
            entry_price: 65000,
            stop_loss: 63000,
            emotion_score: 9
        }]);
        if (insertErr) {
            console.error("Insert failed:", insertErr.message);
        } else {
            console.log("Insert success!");
        }
    }
}
testAnon();
