import React from 'react';
import {ActivityIndicator, Pressable, Text} from 'react-native';
import {cn} from '@/src/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
    label: string;
    onPress: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    icon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, { container: string; text: string }> = {
    primary: {
        container: 'bg-primary border-transparent',
        text: 'text-primary-foreground',
    },
    secondary: {
        container: 'bg-secondary border-transparent',
        text: 'text-secondary-foreground',
    },
    destructive: {
        container: 'bg-destructive border-transparent',
        text: 'text-destructive-foreground',
    },
    ghost: {
        container: 'bg-transparent border-border',
        text: 'text-foreground',
    },
};

const sizeStyles: Record<ButtonSize, { container: string; text: string; indicator: number }> = {
    sm: {container: 'px-4 py-2 rounded-lg', text: 'text-sm', indicator: 14},
    md: {container: 'px-5 py-3 rounded-xl', text: 'text-base', indicator: 16},
    lg: {container: 'px-6 py-4 rounded-xl', text: 'text-lg', indicator: 18},
};

export function Button({
                           label,
                           onPress,
                           variant = 'primary',
                           size = 'md',
                           loading = false,
                           disabled = false,
                           fullWidth = true,
                           icon,
                       }: ButtonProps) {
    const isDisabled = disabled || loading;
    const v = variantStyles[variant];
    const s = sizeStyles[size];

    return (
        <Pressable
            onPress={onPress}
            disabled={isDisabled}
            className={cn(
                'flex-row items-center justify-center gap-3 border',
                v.container,
                s.container,
                fullWidth && 'w-full',
                isDisabled && 'opacity-50',
            )}
        >
            {loading ? (
                <ActivityIndicator size={s.indicator} color="currentColor"/>
            ) : (
                <>
                    {icon}
                    <Text className={cn('font-semibold', v.text, s.text)}>{label}</Text>
                </>
            )}
        </Pressable>
    );
}
