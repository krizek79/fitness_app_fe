import {Platform, Pressable, View} from 'react-native';
import {Slot, Tabs, useRouter} from 'expo-router';
import {useColorScheme} from 'nativewind';
import {TabBar} from '@/src/components/ui/TabBar';
import {Sidebar} from '@/src/components/ui/Sidebar';
import {Avatar} from '@/src/components/ui/Avatar';
import {useCurrentUser} from '@/src/context/UserContext';
import {themeColors} from '@/src/constants/colors';
import {TABS} from '@/src/constants/tabs';

function ProfileHeaderButton() {
    const router = useRouter();
    const {currentUser} = useCurrentUser();

    return (
        <Pressable onPress={() => router.push('/profile')} className="mr-4">
            <Avatar
                name={currentUser?.profile?.name}
                imageUrl={currentUser?.profile?.profilePictureUrl}
                size="sm"
            />
        </Pressable>
    );
}

export default function TabLayout() {
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];

    if (Platform.OS === 'web') {
        return (
            <View className="flex-1 flex-row">
                <Sidebar/>
                <View className="flex-1">
                    <Slot/>
                </View>
            </View>
        );
    }

    return (
        <Tabs
            tabBar={(props) => <TabBar {...props} />}
            screenOptions={{
                headerShown: true,
                headerStyle: {backgroundColor: palette.card},
                headerTintColor: palette.mutedForeground,
                headerShadowVisible: false,
                headerRight: () => <ProfileHeaderButton/>,
            }}
        >
            {TABS.map(tab => (
                <Tabs.Screen
                    key={tab.name}
                    name={tab.name}
                    options={{title: tab.label}}
                />
            ))}
        </Tabs>
    );
}
