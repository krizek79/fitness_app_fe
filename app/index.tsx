import { View } from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { useCurrentUser } from '@/src/context/UserContext';
import { Button } from '@/src/components/ui/Button';
import { Heading } from '@/src/components/ui/Typography';
import { Typography } from '@/src/components/ui/Typography';

export default function Index() {
  const { logout } = useAuth();
  const { currentUser, isLoading } = useCurrentUser();

  return (
    <View className="flex-1 items-center justify-center gap-6 bg-background px-8">
      <View className="items-center gap-1">
        <Heading level="h2">Welcome</Heading>
        {currentUser?.profile?.name && !isLoading && (
          <Typography variant="muted">{currentUser.profile.name}</Typography>
        )}
      </View>

      <Button
        label="Log out"
        onPress={logout}
        variant="ghost"
        loading={isLoading}
        fullWidth={false}
      />
    </View>
  );
}
