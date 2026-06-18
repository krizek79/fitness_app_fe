import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { useCurrentUser } from '@/src/context/UserContext';

export default function Index() {
  const { logout } = useAuth();
  const { currentUser, isLoading } = useCurrentUser();

  return (
    <View className="flex-1 items-center justify-center gap-6 bg-background px-8">
      <View className="items-center">
        <Text className="text-2xl font-bold text-foreground">Welcome</Text>
        {isLoading ? (
          <ActivityIndicator className="mt-2" />
        ) : (
          <>
            {currentUser?.profile?.name && (
              <Text className="mt-1 text-base text-muted-foreground">
                {currentUser.profile.name}
              </Text>
            )}
            {currentUser?.email && (
              <Text className="text-sm text-muted-foreground">{currentUser.email}</Text>
            )}
          </>
        )}
      </View>

      <Pressable
        onPress={logout}
        className="rounded-xl border border-border bg-card px-8 py-3 active:opacity-70"
      >
        <Text className="text-base font-semibold text-card-foreground">Log out</Text>
      </Pressable>
    </View>
  );
}
