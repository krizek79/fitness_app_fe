import {Image, Platform, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useColorScheme} from 'nativewind';
import type {EquipmentResponse} from '@/src/api/generated/model';
import {Card} from '@/src/components/primitives/ui/Card';
import {Typography} from '@/src/components/primitives/ui/Typography';
import {themeColors} from '@/src/constants/colors';

interface EquipmentCardProps {
    equipment: EquipmentResponse;
    onPress?: () => void;
}

export function EquipmentCard({equipment, onPress}: EquipmentCardProps) {
    const {title, thumbnailUrl} = equipment;
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];

    return (
        <Card onPress={onPress} padding="none" className="flex-row overflow-hidden">
            {/* Thumbnail */}
            <View className="bg-muted items-center justify-center" style={{width: 72, height: 72}}>
                {thumbnailUrl ? (
                    Platform.OS === 'web' ? (
                        <img
                            src={thumbnailUrl}
                            style={{width: 72, height: 72, objectFit: 'cover'}}
                         alt=""/>
                    ) : (
                        <Image
                            source={{uri: thumbnailUrl}}
                            style={{width: 72, height: 72}}
                            resizeMode="cover"
                        />
                    )
                ) : (
                    <Ionicons name="bicycle-outline" size={28} color={palette.mutedForeground}/>
                )}
            </View>

            {/* Content */}
            <View className="flex-1 flex-row items-center justify-between gap-2 px-4">
                <Typography variant="body" className="text-foreground font-semibold flex-1" numberOfLines={2}>
                    {title ?? 'Untitled'}
                </Typography>
                {onPress && <Ionicons name="chevron-forward" size={18} color={palette.mutedForeground}/>}
            </View>
        </Card>
    );
}
