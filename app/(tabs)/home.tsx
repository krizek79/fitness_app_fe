import {View} from 'react-native';
import {Heading} from '@/src/components/ui/Typography';

export default function HomeScreen() {
    return (
        <View className="flex-1 items-center justify-center bg-background">
            <Heading level="h2">Home</Heading>
        </View>
    );
}
