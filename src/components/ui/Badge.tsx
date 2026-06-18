import { Text, View } from 'react-native';
import { cn } from '@/src/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'destructive' | 'muted';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, { container: string; text: string }> = {
  default:     { container: 'bg-primary',              text: 'text-primary-foreground' },
  success:     { container: 'bg-success',              text: 'text-success-foreground' },
  warning:     { container: 'bg-yellow-100',           text: 'text-yellow-800' },
  destructive: { container: 'bg-destructive',          text: 'text-destructive-foreground' },
  muted:       { container: 'bg-muted',                text: 'text-muted-foreground' },
};

export function Badge({ label, variant = 'default', className }: BadgeProps) {
  const { container, text } = variantStyles[variant];

  return (
    <View className={cn('self-start rounded-full px-2.5 py-0.5', container, className)}>
      <Text className={cn('text-xs font-medium', text)}>{label}</Text>
    </View>
  );
}
