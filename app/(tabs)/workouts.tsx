import {useState} from 'react';
import {SafeAreaView, View} from 'react-native';
import {useRouter} from 'expo-router';
import {Fab} from '@/src/components/primitives/ui/Fab';
import {SegmentedControl} from '@/src/components/primitives/ui/SegmentedControl';
import {WorkoutList} from '@/src/components/workouts/WorkoutList';

type WorkoutSegment = 'quick' | 'templates';

const SEGMENTS = [
    {value: 'quick' as const, label: 'Quick'},
    {value: 'templates' as const, label: 'Templates'},
] as const;

export default function WorkoutsScreen() {
    const router = useRouter();
    const [segment, setSegment] = useState<WorkoutSegment>('quick');

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="px-6 pt-4 pb-2">
                <SegmentedControl
                    options={SEGMENTS}
                    value={segment}
                    onChange={setSegment}
                />
            </View>

            <WorkoutList
                isQuick={true}
                isTemplate={false}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onPress={id => router.push({pathname: '/workout/[id]' as any, params: {id}})}
                fab={<Fab onPress={() => router.push('/workout/create')} accessibilityLabel="Create quick workout"/>}
                style={{display: segment === 'quick' ? 'flex' : 'none'}}
            />
            <WorkoutList
                isQuick={false}
                isTemplate={true}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onPress={id => router.push({pathname: '/workout/[id]' as any, params: {id}})}
                fab={<Fab onPress={() => router.push('/workout/create-template')} accessibilityLabel="Create template"/>}
                style={{display: segment === 'templates' ? 'flex' : 'none'}}
            />
        </SafeAreaView>
    );
}
