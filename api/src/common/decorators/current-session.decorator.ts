import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthSessionContext } from '../interfaces/auth-session-context.interface';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

export function resolveCurrentSession(context: ExecutionContext): AuthSessionContext {
  const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
  return request.authSession as AuthSessionContext;
}

export const CurrentSession = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthSessionContext => {
    return resolveCurrentSession(context);
  },
);
