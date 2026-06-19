import {forwardRef, useImperativeHandle, useState} from 'react';
import {Pressable, useWindowDimensions, View} from 'react-native';
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
const MOBILE_BREAKPOINT = 768;
const TIMING = {duration: 220, easing: Easing.out(Easing.cubic)};

export interface SidebarRef {
    openDrawer: () => void;
}

export const Sidebar = forwardRef<SidebarRef>(function Sidebar(_, ref) {
    const [collapsed, setCollapsed] = useState(true);
    const pathname = usePathname();
    const router = useRouter();
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];
    const {currentUser} = useCurrentUser();
    const {width: windowWidth} = useWindowDimensions();

    const isMobileWeb = windowWidth < MOBILE_BREAKPOINT;

    // Desktop: animate sidebar width
    const widthValue = useSharedValue(COLLAPSED_WIDTH);
    const labelOpacity = useSharedValue(0);

    // Mobile: animate drawer translateX
    const translateX = useSharedValue(-windowWidth);
    const backdropOpacity = useSharedValue(0);

    const desktopContainerStyle = useAnimatedStyle(() => ({
        width: widthValue.value,
        overflow: 'hidden',
    }));

    const labelStyle = useAnimatedStyle(() => ({
        opacity: labelOpacity.value,
    }));

    const drawerStyle = useAnimatedStyle(() => ({
        transform: [{translateX: translateX.value}],
    }));

    const backdropStyle = useAnimatedStyle(() => ({
        opacity: backdropOpacity.value,
    }));

    useImperativeHandle(ref, () => ({
        openDrawer() {
            setCollapsed(false);
            translateX.value = withTiming(0, TIMING);
            backdropOpacity.value = withTiming(1, TIMING);
        },
    }));

    function toggle() {
        const next = !collapsed;
        setCollapsed(next);

        if (isMobileWeb) {
            if (next) {
                // closing
                translateX.value = withTiming(-windowWidth, TIMING);
                backdropOpacity.value = withTiming(0, TIMING);
            } else {
                // opening
                translateX.value = withTiming(0, TIMING);
                backdropOpacity.value = withTiming(1, TIMING);
            }
        } else {
            if (next) {
                labelOpacity.value = withTiming(0, {duration: 80});
                widthValue.value = withTiming(COLLAPSED_WIDTH, TIMING);
            } else {
                widthValue.value = withTiming(EXPANDED_WIDTH, TIMING);
                labelOpacity.value = withTiming(1, {duration: 150, easing: Easing.in(Easing.cubic)});
            }
        }
    }

    function closeDrawer() {
        setCollapsed(true);
        translateX.value = withTiming(-windowWidth, TIMING);
        backdropOpacity.value = withTiming(0, TIMING);
    }

    function navigate(href: string) {
        router.push(href as any);
        if (isMobileWeb) closeDrawer();
    }

    const name = currentUser?.profile?.name;
    const email = currentUser?.email;
    const imageUrl = currentUser?.profile?.profilePictureUrl;
    const isProfileActive = pathname === '/profile';

    const navItems = (
        <>
            {/* Nav items */}
            <View className="flex-1 gap-1 py-3 px-3">
                {TABS.map(tab => {
                    const isActive =
                        pathname === `/${tab.name}` || pathname.startsWith(`/${tab.name}/`);

                    return (
                        <Pressable
                            key={tab.name}
                            className={cn(
                                'flex-row items-center gap-3 rounded-lg py-2.5 px-3',
                                isActive ? 'bg-primary/10' : 'hover:bg-muted',
                            )}
                            onPress={() => navigate(tab.href)}
                            accessibilityRole="link"
                            accessibilityLabel={tab.label}
                            accessibilityState={{selected: isActive}}
                        >
                            <Ionicons
                                name={isActive ? tab.iconActive : tab.icon}
                                size={20}
                                color={isActive ? palette.primary : palette.mutedForeground}
                            />
                            <Typography
                                variant="body-sm"
                                className={isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}
                            >
                                {tab.label}
                            </Typography>
                        </Pressable>
                    );
                })}
            </View>

            {/* Profile — anchored at bottom */}
            <View style={{borderTopWidth: 1, borderTopColor: palette.border}}>
                <Pressable
                    className={cn(
                        'flex-row items-center gap-3 px-4 py-4',
                        isProfileActive ? 'bg-primary/10' : 'hover:bg-muted',
                    )}
                    onPress={() => navigate('/profile')}
                    accessibilityRole="link"
                    accessibilityLabel="Profile"
                    accessibilityState={{selected: isProfileActive}}
                >
                    <Avatar name={name} imageUrl={imageUrl} size="sm"/>
                    <View style={{flex: 1, overflow: 'hidden'}}>
                        <Typography variant="body-sm" className="text-foreground font-medium" numberOfLines={1}>
                            {name ?? 'Profile'}
                        </Typography>
                        {email && (
                            <Typography variant="caption" className="text-muted-foreground" numberOfLines={1}>
                                {email}
                            </Typography>
                        )}
                    </View>
                </Pressable>
            </View>
        </>
    );

    // ─── Mobile web: full-screen overlay drawer ───────────────────────────────
    if (isMobileWeb) {
        return (
            <>
                {/* Backdrop */}
                <Animated.View
                    pointerEvents={collapsed ? 'none' : 'auto'}
                    style={[
                        backdropStyle,
                        {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 40, backgroundColor: 'rgba(0,0,0,0.5)'},
                    ]}
                >
                    <Pressable style={{flex: 1}} onPress={closeDrawer}/>
                </Animated.View>

                {/* Drawer */}
                <Animated.View
                    style={[
                        drawerStyle,
                        {
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            bottom: 0,
                            width: '100%',
                            zIndex: 50,
                            backgroundColor: palette.card,
                            borderRightWidth: 1,
                            borderRightColor: palette.border,
                        },
                    ]}
                >
                    {/* Header */}
                    <View
                        className="flex-row items-center justify-between px-5 py-5"
                        style={{borderBottomWidth: 1, borderBottomColor: palette.border}}
                    >
                        <Heading level="h4">Fitness App</Heading>
                        <Pressable
                            onPress={closeDrawer}
                            className="rounded-lg p-1.5 hover:bg-muted"
                            accessibilityRole="button"
                            accessibilityLabel="Close menu"
                        >
                            <Ionicons name="close" size={22} color={palette.mutedForeground}/>
                        </Pressable>
                    </View>

                    {navItems}
                </Animated.View>
            </>
        );
    }

    // ─── Desktop web: collapsible push sidebar ────────────────────────────────
    return (
        <Animated.View style={[desktopContainerStyle, {
            borderRightWidth: 1,
            borderRightColor: palette.border,
            backgroundColor: palette.card,
        }]}>
            {/* Header */}
            <View
                className={cn(
                    'flex-row items-center border-b border-border',
                    collapsed ? 'justify-center px-2' : 'justify-between px-5',
                )}
                style={{height: 56}}
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
});
