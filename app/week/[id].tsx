import {View} from 'react-native';
import {useLocalSearchParams} from 'expo-router';
import {DetailLayout} from '@/src/components/primitives/layout/DetailLayout';
import {Typography} from '@/src/components/primitives/ui/Typography';

export default function WeekDetailScreen() {
    const {id} = useLocalSearchParams<{id: string}>();

    return (
        <DetailLayout title={`Week ${id}`}>
            <View className="flex-1 items-center justify-center">
                <Typography variant="muted">Week detail coming soon</Typography>
            </View>
        </DetailLayout>
    );
}
