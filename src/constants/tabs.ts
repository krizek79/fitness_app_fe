import type Ionicons from '@expo/vector-icons/Ionicons';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export interface TabConfig {
    name: string;
    href: string;
    label: string;
    icon: IoniconName;
    iconActive: IoniconName;
}

export const TABS: TabConfig[] = [
    {
        name: 'home',
        href: '/home',
        label: 'Home',
        icon: 'home-outline',
        iconActive: 'home',
    },
    {
        name: 'workouts',
        href: '/workouts',
        label: 'Workouts',
        icon: 'barbell-outline',
        iconActive: 'barbell',
    },
    {
        name: 'plans',
        href: '/plans',
        label: 'Plans',
        icon: 'calendar-outline',
        iconActive: 'calendar',
    },
];
