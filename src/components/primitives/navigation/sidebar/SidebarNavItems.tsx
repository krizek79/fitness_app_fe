import {Pressable, View} from 'react-native';
import Animated from 'react-native-reanimated';
import {Ionicons} from '@expo/vector-icons';
import {cn} from '@/src/lib/utils';
import {Typography} from '../../ui/Typography';
import {TABS} from '@/src/constants/tabs';
import {themeColors} from '@/src/constants/colors';
import {useColorScheme} from 'nativewind';
import {usePathname} from 'expo-router';
import {useCurrentUser} from '@/src/context/UserContext';
import type {AnimatedStyle} from 'react-native-reanimated';
import type {ViewStyle} from 'react-native';

interface SidebarNavItemsProps {
    onNavigate: (href: string) => void;
    collapsed?: boolean;
    labelStyle?: AnimatedStyle<ViewStyle>;
}

export function SidebarNavItems({onNavigate, collapsed = false, labelStyle}: SidebarNavItemsProps) {
    const pathname = usePathname();
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];
    const {currentUser} = useCurrentUser();
    const isAdmin = currentUser?.isAdmin === true;

    const visibleTabs = TABS.filter(tab => !tab.mobileOnly && (!tab.adminOnly || isAdmin));

    const renderedSections = new Set<string>();

    return (
        <View className={cn('flex-1 gap-1 py-3', collapsed ? 'px-2' : 'px-3')}>
            {visibleTabs.map(tab => {
                const isActive = pathname === `/${tab.name}` || pathname.startsWith(`/${tab.name}/`);

                const sectionHeader =
                    !collapsed && tab.section && !renderedSections.has(tab.section)
                        ? (() => { renderedSections.add(tab.section); return tab.section; })()
                        : null;

                return (
                    <View key={tab.name}>
                        {sectionHeader && (
                            <View className="mt-4 mb-1">
                                <View className="h-px bg-border mx-3 mb-4"/>
                                <View className="px-3 pb-1">
                                    <Typography variant="caption" className="text-muted-foreground uppercase tracking-widest font-semibold">
                                        {sectionHeader}
                                    </Typography>
                                </View>
                            </View>
                        )}
                        <Pressable
                            className={cn(
                                'flex-row items-center rounded-lg py-2.5',
                                collapsed ? 'justify-center px-0' : 'gap-3 px-3',
                                isActive ? 'bg-primary/10' : 'hover:bg-muted',
                            )}
                            onPress={() => onNavigate(tab.href)}
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
                    </View>
                );
            })}
        </View>
    );
}
