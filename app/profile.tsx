import {Platform, Pressable, RefreshControl, ScrollView, View} from 'react-native';
import {useColorScheme} from 'nativewind';
import {useRouter} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {useAuth} from '@/src/context/AuthContext';
import {useCurrentUser} from '@/src/context/UserContext';
import {useGetProfileById} from '@/src/api/generated/profile/profile';
import {Avatar} from '@/src/components/primitives/ui/Avatar';
import {Button} from '@/src/components/primitives/ui/Button';
import {Skeleton, SkeletonGroup} from '@/src/components/primitives/ui/Skeleton';
import {Heading, Typography} from '@/src/components/primitives/ui/Typography';
import {Divider} from '@/src/components/primitives/ui/Divider';
import {DetailLayout, webContentStyle} from '@/src/components/primitives/layout/DetailLayout';
import {themeColors} from '@/src/constants/colors';

function MenuRow({icon, label, onPress}: {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    label: string;
    onPress: () => void;
}) {
    return (
        <Pressable onPress={onPress} className="flex-row items-center gap-4 px-4 py-3 active:opacity-70">
            <Ionicons name={icon} size={20} color="#6b7280"/>
            <Typography variant="body-sm" className="flex-1 text-foreground">{label}</Typography>
            <Ionicons name="chevron-forward" size={16} color="#9ca3af"/>
        </Pressable>
    );
}

export default function ProfileScreen() {
    const {logout} = useAuth();
    const {currentUser} = useCurrentUser();
    const router = useRouter();
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];

    const profileId = currentUser?.profile?.id;
    const {data: profile, isLoading, refetch, isRefetching} = useGetProfileById(profileId!, {
        query: {enabled: !!profileId},
    });

    const name = profile?.name;
    const imageUrl = profile?.profilePictureUrl;

    return (
        <DetailLayout title="Profile">
        <ScrollView
            className="flex-1 bg-background"
            contentContainerStyle={{flexGrow: 1, paddingHorizontal: 24, paddingTop: 24, ...webContentStyle}}
            refreshControl={Platform.OS !== 'web' ? (
                <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={palette.primary}/>
            ) : undefined}
        >

            {isLoading ? (
                <>
                    <View className="items-center gap-3 pb-8">
                        <Skeleton width={80} height={80} rounded="full" />
                        <Skeleton width={140} height={22} rounded="md" />
                    </View>
                    <View className="rounded-xl bg-card overflow-hidden">
                        <SkeletonGroup gap={0}>
                            <View className="flex-row items-center gap-4 px-4 py-3 border-b border-border">
                                <Skeleton width={20} height={20} rounded="md" />
                                <Skeleton width="40%" height={16} rounded="md" />
                            </View>
                            <View className="flex-row items-center gap-4 px-4 py-3">
                                <Skeleton width={20} height={20} rounded="md" />
                                <Skeleton width="40%" height={16} rounded="md" />
                            </View>
                        </SkeletonGroup>
                    </View>
                </>
            ) : (
                <>
                    <View className="items-center gap-3 pb-8">
                        <Avatar name={name} imageUrl={imageUrl} size="lg"/>
                        {name && <Heading level="h3">{name}</Heading>}
                    </View>

                    <View className="rounded-xl bg-card overflow-hidden">
                        <MenuRow icon="time-outline" label="History" onPress={() => router.push('/history')}/>
                        <Divider/>
                        <MenuRow icon="options-outline" label="Preferences" onPress={() => router.push('/preferences')}/>
                    </View>
                </>
            )}

            <View className="mt-auto pb-10">
                <Button
                    label="Log out"
                    onPress={logout}
                    variant="destructive"
                />
            </View>
        </ScrollView>
        </DetailLayout>
    );
}
