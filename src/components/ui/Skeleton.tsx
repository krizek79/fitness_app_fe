import React, {useEffect, useRef} from 'react';
import {Animated, View, ViewProps} from 'react-native';
import {cn} from '@/src/lib/utils';

interface SkeletonProps extends ViewProps {
    width?: number | `${number}%`;
    height?: number;
    rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const roundedStyles: Record<NonNullable<SkeletonProps['rounded']>, string> = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
};

export function Skeleton({width, height = 16, rounded = 'md', className, style, ...props}: SkeletonProps) {
    const opacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {toValue: 0.4, duration: 800, useNativeDriver: true}),
                Animated.timing(opacity, {toValue: 1, duration: 800, useNativeDriver: true}),
            ]),
        );
        pulse.start();
        return () => pulse.stop();
    }, [opacity]);

    return (
        <Animated.View
            style={[{opacity, width, height}, style]}
            className={cn('bg-muted', roundedStyles[rounded], className)}
            {...props}
        />
    );
}

interface SkeletonGroupProps {
    children: React.ReactNode;
    gap?: number;
}

export function SkeletonGroup({children, gap = 12}: SkeletonGroupProps) {
    return (
        <View style={{gap}}>
            {children}
        </View>
    );
}
