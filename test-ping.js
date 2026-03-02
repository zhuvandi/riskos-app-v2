import fetch from 'node-fetch';

async function ping() {
    const url = 'https://xlphcwgflyocqlqybqxt.supabase.co/rest/v1/trades';
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            'apikey': 'sb_publishable_qyVQsgOpnvZmyQ82rwlRaA_RqnkWlR0',
        }
    });
    console.log("Status:", res.status);
    console.log("Headers:", res.headers.raw());
    console.log("Body:", await res.text());
}
ping();
