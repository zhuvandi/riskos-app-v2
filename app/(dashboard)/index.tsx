import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { calculateRiskScore, calculateDiscipline, calculateEmotionalHeat, Trade } from '../../utils/riskEngine';
import { Activity, Flame, ShieldAlert, Plus } from 'lucide-react-native';
import { supabase } from '../../utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Dashboard() {
    const router = useRouter();
    const { refresh } = useLocalSearchParams();
    const [trades, setTrades] = useState<Trade[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadTrades = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            let onlineTrades: any[] = [];
            const { data, error } = await supabase
                .from('trades')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (!error && data) {
                onlineTrades = data;
            }

            let offlineTrades: any[] = [];
            try {
                const stored = await AsyncStorage.getItem('OFFLINE_TRADES');
                if (stored) {
                    offlineTrades = JSON.parse(stored);
                }
            } catch (e) { }

            const allData = [...onlineTrades, ...offlineTrades].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            const formattedTrades: Trade[] = allData.map(t => ({
                pair: t.pair,
                lotSize: t.amount,
                emotionScale: t.emotion_score,
                timestamp: new Date(t.created_at)
            }));
            setTrades(formattedTrades);

        } catch (e) {
            console.error("Error loading trades:", e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            loadTrades();
        }, [refresh])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadTrades();
    }, []);

    const riskScore = calculateRiskScore(trades);
    const discipline = calculateDiscipline(trades);
    const heat = calculateEmotionalHeat(trades);

    return (
        <View className="flex-1 bg-slate-900">
            <ScrollView
                className="flex-1 px-6 pt-6"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
            >
                <View className="flex-row justify-between items-center mb-8">
                    <Text className="text-3xl font-extrabold text-white tracking-tight">Metrics</Text>
                    <TouchableOpacity
                        className="bg-blue-600 w-14 h-14 rounded-full items-center justify-center shadow-lg shadow-blue-500/40"
                        onPress={() => router.push('/(dashboard)/add-trade')}
                    >
                        <Plus color="#fff" size={28} />
                    </TouchableOpacity>
                </View>

                <View className="gap-5">
                    <View className="bg-slate-800 p-6 rounded-[2rem] border border-slate-700 flex-row items-center">
                        <View className="w-14 h-14 bg-red-500/20 rounded-full items-center justify-center mr-5">
                            <ShieldAlert color="#ef4444" size={28} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-slate-400 text-sm font-semibold uppercase tracking-widest mb-1">Risk Score</Text>
                            <Text className="text-4xl font-black text-white">{loading ? '...' : riskScore}</Text>
                        </View>
                    </View>

                    <View className="bg-slate-800 p-6 rounded-[2rem] border border-slate-700 flex-row items-center">
                        <View className="w-14 h-14 bg-emerald-500/20 rounded-full items-center justify-center mr-5">
                            <Activity color="#10b981" size={28} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-slate-400 text-sm font-semibold uppercase tracking-widest mb-1">Discipline</Text>
                            <Text className="text-4xl font-black text-white">{loading ? '...' : `${discipline}%`}</Text>
                        </View>
                    </View>

                    <View className="bg-slate-800 p-6 rounded-[2rem] border border-slate-700 flex-row items-center">
                        <View className="w-14 h-14 bg-orange-500/20 rounded-full items-center justify-center mr-5">
                            <Flame color="#f97316" size={28} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-slate-400 text-sm font-semibold uppercase tracking-widest mb-1">Emotional Heat</Text>
                            <Text className="text-4xl font-black text-white">{loading ? '...' : `${heat}/10`}</Text>
                        </View>
                    </View>
                </View>

                <View className="mt-10 mb-8 pb-8">
                    <Text className="text-2xl font-bold text-white mb-5 tracking-tight">Recent Logs</Text>
                    {loading && trades.length === 0 ? (
                        <Text className="text-slate-500 text-center py-10 text-lg">Loading sync...</Text>
                    ) : trades.length === 0 ? (
                        <View className="items-center py-10">
                            <Text className="text-white text-2xl font-bold mb-2">Welcome to RiskOS Console</Text>
                            <Text className="text-slate-500 text-center text-lg px-4 gap-2">You haven't logged any trades yet. The Risk Score needs data to analyze your psychology.</Text>
                        </View>
                    ) : (
                        trades.slice(0, 5).map((t, i) => (
                            <View key={i} className="bg-slate-800/60 p-5 rounded-3xl mb-4 border border-slate-700/50 flex-row justify-between items-center">
                                <View>
                                    <Text className="text-white font-bold text-xl mb-1">{t.pair}</Text>
                                    <Text className="text-slate-400 text-sm font-medium">
                                        {t.timestamp.toLocaleDateString()} {t.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                                <View className="items-end">
                                    <Text className="text-white font-bold text-lg">{t.lotSize} Lots</Text>
                                    <Text className="text-orange-400 font-semibold text-sm mt-1">Heat: {t.emotionScale}/10</Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
