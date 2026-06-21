import {Pressable, View} from 'react-native';
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {Ionicons} from '@expo/vector-icons';
import {useColorScheme} from 'nativewind';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Typography} from '../ui/Typography';
import {TABS} from '@/src/constants/tabs';
import {themeColors} from '@/src/constants/colors';
import {useCurrentUser} from '@/src/context/UserContext';

export function TabBar({state, navigation}: BottomTabBarProps) {
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];
    const insets = useSafeAreaInsets();
    const {currentUser} = useCurrentUser();
    const isAdmin = currentUser?.isAdmin === true;

    return (
        <View
            className="flex-row border-t border-border bg-card"
            style={{paddingBottom: Math.max(insets.bottom, 8)}}
        >
            {state.routes.map((route, index) => {
                const tab = TABS.find(t => t.name === route.name);
                if (!tab) return null;
                if (tab.adminOnly && !isAdmin) return null;
                if (tab.section) return null; // shown in admin hub, not the tab bar
                const isActive = state.index === index;

                return (
                    <Pressable
                        key={route.key}
                        className="flex-1 items-center pt-2 gap-0.5"
                        onPress={() => navigation.navigate(route.name)}
                        accessibilityRole="tab"
                        accessibilityState={{selected: isActive}}
                        accessibilityLabel={tab.label}
                    >
                        <Ionicons
                            name={isActive ? tab.iconActive : tab.icon}
                            size={22}
                            color={isActive ? palette.primary : palette.mutedForeground}
                        />
                        <Typography
                            variant="caption"
                            className={isActive ? 'text-primary' : 'text-muted-foreground'}
                        >
                            {tab.label}
                        </Typography>
                    </Pressable>
                );
            })}
        </View>
    );
}
