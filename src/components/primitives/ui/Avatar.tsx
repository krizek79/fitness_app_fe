import {useState} from 'react';
import {Image, Platform, View} from 'react-native';
import {cn} from '@/src/lib/utils';
import {Typography} from './Typography';

type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
    name?: string;
    imageUrl?: string;
    size?: AvatarSize;
    className?: string;
}

const sizeStyles: Record<AvatarSize, { container: string; text: string; px: number }> = {
    sm: {container: 'w-8 h-8', text: 'text-xs', px: 32},
    md: {container: 'w-11 h-11', text: 'text-sm', px: 44},
    lg: {container: 'w-16 h-16', text: 'text-xl', px: 64},
};

function getInitials(name: string): string {
    return name
        .trim()
        .split(/\s+/)
        .filter(word => word.length > 0)
        .slice(0, 2)
        .map(word => word[0].toUpperCase())
        .join('');
}

export function Avatar({name, imageUrl, size = 'md', className}: AvatarProps) {
    const s = sizeStyles[size];
    const [imgError, setImgError] = useState(false);

    if (imageUrl && !imgError) {
        if (Platform.OS === 'web') {
            return (
                <img
                    src={imageUrl}
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    style={{
                        width: s.px,
                        height: s.px,
                        borderRadius: s.px / 2,
                        objectFit: 'cover',
                    }}
                 alt=""/>
            );
        }

        return (
            <Image
                source={{uri: imageUrl}}
                style={{width: s.px, height: s.px, borderRadius: s.px / 2}}
                resizeMode="cover"
                onError={() => setImgError(true)}
            />
        );
    }

    return (
        <View
            className={cn(
                'rounded-full items-center justify-center bg-primary',
                s.container,
                className,
            )}
        >
            <Typography variant="caption" className={cn('font-medium text-primary-foreground', s.text)}>
                {name ? getInitials(name) : '?'}
            </Typography>
        </View>
    );
}
