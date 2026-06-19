import {useState} from 'react';
import {Pressable, View} from 'react-native';
import Animated, {useSharedValue, useAnimatedStyle, withTiming, Easing} from 'react-native-reanimated';
import {usePathname, useRouter} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {useColorScheme} from 'nativewind';
import {cn} from '@/src/lib/utils';
import {Heading, Typography} from './Typography';
import {Avatar} from './Avatar';
import {TABS} from '@/src/constants/tabs';
import {themeColors} from '@/src/constants/colors';
import {useCurrentUser} from '@/src/context/UserContext';

const EXPANDED_WIDTH = 224; // w-56
const COLLAPSED_WIDTH = 64; // w-16
const TIMING = {duration: 220, easing: Easing.out(Easing.cubic)};

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];
    const {currentUser} = useCurrentUser();

    const widthValue = useSharedValue(EXPANDED_WIDTH);
    const labelOpacity = useSharedValue(1);

    const containerStyle = useAnimatedStyle(() => ({
        width: widthValue.value,
        overflow: 'hidden',
    }));

    const labelStyle = useAnimatedStyle(() => ({
        opacity: labelOpacity.value,
    }));

    function toggle() {
        const next = !collapsed;
        setCollapsed(next);

        if (next) {
            labelOpacity.value = withTiming(0, {duration: 80});
            widthValue.value = withTiming(COLLAPSED_WIDTH, TIMING);
        } else {
            widthValue.value = withTiming(EXPANDED_WIDTH, TIMING);
            labelOpacity.value = withTiming(1, {duration: 150, easing: Easing.in(Easing.cubic)});
        }
    }

    const name = currentUser?.profile?.name;
    const email = currentUser?.email;
    const imageUrl = currentUser?.profile?.profilePictureUrl;
    const isProfileActive = pathname === '/profile';

    return (
        <Animated.View style={[containerStyle, {
            borderRightWidth: 1,
            borderRightColor: palette.border,
            backgroundColor: palette.card,
        }]}>
            {/* Header */}
            <View
                className={cn(
                    'flex-row items-center border-b border-border',
                    collapsed ? 'justify-center py-4' : 'justify-between px-5 py-5',
                )}
            >
                {!collapsed && (
                    <Animated.View style={labelStyle}>
                        <Heading level="h4">Fitness App</Heading>
                    </Animated.View>
                )}
                <Pressable
                    onPress={toggle}
                    className="rounded-lg p-1.5 hover:bg-muted"
                    accessibilityRole="button"
                    accessibilityLabel={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <Ionicons
                        name={collapsed ? 'chevron-forward' : 'chevron-back'}
                        size={18}
                        color={palette.mutedForeground}
                    />
                </Pressable>
            </View>

            {/* Nav items */}
            <View className={cn('flex-1 gap-1 py-3', collapsed ? 'px-2' : 'px-3')}>
                {TABS.map(tab => {
                    const isActive =
                        pathname === `/${tab.name}` || pathname.startsWith(`/${tab.name}/`);

                    return (
                        <Pressable
                            key={tab.name}
                            className={cn(
                                'flex-row items-center rounded-lg py-2.5',
                                collapsed ? 'justify-center px-0' : 'gap-3 px-3',
                                isActive ? 'bg-primary/10' : 'hover:bg-muted',
                            )}
                            onPress={() => router.push(tab.href as any)}
                            accessibilityRole="link"
                            accessibilityLabel={tab.label}
                            accessibilityState={{selected: isActive}}
                        >
                            <Ionicons
                                name={isActive ? tab.iconActive : tab.icon}
                                size={20}
                                color={isActive ? palette.primary : palette.mutedForeground}
                            />
                            {!collapsed && (
                                <Animated.View style={labelStyle}>
                                    <Typography
                                        variant="body-sm"
                                        className={isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}
                                    >
                                        {tab.label}
                                    </Typography>
                                </Animated.View>
                            )}
                        </Pressable>
                    );
                })}
            </View>

            {/* Profile — anchored at bottom */}
            <View style={{borderTopWidth: 1, borderTopColor: palette.border}}>
                <Pressable
                    className={cn(
                        'flex-row items-center py-4',
                        collapsed ? 'justify-center px-0' : 'gap-3 px-4',
                        isProfileActive ? 'bg-primary/10' : 'hover:bg-muted',
                    )}
                    onPress={() => router.push('/profile')}
                    accessibilityRole="link"
                    accessibilityLabel="Profile"
                    accessibilityState={{selected: isProfileActive}}
                >
                    <Avatar name={name} imageUrl={imageUrl} size="sm"/>
                    {!collapsed && (
                        <Animated.View style={[labelStyle, {flex: 1, overflow: 'hidden'}]}>
                            <Typography variant="body-sm" className="text-foreground font-medium" numberOfLines={1}>
                                {name ?? 'Profile'}
                            </Typography>
                            {email && (
                                <Typography variant="caption" className="text-muted-foreground" numberOfLines={1}>
                                    {email}
                                </Typography>
                            )}
                        </Animated.View>
                    )}
                </Pressable>
            </View>
        </Animated.View>
    );
}
