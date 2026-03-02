import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { supabase } from '../utils/supabase';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleLogin() {
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            // Attempt signup if login fails
            const { error: signUpError } = await supabase.auth.signUp({ email, password });
            setLoading(false);
            if (signUpError) {
                alert(signUpError.message);
                return;
            }
            router.replace('/(dashboard)');
        } else {
            setLoading(false);
            router.replace('/(dashboard)');
        }
    }

    return (
        <View className="flex-1 justify-center px-8 bg-slate-900">
            <View className="mb-12">
                <Text className="text-5xl font-extrabold text-white mb-2 tracking-tighter">RiskOS</Text>
                <Text className="text-lg text-slate-400 font-medium">Master your trading psychology.</Text>
            </View>

            <View className="gap-4">
                <TextInput
                    className="w-full bg-slate-800 text-white rounded-2xl px-5 py-5 text-lg border border-slate-700"
                    placeholder="Email address"
                    placeholderTextColor="#64748b"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />
                <TextInput
                    className="w-full bg-slate-800 text-white rounded-2xl px-5 py-5 text-lg border border-slate-700"
                    placeholder="Password"
                    placeholderTextColor="#64748b"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <TouchableOpacity
                    className="w-full bg-blue-600 py-5 rounded-2xl mt-4 active:bg-blue-700 shadow-lg shadow-blue-600/30"
                    onPress={handleLogin}
                    disabled={loading}
                >
                    <Text className="text-center text-white font-bold text-xl">
                        {loading ? 'Entering...' : 'Enter Console'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
