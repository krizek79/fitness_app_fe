import {Pressable, View} from 'react-native';
import Animated from 'react-native-reanimated';
import {Ionicons} from '@expo/vector-icons';
import {cn} from '@/src/lib/utils';
import {Typography} from '../Typography';
import {TABS} from '@/src/constants/tabs';
import {themeColors} from '@/src/constants/colors';
import {useColorScheme} from 'nativewind';
import {usePathname} from 'expo-router';
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

    return (
        <View className={cn('flex-1 gap-1 py-3', collapsed ? 'px-2' : 'px-3')}>
            {TABS.map(tab => {
                const isActive = pathname === `/${tab.name}` || pathname.startsWith(`/${tab.name}/`);

                return (
                    <Pressable
                        key={tab.name}
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
                );
            })}
        </View>
    );
}
