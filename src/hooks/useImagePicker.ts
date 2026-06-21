import {launchImageLibraryAsync, requestMediaLibraryPermissionsAsync, MediaType} from 'expo-image-picker';
import type {ImagePickerAsset} from 'expo-image-picker';

export type {ImagePickerAsset};

export function useImagePicker() {
    async function pickImage(): Promise<ImagePickerAsset | null> {
        const {granted} = await requestMediaLibraryPermissionsAsync();
        if (!granted) return null;

        const result = await launchImageLibraryAsync({
            mediaTypes: ['images'] as MediaType[],
            allowsEditing: true,
            quality: 0.8,
        });

        if (result.canceled) return null;
        return result.assets[0];
    }

    return {pickImage};
}
