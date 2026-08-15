import { Request } from 'express';
import { AdminSessionContext } from './admin-session-context.interface';

export type AdminAuthenticatedRequest = Request & {
  adminSession?: AdminSessionContext;
};
