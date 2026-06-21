import {Alert, Image, Platform, Pressable, RefreshControl, ScrollView, View} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {useColorScheme} from 'nativewind';
import {useGetExerciseById, useDeleteExercise} from '@/src/api/generated/exercise/exercise';
import {DetailLayout, webContentStyle} from '@/src/components/primitives/layout/DetailLayout';
import {Typography} from '@/src/components/primitives/ui/Typography';
import {Badge} from '@/src/components/primitives/ui/Badge';
import {Divider} from '@/src/components/primitives/ui/Divider';
import {Skeleton, SkeletonGroup} from '@/src/components/primitives/ui/Skeleton';
import {EquipmentCard} from '@/src/components/equipment/EquipmentCard';
import {themeColors} from '@/src/constants/colors';

const HERO_HEIGHT = 260;

function ExerciseDetailSkeleton() {
    return (
        <SkeletonGroup gap={0}>
            <Skeleton height={HERO_HEIGHT} width="100%"/>
            <View className="p-6 gap-4">
                <View className="gap-2">
                    <Skeleton height={14} width="25%" rounded="md"/>
                    <Skeleton height={28} width="60%" rounded="md"/>
                </View>
                <Skeleton height={1} width="100%" rounded="full"/>
                <View className="gap-2">
                    <Skeleton height={14} width="35%" rounded="md"/>
                    <View className="flex-row gap-2">
                        <Skeleton height={28} width={80} rounded="full"/>
                        <Skeleton height={28} width={96} rounded="full"/>
                    </View>
                </View>
            </View>
        </SkeletonGroup>
    );
}

