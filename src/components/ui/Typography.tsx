import {Text, TextProps} from 'react-native';
import {cn} from '@/src/lib/utils';

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4';
type TextVariant = 'body' | 'body-sm' | 'caption' | 'muted';

interface HeadingProps extends TextProps {
    level?: HeadingLevel;
}

interface TypographyProps extends TextProps {
    variant?: TextVariant;
}

const headingStyles: Record<HeadingLevel, string> = {
    h1: 'text-3xl font-bold text-foreground',
    h2: 'text-2xl font-bold text-foreground',
    h3: 'text-xl font-semibold text-foreground',
    h4: 'text-lg font-semibold text-foreground',
};

const textStyles: Record<TextVariant, string> = {
    'body': 'text-base font-normal text-foreground',
    'body-sm': 'text-sm font-normal text-foreground',
    'caption': 'text-xs font-normal text-foreground',
    'muted': 'text-sm font-normal text-muted-foreground',
};

export function Heading({level = 'h2', className, children, ...props}: HeadingProps) {
    return (
        <Text className={cn(headingStyles[level], className)} {...props}>
            {children}
        </Text>
    );
}

export function Typography({variant = 'body', className, children, ...props}: TypographyProps) {
    return (
        <Text className={cn(textStyles[variant], className)} {...props}>
            {children}
        </Text>
    );
}
