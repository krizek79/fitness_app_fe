import {View} from 'react-native';
import {ExerciseMuscleRoleInputRequestType} from '@/src/api/generated/model';
import type {
    ExerciseMuscleRoleInputRequestMuscle as MuscleEnum,
    ExerciseMuscleRoleInputRequestType as MuscleType,
} from '@/src/api/generated/model';
import {ReferenceDataType} from '@/src/constants/referenceDataTypes';
import {ReferenceDataChips} from '@/src/components/primitives/form/ReferenceDataChips';
import {Typography} from '@/src/components/primitives/ui/Typography';

export interface MuscleRole {
    muscle: MuscleEnum;
    type: MuscleType;
}

interface MuscleRoleSelectorProps {
    value: MuscleRole[];
    onChange: (value: MuscleRole[]) => void;
    error?: string;
}

export function MuscleRoleSelector({value, onChange, error}: MuscleRoleSelectorProps) {
    const primaryKeys = value
        .filter(m => m.type === ExerciseMuscleRoleInputRequestType.PRIMARY)
        .map(m => m.muscle as string);

    const secondaryKeys = value
        .filter(m => m.type === ExerciseMuscleRoleInputRequestType.SECONDARY)
        .map(m => m.muscle as string);

    function toggleMuscle(key: string, type: MuscleType) {
        const muscle = key as MuscleEnum;
        const existingIndex = value.findIndex(m => m.muscle === muscle && m.type === type);
        if (existingIndex >= 0) {
            onChange(value.filter((_, i) => i !== existingIndex));
        } else {
            onChange([...value.filter(m => m.muscle !== muscle), {muscle, type}]);
        }
    }

    return (
        <View className="gap-4">
            <View>
                <Typography variant="body-sm" className="font-medium text-foreground mb-2">Muscles</Typography>
                <Typography variant="caption" className="text-muted-foreground mb-3">
                    Select primary and secondary muscles. A muscle can only have one role.
                </Typography>
            </View>

            <ReferenceDataChips
                label="Primary"
                type={ReferenceDataType.MUSCLES}
                selected={primaryKeys}
                onToggle={key => toggleMuscle(key, ExerciseMuscleRoleInputRequestType.PRIMARY)}
                disabledKeys={secondaryKeys}
                error={error}
            />

            <ReferenceDataChips
                label="Secondary"
                type={ReferenceDataType.MUSCLES}
                selected={secondaryKeys}
                onToggle={key => toggleMuscle(key, ExerciseMuscleRoleInputRequestType.SECONDARY)}
                disabledKeys={primaryKeys}
            />
        </View>
    );
}
