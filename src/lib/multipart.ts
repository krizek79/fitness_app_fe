import {Platform} from 'react-native';
import type {ImagePickerAsset} from 'expo-image-picker';

/**
 * Converts an expo-image-picker asset to a Blob-compatible value for multipart
 * FormData uploads.
 *
 * On web the asset already carries a File object. On native, React Native's
 * FormData implementation accepts a {uri, type, name} descriptor in place of a
 * real Blob — the cast to Blob satisfies the generated Orval type while the
 * native HTTP stack handles the actual file transfer.
 */
export function assetToBlob(asset: ImagePickerAsset): Blob {
    if (Platform.OS === 'web' && asset.file) {
        return asset.file;
    }

    const extension = asset.mimeType?.split('/')[1] ?? 'jpg';

    return {
        uri: asset.uri,
        type: asset.mimeType ?? 'image/jpeg',
        name: asset.fileName ?? `thumbnail.${extension}`,
    } as unknown as Blob;
}
