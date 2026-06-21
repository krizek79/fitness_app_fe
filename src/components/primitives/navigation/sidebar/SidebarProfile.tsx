import {Pressable, View} from 'react-native';
import Animated from 'react-native-reanimated';
import {cn} from '@/src/lib/utils';
import {Typography} from '../../ui/Typography';
import {Avatar} from '../../ui/Avatar';
import {themeColors} from '@/src/constants/colors';
import {useColorScheme} from 'nativewind';
import {usePathname} from 'expo-router';
import type {AnimatedStyle} from 'react-native-reanimated';
import type {ViewStyle} from 'react-native';

interface SidebarProfileProps {
    name: string | undefined;
    email: string | undefined;
    imageUrl: string | undefined;
    onNavigate: (href: string) => void;
    collapsed?: boolean;
    labelStyle?: AnimatedStyle<ViewStyle>;
}

export function SidebarProfile({name, email, imageUrl, onNavigate, collapsed = false, labelStyle}: SidebarProfileProps) {
    const pathname = usePathname();
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];
    const isActive = pathname === '/profile';

    return (
        <View style={{borderTopWidth: 1, borderTopColor: palette.border}}>
            <Pressable
                className={cn(
                    'flex-row items-center py-4',
                    collapsed ? 'justify-center px-0' : 'gap-3 px-4',
                    isActive ? 'bg-primary/10' : 'hover:bg-muted',
                )}
                onPress={() => onNavigate('/profile')}
                accessibilityRole="link"
                accessibilityLabel="Profile"
                accessibilityState={{selected: isActive}}
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
    );
}
