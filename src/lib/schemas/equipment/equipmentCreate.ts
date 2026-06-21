import {z} from 'zod';

export const TITLE_MIN = 2;
export const TITLE_MAX = 64;

export const equipmentCreateSchema = z.object({
    title: z.string()
        .min(TITLE_MIN, `Title must be at least ${TITLE_MIN} characters`)
        .max(TITLE_MAX, `Title must be ${TITLE_MAX} characters or fewer`),
});

export type EquipmentCreateFormValues = z.infer<typeof equipmentCreateSchema>;

export const EQUIPMENT_CREATE_DEFAULTS: EquipmentCreateFormValues = {
    title: '',
};
