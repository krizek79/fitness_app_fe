import {toastEmitter, ToastType} from './emitter';

/**
 * Keys of toasts currently visible or queued. Prevents duplicate toasts for
 * the same error (e.g. server-down triggering 10 simultaneous failures).
 */
const activeKeys = new Set<string>();

function show(type: ToastType, text1: string, text2?: string, key = text1) {
    if (activeKeys.has(key)) return;

    activeKeys.add(key);
    toastEmitter.emit({
        type,
        text1,
        text2,
        key,
        onHide: () => activeKeys.delete(key),
    });
}

export const toast = {
    success: (text1: string, text2?: string, key?: string) =>
        show('success', text1, text2, key),

    error: (text1: string, text2?: string, key?: string) =>
        show('error', text1, text2, key),

    info: (text1: string, text2?: string, key?: string) =>
        show('info', text1, text2, key),
};
