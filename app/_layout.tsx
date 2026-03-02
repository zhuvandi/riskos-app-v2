import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { cssInterop } from 'nativewind';

// StyleSheet.setFlag is removed in newer versions, NativeWind handles dark mode automatically via class in v4 or via `colorScheme` inside styling.
export default function RootLayout() {
    return (
        <>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(dashboard)" />
            </Stack>
        </>
    );
}
