// Raw color values matching globals.css — for use where NativeWind classes
// can't reach (e.g. @expo/vector-icons color props, Reanimated Animated.View styles).
export const themeColors = {
    light: {
        primary: 'rgb(250, 204, 21)',
        mutedForeground: 'rgb(115, 107, 99)',
        card: 'rgb(255, 255, 255)',
        border: 'rgb(224, 222, 218)',
        destructive: 'rgb(239, 68, 68)',
    },
    dark: {
        primary: 'rgb(250, 204, 21)',
        mutedForeground: 'rgb(140, 133, 124)',
        card: 'rgb(22, 19, 16)',
        border: 'rgb(45, 41, 35)',
        destructive: 'rgb(220, 38, 38)',
    },
} as const;
