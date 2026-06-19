import {useRef} from 'react';
import {Platform, Pressable, useWindowDimensions, View} from 'react-native';
import {Slot, Tabs, usePathname, useRouter} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {useColorScheme} from 'nativewind';
import {TabBar} from '@/src/components/ui/TabBar';
import {Sidebar, SidebarRef} from '@/src/components/ui/Sidebar';
import {Heading} from '@/src/components/ui/Typography';
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
    const sidebarRef = useRef<SidebarRef>(null);
    const {width: windowWidth} = useWindowDimensions();
    const isMobileWeb = windowWidth < 768;

    if (Platform.OS === 'web') {
        const pathname = usePathname();
        const currentTab = TABS.find(
            tab => pathname === `/${tab.name}` || pathname.startsWith(`/${tab.name}/`),
        );

        return (
            <View className="flex-1 flex-row">
                <Sidebar key={isMobileWeb ? 'mobile' : 'desktop'} ref={sidebarRef}/>
                <View className="flex-1">
                    {/* Unified top bar — shows page title; hamburger only on mobile web */}
                    <View
                        className="flex-row items-center border-b border-border bg-card"
                        style={{height: 56, paddingHorizontal: 16, gap: 8}}
                    >
                        {isMobileWeb && (
                            <Pressable
                                onPress={() => sidebarRef.current?.openDrawer()}
                                accessibilityRole="button"
                                accessibilityLabel="Open menu"
                                style={{padding: 8, borderRadius: 8, marginRight: 4}}
                            >
                                <Ionicons name="menu" size={24} color={palette.mutedForeground}/>
                            </Pressable>
                        )}
                        {currentTab && (
                            <Heading level="h4">{currentTab.label}</Heading>
                        )}
                    </View>
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
