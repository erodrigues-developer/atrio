import Constants from 'expo-constants';
import { Platform } from 'react-native';

function normalizeApiBaseUrl(value: string) {
  return value.endsWith('/v1') ? value : `${value.replace(/\/$/, '')}/v1`;
}

function getExpoHost() {
  const expoConfig = Constants.expoConfig as { hostUri?: string } | undefined;
  const hostUri = expoConfig?.hostUri;

  if (!hostUri) {
    return null;
  }

  const [host] = hostUri.split(':');
  return host && host !== 'localhost' ? host : null;
}

function getDefaultApiBaseUrl() {
  const expoHost = getExpoHost();

  if (expoHost) {
    return `http://${expoHost}:3101/v1`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3101/v1';
  }

  return 'http://127.0.0.1:3101/v1';
}

export const API_BASE_URL = normalizeApiBaseUrl(
  process.env.EXPO_PUBLIC_API_BASE_URL ?? getDefaultApiBaseUrl(),
);

export const DEFAULT_HOTEL_ID = process.env.EXPO_PUBLIC_HOTEL_ID ?? 'copacabana-palace';
