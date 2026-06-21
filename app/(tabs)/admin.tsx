import {Pressable, ScrollView, View} from 'react-native';
import {useRouter} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {useColorScheme} from 'nativewind';
import {Typography} from '@/src/components/primitives/ui/Typography';
import {TABS} from '@/src/constants/tabs';
import {themeColors} from '@/src/constants/colors';

export default function AdminScreen() {
    const router = useRouter();
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];

    const adminItems = TABS.filter(tab => tab.section === 'Admin');

    return (
        <ScrollView contentContainerStyle={{padding: 24, gap: 12}}>
            {adminItems.map(tab => (
                <Pressable
                    key={tab.name}
                    onPress={() => router.push(tab.href as never)}
                    className="flex-row items-center gap-4 rounded-xl border border-border bg-card p-4"
                >
                    <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                        <Ionicons name={tab.icon} size={20} color={palette.primary}/>
                    </View>
                    <View className="flex-1">
                        <Typography variant="body" className="font-semibold text-foreground">
                            {tab.label}
                        </Typography>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={palette.mutedForeground}/>
                </Pressable>
            ))}
        </ScrollView>
    );
}
