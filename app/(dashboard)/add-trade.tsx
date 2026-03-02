import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { supabase } from '../../utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddTradeScreen() {
    const router = useRouter();
    const [pair, setPair] = useState('');
    const [type, setType] = useState<'BUY' | 'SELL'>('BUY');
    const [amount, setAmount] = useState('');
    const [entryPrice, setEntryPrice] = useState('');
    const [stopLoss, setStopLoss] = useState('');
    const [emotionScore, setEmotionScore] = useState('5');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!pair || !amount || !entryPrice) {
            Alert.alert("Validation Error", "Please fill in all required fields (Pair, Amount, Entry Price)");
            return;
        }

        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            Alert.alert("Auth Error", "You must be logged in to log a trade.");
            setLoading(false);
            return;
        }

        const parsedAmount = Number(amount);
        const parsedEntry = Number(entryPrice);
        const parsedStopLoss = stopLoss ? Number(stopLoss) : null;

        if (isNaN(parsedAmount) || isNaN(parsedEntry) || (parsedStopLoss !== null && isNaN(parsedStopLoss))) {
            Alert.alert("Validation Error", "Please enter valid numeric values for Amount and Prices.");
            setLoading(false);
            return;
        }

        const { error } = await supabase.from('trades').insert([{
            user_id: user.id,
            pair: pair.toUpperCase(),
            type,
            amount: parsedAmount,
            entry_price: parsedEntry,
            stop_loss: parsedStopLoss,
            emotion_score: parseInt(emotionScore, 10)
        }]);

        if (error) {
            console.error("Supabase reject, saving to local storage fallback:", error.message);

            const generateUUID = () => {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            };

            const localTrade = {
                id: generateUUID(),
                user_id: user.id,
                pair: pair.toUpperCase(),
                type,
                amount: parsedAmount,
                entry_price: parsedEntry,
                stop_loss: parsedStopLoss,
                emotion_score: parseInt(emotionScore, 10),
                created_at: new Date().toISOString()
            };

            try {
                const stored = await AsyncStorage.getItem('OFFLINE_TRADES');
                const offlineTrades = stored ? JSON.parse(stored) : [];
                offlineTrades.push(localTrade);
                await AsyncStorage.setItem('OFFLINE_TRADES', JSON.stringify(offlineTrades));
            } catch (e) {
                console.error("Local storage fail", e);
            }
        }

        setLoading(false);
        router.replace({ pathname: '/(dashboard)', params: { refresh: Date.now() } } as any);
    };

    return (
        <ScrollView className="flex-1 bg-slate-900 px-6 pt-6">
            <View className="gap-6 mt-4 pb-12">
                <View>
                    <Text className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2 ml-1">Instrument (Pair)</Text>
                    <TextInput
                        className="w-full bg-slate-800 text-white rounded-xl px-5 py-4 text-lg border border-slate-700"
                        placeholder="e.g. BTC/USD"
                        placeholderTextColor="#64748b"
                        autoCapitalize="characters"
                        value={pair}
                        onChangeText={setPair}
                    />
                </View>

                <View>
                    <Text className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2 ml-1">Trade Type</Text>
                    <View className="flex-row gap-4">
                        <TouchableOpacity
                            className={`flex-1 py-4 rounded-xl items-center border ${type === 'BUY' ? 'bg-emerald-500/20 border-emerald-500' : 'bg-slate-800 border-slate-700'}`}
                            onPress={() => setType('BUY')}
                        >
                            <Text className={`font-bold text-lg ${type === 'BUY' ? 'text-emerald-400' : 'text-slate-400'}`}>BUY (Long)</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className={`flex-1 py-4 rounded-xl items-center border ${type === 'SELL' ? 'bg-red-500/20 border-red-500' : 'bg-slate-800 border-slate-700'}`}
                            onPress={() => setType('SELL')}
                        >
                            <Text className={`font-bold text-lg ${type === 'SELL' ? 'text-red-400' : 'text-slate-400'}`}>SELL (Short)</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View>
                    <Text className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2 ml-1">Amount (Lots/Units)</Text>
                    <TextInput
                        className="w-full bg-slate-800 text-white rounded-xl px-5 py-4 text-lg border border-slate-700"
                        placeholder="0.00"
                        placeholderTextColor="#64748b"
                        keyboardType="decimal-pad"
                        value={amount}
                        onChangeText={setAmount}
                    />
                </View>

                <View className="flex-row gap-4">
                    <View className="flex-1">
                        <Text className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2 ml-1">Entry Price</Text>
                        <TextInput
                            className="w-full bg-slate-800 text-white rounded-xl px-4 py-4 text-lg border border-slate-700"
                            placeholder="0.00"
                            placeholderTextColor="#64748b"
                            keyboardType="decimal-pad"
                            value={entryPrice}
                            onChangeText={setEntryPrice}
                        />
                    </View>
                    <View className="flex-1">
                        <Text className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2 ml-1">Stop Loss</Text>
                        <TextInput
                            className="w-full bg-slate-800 text-white rounded-xl px-4 py-4 text-lg border border-slate-700"
                            placeholder="Optional"
                            placeholderTextColor="#64748b"
                            keyboardType="decimal-pad"
                            value={stopLoss}
                            onChangeText={setStopLoss}
                        />
                    </View>
                </View>


                <View>
                    <Text className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2 ml-1">Emotional Heat (1-10)</Text>
                    <View className="flex-row items-center justify-between bg-slate-800 rounded-xl p-2 border border-slate-700">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
                            <TouchableOpacity
                                key={val}
                                className={`w-8 h-10 rounded-lg items-center justify-center ${parseInt(emotionScore) === val ? 'bg-orange-500' : 'bg-transparent'}`}
                                onPress={() => setEmotionScore(val.toString())}
                            >
                                <Text className={`font-bold ${parseInt(emotionScore) === val ? 'text-white' : 'text-slate-500'}`}>
                                    {val}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <TouchableOpacity
                    className={`w-full py-5 rounded-xl mt-4 shadow-lg ${loading ? 'bg-blue-800/50' : 'bg-blue-600 active:bg-blue-700 shadow-blue-600/30'}`}
                    onPress={handleSave}
                    disabled={loading}
                >
                    <Text className="text-center text-white font-bold text-xl">{loading ? 'Logging...' : 'Log Protocol'}</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
