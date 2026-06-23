import {useEffect, useState} from 'react';
import {ActivityIndicator, Pressable, View} from 'react-native';
import {useRouter} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {useColorScheme} from 'nativewind';
import {DraftCreateRequestEntityType} from '@/src/api/generated/model/draftCreateRequestEntityType';
import {getDraftDisplayTitle, useWorkoutDraftList} from '@/src/hooks/useWorkoutDraft';
import type {DraftResponse} from '@/src/api/generated/model';
import {DetailLayout} from '@/src/components/primitives/layout/DetailLayout';
import {Typography} from '@/src/components/primitives/ui/Typography';
import {Button} from '@/src/components/primitives/ui/Button';
import {themeColors} from '@/src/constants/colors';

const ENTITY_TYPE = DraftCreateRequestEntityType.WORKOUT_TEMPLATE;

export default function CreateTemplateScreen() {
    const router = useRouter();
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];

    const {drafts, isLoading, deleteDraft, refresh} = useWorkoutDraftList(ENTITY_TYPE);
    const [redirected, setRedirected] = useState(false);

    useEffect(() => {
        if (isLoading || redirected) return;
        if (drafts.length === 0) {
            setRedirected(true);
            router.replace({pathname: '/workout/draft/[draftId]', params: {draftId: 'new', type: 'template'}});
        }
    }, [isLoading, drafts, redirected]);

    function openDraft(draft: DraftResponse) {
        router.push({pathname: '/workout/draft/[draftId]', params: {draftId: String(draft.id), type: 'template'}});
    }

    function startNew() {
        router.push({pathname: '/workout/draft/[draftId]', params: {draftId: 'new', type: 'template'}});
    }

    if (isLoading || (drafts.length === 0 && !redirected)) {
        return (
            <DetailLayout title="New Template">
                <View className="flex-1 items-center justify-center bg-background">
                    <ActivityIndicator color={palette.primary}/>
                </View>
            </DetailLayout>
        );
    }

    return (
        <DetailLayout title="New Template" headerRight={
            <Pressable onPress={refresh} hitSlop={8} style={{padding: 4}}>
                <Ionicons name="refresh" size={20} color={palette.mutedForeground}/>
            </Pressable>
        }>
            <View className="flex-1 bg-background">
                <View className="px-6 pt-6 pb-4">
                    <Typography variant="muted">
                        You have saved template drafts. Continue one or start fresh.
                    </Typography>
                </View>

                <View className="px-6 gap-3">
                    {drafts.map(draft => (
                        <Pressable
                            key={draft.id}
                            onPress={() => openDraft(draft)}
                            className="flex-row items-center rounded-xl border border-border bg-card px-4 py-4 gap-3"
                        >
                            <Ionicons name="document-text-outline" size={22} color={palette.mutedForeground}/>
                            <View className="flex-1">
                                <Typography variant="body" className="font-semibold text-foreground">
                                    {getDraftDisplayTitle(draft)}
                                </Typography>
                            </View>
                            <Pressable
                                onPress={() => deleteDraft(draft.id!)}
                                hitSlop={8}
                                onStartShouldSetResponder={() => true}
                            >
                                <Ionicons name="trash-outline" size={18} color={palette.mutedForeground}/>
                            </Pressable>
                        </Pressable>
                    ))}
                </View>

                <View className="px-6 pt-6">
                    <Button label="New template" onPress={startNew}/>
                </View>
            </View>
        </DetailLayout>
    );
}
