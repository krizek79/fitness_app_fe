import {Fab} from '@/src/components/primitives/Fab';

interface CreatePlanFabProps {
    onPress: () => void;
}

export function CreatePlanFab({onPress}: CreatePlanFabProps) {
    return <Fab onPress={onPress} icon="add" accessibilityLabel="Create new plan"/>;
}
