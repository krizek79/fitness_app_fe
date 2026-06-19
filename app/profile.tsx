import {View} from 'react-native';
import {Stack} from 'expo-router';
import {useColorScheme} from 'nativewind';
import {useAuth} from '@/src/context/AuthContext';
import {useCurrentUser} from '@/src/context/UserContext';
import {useGetProfileById} from '@/src/api/generated/profile/profile';
import {Avatar} from '@/src/components/ui/Avatar';
import {Button} from '@/src/components/ui/Button';
import {Heading, Typography} from '@/src/components/ui/Typography';
import {themeColors} from '@/src/constants/colors';

export default function ProfileScreen() {
    const {logout} = useAuth();
    const {currentUser} = useCurrentUser();
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];

    const profileId = currentUser?.profile?.id;
    const {data: profile, isLoading} = useGetProfileById(profileId!, {
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
        <View className="flex-1 bg-background px-6 pt-6">
            <Stack.Screen options={{
                headerShown: true,
                title: 'Profile',
                headerStyle: {backgroundColor: palette.card},
                headerTintColor: palette.mutedForeground,
                headerShadowVisible: false,
            }}/>

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

            <View className="mt-auto pb-10">
                <Button
                    label="Log out"
                    onPress={logout}
                    variant="destructive"
                    loading={isLoading}
                />
            </View>
        </View>
    );
}
