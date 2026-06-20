import {View} from 'react-native';
import {Heading} from '@/src/components/primitives/Typography';

export default function WorkoutsScreen() {
    return (
        <View className="flex-1 items-center justify-center bg-background">
            <Heading level="h2">Workouts</Heading>
        </View>
    );
}