export default function ExerciseDetailScreen() {
    const {id} = useLocalSearchParams<{id: string}>();
    const router = useRouter();
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];

    const {data: exercise, isLoading, refetch, isRefetching} = useGetExerciseById(Number(id));
    const {mutate: deleteExercise, isPending: isDeleting} = useDeleteExercise();

    function handleDelete() {
        const message = `Are you sure you want to delete "${exercise?.title ?? 'this exercise'}"? This cannot be undone.`;
        if (Platform.OS === 'web') {
            if (window.confirm(message)) {
                deleteExercise({id: Number(id)}, {onSuccess: () => router.replace('/(tabs)/exercises')});
            }
            return;
        }
        Alert.alert('Delete exercise', message, [
            {text: 'Cancel', style: 'cancel'},
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => deleteExercise(
                    {id: Number(id)},
                    {onSuccess: () => router.replace('/(tabs)/exercises')},
                ),
            },
        ]);
    }

    const headerRight = !isLoading && (
        <View className="flex-row items-center" style={{gap: 24}}>
            <Pressable
                onPress={() => router.push({pathname: '/exercise/edit/[id]', params: {id}})}
                accessibilityLabel="Edit exercise"
                style={{padding: 8}}
            >
                <Ionicons name="pencil-outline" size={20} color={palette.mutedForeground}/>
            </Pressable>
            <Pressable
                onPress={handleDelete}
                disabled={isDeleting}
                accessibilityLabel="Delete exercise"
                style={{padding: 8, opacity: isDeleting ? 0.4 : 1}}
            >
                <Ionicons name="trash-outline" size={20} color={palette.destructive}/>
            </Pressable>
        </View>
    );

    const primaryMuscles = exercise?.muscles?.filter(m => m.type?.key === 'PRIMARY') ?? [];
    const secondaryMuscles = exercise?.muscles?.filter(m => m.type?.key === 'SECONDARY') ?? [];

    return (
        <DetailLayout
            title={isLoading ? 'Loading…' : (exercise?.title ?? 'Exercise')}
            headerRight={headerRight || undefined}
        >
            <ScrollView
                className="flex-1 bg-background"
                contentContainerStyle={{gap: 0, ...webContentStyle}}
                refreshControl={Platform.OS !== 'web' ? (
                    <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={palette.primary}/>
                ) : undefined}
            >
                {isLoading ? (
                    <ExerciseDetailSkeleton/>
                ) : (
                    <>
                        {/* Hero */}
                        <View style={{height: HERO_HEIGHT}} className="bg-muted">
                            {exercise?.thumbnailUrl ? (
                                Platform.OS === 'web' ? (
                                    <img
                                        src={exercise.thumbnailUrl}
                                        style={{width: '100%', height: HERO_HEIGHT, objectFit: 'cover'}}
                                     alt=""/>
                                ) : (
                                    <Image
                                        source={{uri: exercise.thumbnailUrl}}
                                        style={{width: '100%', height: HERO_HEIGHT}}
                                        resizeMode="cover"
                                    />
                                )
                            ) : (
                                <View className="flex-1 items-center justify-center">
                                    <Ionicons name="barbell-outline" size={64} color={palette.mutedForeground}/>
                                </View>
                            )}
                        </View>

                        {/* Info */}
                        <View className="p-6 gap-5">
                            {/* Title + category */}
                            <View className="gap-2">
                                {exercise?.exerciseCategory?.value && (
                                    <Typography variant="caption" className="text-muted-foreground uppercase tracking-wide">
                                        {exercise.exerciseCategory.value}
                                    </Typography>
                                )}
                                <Typography variant="body" className="text-foreground font-bold text-2xl">
                                    {exercise?.title ?? 'Untitled'}
                                </Typography>
                            </View>

                            {/* Movement patterns */}
                            {(exercise?.movementPatterns ?? []).length > 0 && (
                                <>
                                    <Divider/>
                                    <View className="gap-2">
                                        <Typography variant="body-sm" className="font-semibold text-foreground">
                                            Movement patterns
                                        </Typography>
                                        <View className="flex-row flex-wrap gap-2">
                                            {exercise!.movementPatterns!.map(p => (
                                                <Badge key={p.key} label={p.value ?? p.key ?? ''} variant="muted"/>
                                            ))}
                                        </View>
                                    </View>
                                </>
                            )}

                            {/* Muscles */}
                            {(exercise?.muscles ?? []).length > 0 && (
                                <>
                                    <Divider/>
                                    <View className="gap-3">
                                        <Typography variant="body-sm" className="font-semibold text-foreground">
                                            Muscles
                                        </Typography>
                                        {primaryMuscles.length > 0 && (
                                            <View className="gap-1.5">
                                                <Typography variant="caption" className="text-muted-foreground">Primary</Typography>
                                                <View className="flex-row flex-wrap gap-2">
                                                    {primaryMuscles.map(m => (
                                                        <Badge key={m.muscle?.key} label={m.muscle?.value ?? m.muscle?.key ?? ''} variant="default"/>
                                                    ))}
                                                </View>
                                            </View>
                                        )}
                                        {secondaryMuscles.length > 0 && (
                                            <View className="gap-1.5">
                                                <Typography variant="caption" className="text-muted-foreground">Secondary</Typography>
                                                <View className="flex-row flex-wrap gap-2">
                                                    {secondaryMuscles.map(m => (
                                                        <Badge key={m.muscle?.key} label={m.muscle?.value ?? m.muscle?.key ?? ''} variant="muted"/>
                                                    ))}
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                </>
                            )}
                            {/* Required equipment */}
                            {(exercise?.requiredEquipment ?? []).length > 0 && (
                                <>
                                    <Divider/>
                                    <View className="gap-2">
                                        <Typography variant="body-sm" className="font-semibold text-foreground">
                                            Required equipment
                                        </Typography>
                                        <View className="gap-2">
                                            {exercise!.requiredEquipment!.map(e => (
                                                <EquipmentCard key={e.id} equipment={e}/>
                                            ))}
                                        </View>
                                    </View>
                                </>
                            )}
                        </View>
                    </>
                )}
            </ScrollView>
        </DetailLayout>
    );
}
