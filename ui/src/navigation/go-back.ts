import { router, type Href } from 'expo-router';

export function goBackOrReplace(fallbackHref: Href) {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace(fallbackHref);
}
