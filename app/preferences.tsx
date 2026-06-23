import {Platform, RefreshControl, ScrollView, View} from 'react-native';
import {useColorScheme} from 'nativewind';
import {useCurrentUser} from '@/src/context/UserContext';
import {useGetProfileById} from '@/src/api/generated/profile/profile';
import {Skeleton, SkeletonGroup} from '@/src/components/primitives/ui/Skeleton';
import {Typography} from '@/src/components/primitives/ui/Typography';
import {DetailLayout, webContentStyle} from '@/src/components/primitives/layout/DetailLayout';
import {themeColors} from '@/src/constants/colors';

export default function PreferencesScreen() {
    const {currentUser} = useCurrentUser();
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];

    const profileId = currentUser?.profile?.id;
    const {data: profile, isLoading, refetch, isRefetching} = useGetProfileById(profileId!, {
        query: {enabled: !!profileId},
    });

    const rows = [
        {label: 'Weight unit', value: profile?.preferredWeightUnit?.value},
        {label: 'Distance unit', value: profile?.preferredDistanceUnit?.value},
    ];

    return (
        <DetailLayout title="Preferences">
            <ScrollView
                className="flex-1 bg-background"
                contentContainerStyle={{flexGrow: 1, paddingHorizontal: 24, paddingTop: 24, ...webContentStyle}}
                refreshControl={Platform.OS !== 'web' ? (
                    <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={palette.primary}/>
                ) : undefined}
            >
                {isLoading ? (
                    <View className="rounded-xl bg-card overflow-hidden">
                        <SkeletonGroup gap={0}>
                            <View className="flex-row justify-between items-center px-4 py-3 border-b border-border">
                                <Skeleton width="35%" height={16} rounded="md"/>
                                <Skeleton width="25%" height={16} rounded="md"/>
                            </View>
                            <View className="flex-row justify-between items-center px-4 py-3">
                                <Skeleton width="35%" height={16} rounded="md"/>
                                <Skeleton width="25%" height={16} rounded="md"/>
                            </View>
                        </SkeletonGroup>
                    </View>
                ) : (
                    <View className="rounded-xl bg-card overflow-hidden">
                        {rows.map((row, index) => (
                            <View
                                key={row.label}
                                className={`flex-row justify-between items-center px-4 py-3 ${index < rows.length - 1 ? 'border-b border-border' : ''}`}
                            >
                                <Typography variant="muted">{row.label}</Typography>
                                <Typography variant="body-sm">{row.value ?? '—'}</Typography>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </DetailLayout>
    );
}
