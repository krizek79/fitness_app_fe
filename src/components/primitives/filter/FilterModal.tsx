import {Modal, Platform, Pressable, ScrollView, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useColorScheme} from 'nativewind';
import {themeColors} from '@/src/constants/colors';
import {Typography} from '../ui/Typography';
import {Button} from '../ui/Button';

interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
    onApply: () => void;
    title?: string;
    children: React.ReactNode;
}

export function FilterModal({visible, onClose, onApply, title = 'Filters', children}: FilterModalProps) {
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];
    const modalBg = colorScheme === 'dark' ? '#0f0f0f' : '#ffffff';

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
            onRequestClose={onClose}
        >
            <View style={{flex: 1, backgroundColor: modalBg}}>
                <View
                    className="flex-row items-center justify-between border-b border-border px-4"
                    style={{paddingTop: Platform.OS === 'ios' ? 16 : 48, paddingBottom: 12}}
                >
                    <Typography variant="body" className="font-semibold text-foreground">
                        {title}
                    </Typography>
                    <Pressable onPress={onClose} hitSlop={12}>
                        <Ionicons name="close" size={22} color={palette.mutedForeground}/>
                    </Pressable>
                </View>

                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{padding: 24, gap: 24}}
                    keyboardShouldPersistTaps="handled"
                >
                    {children}
                </ScrollView>

                <View className="px-4 pb-8 pt-3 border-t border-border">
                    <Button label="Done" onPress={onApply}/>
                </View>
            </View>
        </Modal>
    );
}
