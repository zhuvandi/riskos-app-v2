import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trade } from '../../utils/riskEngine';

export default function AddTradeScreen() {
    const router = useRouter();
    const [pair, setPair] = useState('');
    const [lotSize, setLotSize] = useState('');
    const [emotionScale, setEmotionScale] = useState('5');

    const handleSave = async () => {
        if (!pair || !lotSize) return;

        const newTrade: Trade = {
            pair: pair.toUpperCase(),
            lotSize: parseFloat(lotSize) || 0,
            emotionScale: parseInt(emotionScale, 10) || 5,
            timestamp: new Date()
        };

        try {
            const currentData = await AsyncStorage.getItem('riskos_trades');
            const trades = currentData ? JSON.parse(currentData) : [];
            trades.push(newTrade);
            await AsyncStorage.setItem('riskos_trades', JSON.stringify(trades));
            router.back();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <ScrollView className="flex-1 bg-slate-900 px-6 pt-6">
            <View className="gap-6 mt-4">
                <View>
                    <Text className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2 ml-1">Instrument</Text>
                    <TextInput
                        className="w-full bg-slate-800 text-white rounded-2xl px-5 py-5 text-lg border border-slate-700"
                        placeholder="e.g. BTC/USD"
                        placeholderTextColor="#64748b"
                        autoCapitalize="characters"
                        value={pair}
                        onChangeText={setPair}
                    />
                </View>

                <View>
                    <Text className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2 ml-1">Position Size (Lots)</Text>
                    <TextInput
                        className="w-full bg-slate-800 text-white rounded-2xl px-5 py-5 text-lg border border-slate-700"
                        placeholder="0.00"
                        placeholderTextColor="#64748b"
                        keyboardType="decimal-pad"
                        value={lotSize}
                        onChangeText={setLotSize}
                    />
                </View>

                <View>
                    <Text className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2 ml-1">Emotional Heat (1-10)</Text>
                    <View className="flex-row items-center justify-between bg-slate-800 rounded-2xl p-2 border border-slate-700">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
                            <TouchableOpacity
                                key={val}
                                className={`w-8 h-10 rounded-lg items-center justify-center ${parseInt(emotionScale) === val ? 'bg-orange-500' : 'bg-transparent'}`}
                                onPress={() => setEmotionScale(val.toString())}
                            >
                                <Text className={`font-bold ${parseInt(emotionScale) === val ? 'text-white' : 'text-slate-500'}`}>
                                    {val}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <TouchableOpacity
                    className="w-full bg-blue-600 py-5 rounded-2xl mt-8 active:bg-blue-700 shadow-lg shadow-blue-600/30"
                    onPress={handleSave}
                >
                    <Text className="text-center text-white font-bold text-xl">Log Protocol</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
