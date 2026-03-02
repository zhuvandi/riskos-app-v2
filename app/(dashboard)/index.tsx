import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { calculateRiskScore, calculateDiscipline, calculateEmotionalHeat, Trade } from '../../utils/riskEngine';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Activity, Flame, ShieldAlert, Plus } from 'lucide-react-native';

export default function Dashboard() {
    const router = useRouter();
    const [trades, setTrades] = useState<Trade[]>([]);

    const loadTrades = async () => {
        try {
            const data = await AsyncStorage.getItem('riskos_trades');
            if (data) {
                setTrades(JSON.parse(data));
            }
        } catch (e) {
            console.error(e);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadTrades();
        }, [])
    );

    const riskScore = calculateRiskScore(trades);
    const discipline = calculateDiscipline(trades);
    const heat = calculateEmotionalHeat(trades);

    return (
        <View className="flex-1 bg-slate-900">
            <ScrollView className="flex-1 px-6 pt-6 content-container">
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
                            <Text className="text-4xl font-black text-white">{riskScore}</Text>
                        </View>
                    </View>

                    <View className="bg-slate-800 p-6 rounded-[2rem] border border-slate-700 flex-row items-center">
                        <View className="w-14 h-14 bg-emerald-500/20 rounded-full items-center justify-center mr-5">
                            <Activity color="#10b981" size={28} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-slate-400 text-sm font-semibold uppercase tracking-widest mb-1">Discipline</Text>
                            <Text className="text-4xl font-black text-white">{discipline}%</Text>
                        </View>
                    </View>

                    <View className="bg-slate-800 p-6 rounded-[2rem] border border-slate-700 flex-row items-center">
                        <View className="w-14 h-14 bg-orange-500/20 rounded-full items-center justify-center mr-5">
                            <Flame color="#f97316" size={28} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-slate-400 text-sm font-semibold uppercase tracking-widest mb-1">Emotional Heat</Text>
                            <Text className="text-4xl font-black text-white">{heat}/10</Text>
                        </View>
                    </View>
                </View>

                <View className="mt-10 mb-8">
                    <Text className="text-2xl font-bold text-white mb-5 tracking-tight">Recent Logs</Text>
                    {trades.length === 0 ? (
                        <Text className="text-slate-500 text-center py-10 text-lg">No trades logged yet.</Text>
                    ) : (
                        trades.slice(-5).reverse().map((t, i) => (
                            <View key={i} className="bg-slate-800/60 p-5 rounded-3xl mb-4 border border-slate-700/50 flex-row justify-between items-center">
                                <View>
                                    <Text className="text-white font-bold text-xl mb-1">{t.pair}</Text>
                                    <Text className="text-slate-400 text-sm font-medium">{new Date(t.timestamp).toLocaleDateString()}</Text>
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
