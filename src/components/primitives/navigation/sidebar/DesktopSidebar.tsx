import {useState} from 'react';
import {Pressable, View} from 'react-native';
import Animated, {useSharedValue, useAnimatedStyle, withTiming, Easing} from 'react-native-reanimated';
import {useRouter} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {useColorScheme} from 'nativewind';
import {cn} from '@/src/lib/utils';
import {Heading} from '../../ui/Typography';
import {themeColors} from '@/src/constants/colors';
import {useCurrentUser} from '@/src/context/UserContext';
import {SidebarNavItems} from './SidebarNavItems';
import {SidebarProfile} from './SidebarProfile';
import {EXPANDED_WIDTH, COLLAPSED_WIDTH, TIMING} from './constants';

export function DesktopSidebar() {
    const [collapsed, setCollapsed] = useState(true);
    const router = useRouter();
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];
    const {currentUser} = useCurrentUser();

    const widthValue = useSharedValue(COLLAPSED_WIDTH);
    const labelOpacity = useSharedValue(0);

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

    function navigate(href: string) {
        router.push(href as any);
    }

    const name = currentUser?.profile?.name;
    const email = currentUser?.email;
    const imageUrl = currentUser?.profile?.profilePictureUrl;

    return (
        <Animated.View style={[containerStyle, {
            borderRightWidth: 1,
            borderRightColor: palette.border,
            backgroundColor: palette.card,
        }]}>
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

            <SidebarNavItems onNavigate={navigate} collapsed={collapsed} labelStyle={labelStyle}/>
            <SidebarProfile name={name} email={email} imageUrl={imageUrl} onNavigate={navigate} collapsed={collapsed} labelStyle={labelStyle}/>
        </Animated.View>
    );
}
