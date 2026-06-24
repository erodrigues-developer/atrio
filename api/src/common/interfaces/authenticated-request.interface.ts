import { Request } from 'express';
import { AuthSessionContext } from './auth-session-context.interface';

export type AuthenticatedRequest = Request & {
  authSession?: AuthSessionContext;
};
