import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Animated, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {toastEmitter, ToastEvent, ToastType} from '@/src/lib/toastEmitter';

// ─── Design tokens ────────────────────────────────────────────────────────────

const VARIANTS: Record<ToastType, { accent: string; icon: string; iconColor: string }> = {
    success: {accent: 'border-l-green-500', icon: '✓', iconColor: 'text-green-500'},
    error: {accent: 'border-l-red-500', icon: '✕', iconColor: 'text-red-500'},
    info: {accent: 'border-l-blue-500', icon: 'i', iconColor: 'text-blue-500'},
};

const VISIBILITY_MS = 4000;
const ANIM_MS = 280;

// ─── Component ────────────────────────────────────────────────────────────────

export function ToastContainer() {
    const {top} = useSafeAreaInsets();
    const [current, setCurrent] = useState<ToastEvent | null>(null);

    const queue = useRef<ToastEvent[]>([]);
    const isShowing = useRef(false);
    const translateY = useRef(new Animated.Value(-120)).current;
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const hide = useCallback(() => {
        if (hideTimer.current) clearTimeout(hideTimer.current);

        Animated.timing(translateY, {
            toValue: -120,
            duration: ANIM_MS,
            useNativeDriver: true,
        }).start(({finished}) => {
            if (!finished) return;
            setCurrent((prev) => {
                prev?.onHide();
                return null;
            });
            isShowing.current = false;
            // Small gap between toasts for readability
            setTimeout(showNext, 120);
        });
    }, [translateY]);

    const showNext = useCallback(() => {
        if (isShowing.current || queue.current.length === 0) return;

        isShowing.current = true;
        const next = queue.current.shift()!;
        translateY.setValue(-120);
        setCurrent(next);

        Animated.timing(translateY, {
            toValue: 0,
            duration: ANIM_MS,
            useNativeDriver: true,
        }).start(() => {
            hideTimer.current = setTimeout(hide, VISIBILITY_MS);
        });
    }, [translateY, hide]);

    useEffect(() => {
        return toastEmitter.subscribe((event) => {
            queue.current.push(event);
            showNext();
        });
    }, [showNext]);

    if (!current) return null;

    const {accent, icon, iconColor} = VARIANTS[current.type];

    return (
        <Animated.View
            style={{
                position: 'absolute',
                top: top + 8,
                left: 0,
                right: 0,
                zIndex: 9999,
                transform: [{translateY}],
            }}
        >
            <View
                className={`mx-4 flex-row items-start gap-3 rounded-xl border-l-4 bg-zinc-900 px-4 py-3 ${accent}`}
            >
                <Text className={`mt-0.5 text-sm font-bold ${iconColor}`}>{icon}</Text>

                <View className="flex-1">
                    {!!current.text1 && (
                        <Text className="text-sm font-semibold text-white" numberOfLines={2}>
                            {current.text1}
                        </Text>
                    )}
                    {!!current.text2 && (
                        <Text className="mt-0.5 text-xs text-zinc-400" numberOfLines={3}>
                            {current.text2}
                        </Text>
                    )}
                </View>
            </View>
        </Animated.View>
    );
}
