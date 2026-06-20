import {Pressable, View, useWindowDimensions} from 'react-native';
import Animated, {useSharedValue, useAnimatedStyle, withTiming} from 'react-native-reanimated';
import {useRouter} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {useColorScheme} from 'nativewind';
import {Heading} from '../Typography';
import {themeColors} from '@/src/constants/colors';
import {useCurrentUser} from '@/src/context/UserContext';
import {SidebarNavItems} from './SidebarNavItems';
import {SidebarProfile} from './SidebarProfile';
import {MOBILE_TIMING as TIMING} from './constants';
import {forwardRef, useImperativeHandle, useState} from 'react';

export interface MobileDrawerRef {
    open: () => void;
}

export const MobileDrawer = forwardRef<MobileDrawerRef>(function MobileDrawer(_, ref) {
    const {width: windowWidth} = useWindowDimensions();
    const router = useRouter();
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];
    const {currentUser} = useCurrentUser();

    const [open, setOpen] = useState(false);
    const translateX = useSharedValue(-windowWidth);
    const backdropOpacity = useSharedValue(0);

    const drawerStyle = useAnimatedStyle(() => ({
        transform: [{translateX: translateX.value}],
    }));

    const backdropStyle = useAnimatedStyle(() => ({
        opacity: backdropOpacity.value,
    }));

    function close() {
        setOpen(false);
        translateX.value = withTiming(-windowWidth, TIMING);
        backdropOpacity.value = withTiming(0, TIMING);
    }

    useImperativeHandle(ref, () => ({
        open() {
            setOpen(true);
            translateX.value = withTiming(0, TIMING);
            backdropOpacity.value = withTiming(1, TIMING);
        },
    }));

    function navigate(href: string) {
        router.push(href as any);
        close();
    }

    const name = currentUser?.profile?.name;
    const email = currentUser?.email;
    const imageUrl = currentUser?.profile?.profilePictureUrl;

    return (
        <>
            <Animated.View
                pointerEvents={open ? 'auto' : 'none'}
                style={[
                    backdropStyle,
                    {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 40, backgroundColor: 'rgba(0,0,0,0.5)'},
                ]}
            >
                <Pressable style={{flex: 1}} onPress={close}/>
            </Animated.View>

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
                <View
                    className="flex-row items-center justify-between px-5 py-5"
                    style={{borderBottomWidth: 1, borderBottomColor: palette.border}}
                >
                    <Heading level="h4">Fitness App</Heading>
                    <Pressable
                        onPress={close}
                        className="rounded-lg p-1.5 hover:bg-muted"
                        accessibilityRole="button"
                        accessibilityLabel="Close menu"
                    >
                        <Ionicons name="close" size={22} color={palette.mutedForeground}/>
                    </Pressable>
                </View>

                <SidebarNavItems onNavigate={navigate}/>
                <SidebarProfile name={name} email={email} imageUrl={imageUrl} onNavigate={navigate}/>
            </Animated.View>
        </>
    );
});
