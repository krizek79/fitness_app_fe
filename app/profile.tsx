import {Platform, RefreshControl, ScrollView, View} from 'react-native';
import {useColorScheme} from 'nativewind';
import {useAuth} from '@/src/context/AuthContext';
import {useCurrentUser} from '@/src/context/UserContext';
import {useGetProfileById} from '@/src/api/generated/profile/profile';
import {Avatar} from '@/src/components/primitives/ui/Avatar';
import {Button} from '@/src/components/primitives/ui/Button';
import {Skeleton, SkeletonGroup} from '@/src/components/primitives/ui/Skeleton';
import {Heading, Typography} from '@/src/components/primitives/ui/Typography';
import {DetailLayout, webContentStyle} from '@/src/components/primitives/layout/DetailLayout';
import {themeColors} from '@/src/constants/colors';

export default function ProfileScreen() {
    const {logout} = useAuth();
    const {currentUser} = useCurrentUser();
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];

    const profileId = currentUser?.profile?.id;
    const {data: profile, isLoading, refetch, isRefetching} = useGetProfileById(profileId!, {
        query: {enabled: !!profileId},
    });

    const name = profile?.name;
    const imageUrl = profile?.profilePictureUrl;
    const weightUnit = profile?.preferredWeightUnit?.value;
    const distanceUnit = profile?.preferredDistanceUnit?.value;

    const infoRows = [
        {label: 'Weight unit', value: weightUnit},
        {label: 'Distance unit', value: distanceUnit},
    ].filter(row => row.value);

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
                    <View className="rounded-xl bg-card overflow-hidden px-4">
                        <SkeletonGroup gap={0}>
                            <View className="py-3 border-b border-border">
                                <Skeleton width="60%" height={16} rounded="md" />
                            </View>
                            <View className="py-3">
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
                        {infoRows.map((row, index) => (
                            <View
                                key={row.label}
                                className={`flex-row justify-between items-center px-4 py-3 ${index < infoRows.length - 1 ? 'border-b border-border' : ''}`}
                            >
                                <Typography variant="muted">{row.label}</Typography>
                                <Typography variant="body-sm">{row.value}</Typography>
                            </View>
                        ))}
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
