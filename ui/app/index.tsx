import { Redirect } from 'expo-router';

import { useHasHydratedSession, useSession } from '@/src/stores/session.store';

export default function Index() {
  const session = useSession();
  const hasHydratedSession = useHasHydratedSession();

  if (!hasHydratedSession) {
    return null;
  }

  if (session?.isAuthenticated) {
    return <Redirect href="/(guest)/today" />;
  }

  return <Redirect href="/(onboarding)/welcome" />;
}
