const fetch = require('node-fetch');

async function checkOpenAPI() {
    const res = await fetch('https://xlphcwgflyocqlqybqxt.supabase.co/rest/v1/', {
        headers: {
            apikey: 'sb_publishable_qyVQsgOpnvZmyQ82rwlRaA_RqnkWlR0',
            Authorization: 'Bearer sb_publishable_qyVQsgOpnvZmyQ82rwlRaA_RqnkWlR0'
        }
    });
    const data = await res.json();
    console.log("Tables/RPCs available:");
    console.log(Object.keys(data.paths || {}));
}
checkOpenAPI();
