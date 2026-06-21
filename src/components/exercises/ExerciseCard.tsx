import {Image, Platform, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useColorScheme} from 'nativewind';
import type {ExerciseSimpleResponse} from '@/src/api/generated/model';
import {Card} from '@/src/components/primitives/ui/Card';
import {Typography} from '@/src/components/primitives/ui/Typography';
import {Badge} from '@/src/components/primitives/ui/Badge';
import {themeColors} from '@/src/constants/colors';

const THUMB_SIZE = 80;

interface ExerciseCardProps {
    exercise: ExerciseSimpleResponse;
    onPress?: () => void;
}

export function ExerciseCard({exercise, onPress}: ExerciseCardProps) {
    const {title, thumbnailUrl, exerciseCategory, primaryMuscles} = exercise;
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];

    const muscleLabel = primaryMuscles
        ?.map(m => m.value)
        .filter(Boolean)
        .slice(0, 3)
        .join(' · ');

    return (
        <Card onPress={onPress} padding="none" className="flex-row overflow-hidden">
            {/* Thumbnail */}
            <View
                className="bg-muted items-center justify-center overflow-hidden self-stretch"
                style={{width: THUMB_SIZE}}
            >
                {thumbnailUrl ? (
                    Platform.OS === 'web' ? (
                        // @ts-ignore
                        <img src={thumbnailUrl} style={{width: THUMB_SIZE, height: '100%', objectFit: 'cover'}} alt=""/>
                    ) : (
                        <Image source={{uri: thumbnailUrl}} style={{width: THUMB_SIZE, height: '100%'}} resizeMode="cover"/>
                    )
                ) : (
                    <Ionicons name="barbell-outline" size={28} color={palette.mutedForeground}/>
                )}
            </View>

            {/* Content */}
            <View className="flex-1 flex-row items-center gap-2 px-4 py-3">
                <View className="flex-1 gap-1">
                    <Typography variant="body" className="text-foreground font-semibold" numberOfLines={2}>
                        {title ?? 'Untitled exercise'}
                    </Typography>

                    {exerciseCategory?.value && (
                        <Badge label={exerciseCategory.value} variant="muted"/>
                    )}

                    {muscleLabel && (
                        <Typography variant="caption" className="text-muted-foreground">
                            {muscleLabel}
                        </Typography>
                    )}
                </View>
                {onPress && <Ionicons name="chevron-forward" size={18} color={palette.mutedForeground}/>}
            </View>
        </Card>
    );
}
