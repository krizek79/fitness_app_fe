import {Image, Platform, Pressable, Text, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useColorScheme} from 'nativewind';
import type {ImagePickerAsset} from 'expo-image-picker';
import {useImagePicker} from '@/src/hooks/useImagePicker';
import {themeColors} from '@/src/constants/colors';
import {Typography} from '../ui/Typography';

interface ImagePickerFieldProps {
    label?: string;
    value: ImagePickerAsset | null;
    onChange: (asset: ImagePickerAsset | null) => void;
    existingUrl?: string | null;
    onDeleteExisting?: () => void;
    isDeletingExisting?: boolean;
    error?: string;
}

export function ImagePickerField({label, value, onChange, existingUrl, onDeleteExisting, isDeletingExisting, error}: ImagePickerFieldProps) {
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];
    const {pickImage} = useImagePicker();

    async function handlePick() {
        const asset = await pickImage();
        if (asset) onChange(asset);
    }

    const showExisting = !!existingUrl && !value;
    const previewUri = value?.uri ?? (showExisting ? existingUrl : null);

    return (
        <View className="gap-1.5">
            {label && (
                <Typography variant="body-sm" className="font-medium text-foreground">{label}</Typography>
            )}

            <Pressable
                onPress={handlePick}
                className="w-full rounded-xl border border-dashed border-input bg-muted/30 overflow-hidden"
                style={{height: 180}}
                accessibilityRole="button"
                accessibilityLabel={previewUri ? 'Change thumbnail' : 'Add thumbnail'}
            >
                {previewUri ? (
                    <>
                        {Platform.OS === 'web' ? (
                            <img
                                src={previewUri}
                                style={{width: '100%', height: '100%', objectFit: 'cover'}}
                             alt=""/>
                        ) : (
                            <Image
                                source={{uri: previewUri}}
                                style={{width: '100%', height: '100%'}}
                                resizeMode="cover"
                            />
                        )}

                        {value ? (
                            <Pressable
                                onPress={e => {
                                    e.stopPropagation?.();
                                    onChange(null);
                                }}
                                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 items-center justify-center"
                                accessibilityLabel="Remove selected image"
                            >
                                <Ionicons name="close" size={16} color="#ffffff"/>
                            </Pressable>
                        ) : onDeleteExisting ? (
                            <Pressable
                                onPress={e => {
                                    e.stopPropagation?.();
                                    onDeleteExisting();
                                }}
                                disabled={isDeletingExisting}
                                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 items-center justify-center"
                                accessibilityLabel="Delete thumbnail"
                            >
                                <Ionicons name={isDeletingExisting ? 'hourglass-outline' : 'trash-outline'} size={16} color="#ffffff"/>
                            </Pressable>
                        ) : null}
                    </>
                ) : (
                    <View className="flex-1 items-center justify-center gap-2">
                        <Ionicons name="image-outline" size={32} color={palette.mutedForeground}/>
                        <Typography variant="body-sm" className="text-muted-foreground">
                            Tap to add thumbnail
                        </Typography>
                    </View>
                )}
            </Pressable>

            {error && (
                <Text className="text-xs text-destructive">{error}</Text>
            )}
        </View>
    );
}
