import React from 'react';
import {View} from 'react-native';
import {Heading, Typography} from '@/src/components/primitives/Typography';
import {Button, ButtonProps} from '@/src/components/primitives/Button';

interface EmptyStateAction {
    label: string;
    onPress: () => void;
    variant?: ButtonProps['variant'];
}

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: EmptyStateAction;
}

export function EmptyState({icon, title, description, action}: EmptyStateProps) {
    return (
        <View className="flex-1 items-center justify-center px-8 gap-4">
            {icon && <View className="mb-2">{icon}</View>}
            <View className="items-center gap-1">
                <Heading level="h3" className="text-center">
                    {title}
                </Heading>
                {description && (
                    <Typography variant="muted" className="text-center">
                        {description}
                    </Typography>
                )}
            </View>
            {action && (
                <Button
                    label={action.label}
                    onPress={action.onPress}
                    variant={action.variant ?? 'primary'}
                    fullWidth={false}
                    size="md"
                />
            )}
        </View>
    );
}
