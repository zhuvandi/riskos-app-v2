export interface Trade {
    pair: string;
    lotSize: number;
    emotionScale: number; // 1 to 10
    timestamp: Date;
}

export function calculateRiskScore(trades: Trade[]): number {
    if (trades.length === 0) return 0;
    // Simple risk score: Average lot size * average emotion
    const avgLotSize = trades.reduce((sum, t) => sum + t.lotSize, 0) / trades.length;
    const avgEmotion = trades.reduce((sum, t) => sum + t.emotionScale, 0) / trades.length;
    return Math.min(100, Math.round(avgLotSize * avgEmotion * 10)); // Arbitrary formula for example
}

export function calculateDiscipline(trades: Trade[]): number {
    if (trades.length === 0) return 100; // Perfect discipline without trades
    // High emotion -> lower discipline. Baseline 100
    const avgEmotion = trades.reduce((sum, t) => sum + t.emotionScale, 0) / trades.length;
    return Math.max(0, Math.round(100 - (avgEmotion - 1) * 11)); // Maps 1->100, 10->1
}

export function calculateEmotionalHeat(trades: Trade[]): number {
    if (trades.length === 0) return 0;
    // Recent trades carry more weight, or simple average
    return Math.round(trades.reduce((sum, t) => sum + t.emotionScale, 0) / trades.length);
}
