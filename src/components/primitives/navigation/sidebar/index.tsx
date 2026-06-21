import {forwardRef, useImperativeHandle, useRef} from 'react';
import {useWindowDimensions} from 'react-native';
import {MobileDrawer, type MobileDrawerRef} from './MobileDrawer';
import {DesktopSidebar} from './DesktopSidebar';
import {MOBILE_BREAKPOINT} from './constants';

export interface SidebarRef {
    openDrawer: () => void;
}

export const Sidebar = forwardRef<SidebarRef>(function Sidebar(_, ref) {
    const {width: windowWidth} = useWindowDimensions();
    const drawerRef = useRef<MobileDrawerRef>(null);

    useImperativeHandle(ref, () => ({
        openDrawer() {
            drawerRef.current?.open();
        },
    }));

    if (windowWidth < MOBILE_BREAKPOINT) {
        return <MobileDrawer ref={drawerRef}/>;
    }

    return <DesktopSidebar/>;
});
