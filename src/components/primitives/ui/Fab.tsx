import {Pressable} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import type {ComponentProps} from 'react';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

interface FabProps {
    onPress: () => void;
    icon?: IoniconsName;
    accessibilityLabel?: string;
}

export function Fab({onPress, icon = 'add', accessibilityLabel = 'Action'}: FabProps) {
    return (
        <Pressable
            onPress={onPress}
            className="absolute bottom-6 right-6 bg-primary rounded-full items-center justify-center shadow-md hover:opacity-90 active:opacity-90"
            style={{width: 56, height: 56}}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
        >
            <Ionicons name={icon} size={28} color="#ffffff"/>
        </Pressable>
    );
}
