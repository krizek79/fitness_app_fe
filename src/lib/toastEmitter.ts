export type ToastType = 'success' | 'error' | 'info';

export interface ToastEvent {
    type: ToastType;
    text1: string;
    text2?: string;
    key: string;
    onHide: () => void;
}

type Listener = (event: ToastEvent) => void;

let _listener: Listener | null = null;

export const toastEmitter = {
    emit: (event: ToastEvent) => _listener?.(event),
    subscribe: (fn: Listener): (() => void) => {
        _listener = fn;
        return () => {
            _listener = null;
        };
    },
};
