import { Stack } from 'expo-router';

export default function DashboardLayout() {
    return (
        <Stack screenOptions={{
            headerStyle: { backgroundColor: '#0f172a' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' }
        }}>
            <Stack.Screen name="index" options={{ title: 'Dashboard' }} />
            <Stack.Screen name="add-trade" options={{ title: 'Log Trade', presentation: 'modal' }} />
        </Stack>
    );
}
