import { useState } from 'react';
import { Pressable, Text, TextInput, TextInputProps, View } from 'react-native';
import { cn } from '@/src/lib/utils';

interface InputProps extends Omit<TextInputProps, 'secureTextEntry'> {
  label?: string;
  error?: string;
  secure?: boolean;
}

export function Input({ label, error, secure = false, className, ...props }: InputProps) {
  const [hidden, setHidden] = useState(secure);

  return (
    <View className="w-full gap-1.5">
      {label && (
        <Text className="text-sm font-medium text-foreground">{label}</Text>
      )}

      <View className="relative">
        <TextInput
          secureTextEntry={hidden}
          placeholderTextColor="rgb(var(--muted-foreground))"
          className={cn(
            'w-full rounded-md border bg-background px-4 py-3 text-base text-foreground',
            error ? 'border-destructive' : 'border-input',
            secure && 'pr-12',
            className,
          )}
          {...props}
        />

        {secure && (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            className="absolute right-3 top-0 h-full items-center justify-center px-1"
          >
            <Text className="text-sm text-muted-foreground">{hidden ? 'Show' : 'Hide'}</Text>
          </Pressable>
        )}
      </View>

      {error && (
        <Text className="text-sm text-destructive">{error}</Text>
      )}
    </View>
  );
}
