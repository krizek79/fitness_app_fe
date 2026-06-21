import {z} from 'zod';

export const equipmentFilterSchema = z.object({
    title: z.string(),
    sortDirection: z.enum(['ASC', 'DESC']),
});

export type EquipmentFilterFormValues = z.infer<typeof equipmentFilterSchema>;

export const EQUIPMENT_FILTER_DEFAULTS: EquipmentFilterFormValues = {
    title: '',
    sortDirection: 'ASC',
};
