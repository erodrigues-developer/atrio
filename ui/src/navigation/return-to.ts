import type { Href } from 'expo-router';

export function resolveReturnTo(
  returnTo: string | string[] | undefined,
  fallbackHref: Href,
): Href {
  const resolvedReturnTo = Array.isArray(returnTo) ? returnTo[0] : returnTo;

  if (resolvedReturnTo && resolvedReturnTo.startsWith('/(')) {
    return resolvedReturnTo as Href;
  }

  return fallbackHref;
}
