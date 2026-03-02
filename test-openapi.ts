import fetch from 'node-fetch';

async function checkOpenAPI() {
    const res = await fetch('https://xlphcwgflyocqlqybqxt.supabase.co/rest/v1/?apikey=sb_publishable_qyVQsgOpnvZmyQ82rwlRaA_RqnkWlR0');
    const data = await res.json();
    console.log("Paths available:");
    console.log(Object.keys(data.paths || {}));
}
checkOpenAPI();
