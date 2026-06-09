import { Redirect } from 'expo-router';

import { useSession } from '@/src/stores/session.store';

export default function Index() {
  const session = useSession();

  if (session?.isAuthenticated) {
    return <Redirect href="/(guest)/today" />;
  }

  return <Redirect href="/(onboarding)/welcome" />;
}
