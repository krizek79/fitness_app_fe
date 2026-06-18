import { Pressable, View, ViewProps } from 'react-native';
import { cn } from '@/src/lib/utils';

type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends ViewProps {
  padding?: CardPadding;
  onPress?: () => void;
}

const paddingStyles: Record<CardPadding, string> = {
  none: '',
  sm:   'p-3',
  md:   'p-4',
  lg:   'p-6',
};

export function Card({ padding = 'md', onPress, className, children, ...props }: CardProps) {
  const base = cn(
    'rounded-lg border border-border bg-card',
    paddingStyles[padding],
    className,
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} className={cn(base, 'active:opacity-75')} {...(props as any)}>
        {children}
      </Pressable>
    );
  }

  return (
    <View className={base} {...props}>
      {children}
    </View>
  );
}
