import {Alert, Image, Platform, Pressable, RefreshControl, ScrollView, View} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {useColorScheme} from 'nativewind';
import {useGetEquipmentById, useDeleteEquipment} from '@/src/api/generated/equipment/equipment';
import {DetailLayout, webContentStyle} from '@/src/components/primitives/layout/DetailLayout';
import {Typography} from '@/src/components/primitives/ui/Typography';
import {Skeleton, SkeletonGroup} from '@/src/components/primitives/ui/Skeleton';
import {themeColors} from '@/src/constants/colors';

const HERO_HEIGHT = 280;

function EquipmentDetailSkeleton() {
    return (
        <SkeletonGroup gap={0}>
            <Skeleton height={HERO_HEIGHT} width="100%"/>
        </SkeletonGroup>
    );
}

export default function EquipmentDetailScreen() {
    const {id} = useLocalSearchParams<{id: string}>();
    const router = useRouter();
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];

    const {data: equipment, isLoading, refetch, isRefetching} = useGetEquipmentById(Number(id));
    const {mutate: deleteEquipment, isPending: isDeleting} = useDeleteEquipment();

    function handleDelete() {
        const message = `Are you sure you want to delete "${equipment?.title ?? 'this equipment'}"? This cannot be undone.`;
        if (Platform.OS === 'web') {
            // Alert.alert is a no-op on web
            if (window.confirm(message)) {
                deleteEquipment({id: Number(id)}, {onSuccess: () => router.replace('/(tabs)/equipment')});
            }
            return;
        }
        Alert.alert('Delete equipment', message, [
            {text: 'Cancel', style: 'cancel'},
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => deleteEquipment(
                    {id: Number(id)},
                    {onSuccess: () => router.replace('/(tabs)/equipment')},
                ),
            },
        ]);
    }

    const headerRight = !isLoading && (
        <View className="flex-row items-center" style={{gap: 24}}>
            <Pressable
                onPress={() => router.push({pathname: '/equipment/edit/[id]', params: {id}})}
                accessibilityLabel="Edit equipment"
                style={{padding: 8}}
            >
                <Ionicons name="pencil-outline" size={20} color={palette.mutedForeground}/>
            </Pressable>
            <Pressable
                onPress={handleDelete}
                disabled={isDeleting}
                accessibilityLabel="Delete equipment"
                style={{padding: 8, opacity: isDeleting ? 0.4 : 1}}
            >
                <Ionicons name="trash-outline" size={20} color={palette.destructive}/>
            </Pressable>
        </View>
    );

    return (
        <DetailLayout
            title={isLoading ? 'Loading…' : (equipment?.title ?? 'Equipment')}
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
                    <EquipmentDetailSkeleton/>
                ) : (
                    <View style={{height: HERO_HEIGHT}} className="bg-muted">
                        {/* Image */}
                        {equipment?.thumbnailUrl ? (
                            Platform.OS === 'web' ? (
                                // @ts-ignore
                                <img
                                    src={equipment.thumbnailUrl}
                                    style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}}
                                 alt=""/>
                            ) : (
                                <Image
                                    source={{uri: equipment.thumbnailUrl}}
                                    style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}
                                    resizeMode="cover"
                                />
                            )
                        ) : (
                            <View className="flex-1 items-center justify-center">
                                <Ionicons name="fitness-outline" size={64} color={palette.mutedForeground}/>
                            </View>
                        )}

                        {/* Dark fade + title overlay */}
                        {equipment?.thumbnailUrl && (
                            <View
                                style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 120, justifyContent: 'flex-end', paddingHorizontal: 20, paddingBottom: 20, backgroundColor: 'rgba(0,0,0,0.45)'}}
                            >
                                <Typography variant="caption" style={{color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2}}>
                                    Equipment
                                </Typography>
                                <Typography variant="body" style={{color: '#ffffff', fontWeight: '700', fontSize: 22}}>
                                    {equipment.title ?? 'Untitled'}
                                </Typography>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </DetailLayout>
    );
}
