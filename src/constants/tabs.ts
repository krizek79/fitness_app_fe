import type Ionicons from '@expo/vector-icons/Ionicons';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export interface TabConfig {
    name: string;
    href: string;
    label: string;
    icon: IoniconName;
    iconActive: IoniconName;
    adminOnly?: boolean;
    /** Sidebar section header this tab belongs to. Tabs with a section are hidden from the mobile tab bar. */
    section?: string;
    /** Only appears in the mobile tab bar, not in the sidebar (e.g. the Admin hub). */
    mobileOnly?: boolean;
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
        name: 'plans',
        href: '/plans',
        label: 'Plans',
        icon: 'calendar-outline',
        iconActive: 'calendar',
    },
    {
        // Mobile-only hub that replaces the individual admin tabs in the tab bar
        name: 'admin',
        href: '/admin',
        label: 'Admin',
        icon: 'shield-outline',
        iconActive: 'shield',
        adminOnly: true,
        mobileOnly: true,
    },
    {
        name: 'exercises',
        href: '/exercises',
        label: 'Exercises',
        icon: 'barbell-outline',
        iconActive: 'barbell',
        adminOnly: true,
        section: 'Admin',
    },
    {
        name: 'equipment',
        href: '/equipment',
        label: 'Equipment',
        icon: 'bicycle-outline',
        iconActive: 'bicycle',
        adminOnly: true,
        section: 'Admin',
    },
];
