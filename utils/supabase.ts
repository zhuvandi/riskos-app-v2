import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xlphcwgflyocqlqybqxt.supabase.co';
const supabaseAnonKey = 'sb_publishable_qyVQsgOpnvZmyQ82rwlRaA_RqnkWlR0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

// Bypass Auth Mock Injector
const originalGetUser = supabase.auth.getUser.bind(supabase.auth);
supabase.auth.getUser = async (jwt?: string) => {
    const isMock = await AsyncStorage.getItem('TESTER_MOCK_AUTH');
    if (isMock === 'true') {
        return { data: { user: { id: 'tester-mock-id-123', email: 'test@riskos.com', role: 'authenticated', aud: 'authenticated' } as any }, error: null };
    }
    return originalGetUser(jwt);
};

const originalInsert = supabase.from.bind(supabase);
supabase.from = (table: string) => {
    const queryBuilder = originalInsert(table);
    if (table === 'trades') {
        const originalInsertFn = queryBuilder.insert.bind(queryBuilder);
        queryBuilder.insert = (payload: any) => {
            // We can check if mock is active. If so, return fake success if requested, but instructions say "If test fails with 42501..."
            // To ensure it fails with 42501 if we send mock data, we just pass to original which WILL FAIL with 42501 (Violation of RLS on unauthenticated).
            return originalInsertFn(payload);
        };
    }
    return queryBuilder;
};
