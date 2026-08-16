import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AdminAuthenticatedRequest } from '../interfaces/admin-authenticated-request.interface';
import { AdminSessionContext } from '../interfaces/admin-session-context.interface';

export function resolveCurrentAdminSession(context: ExecutionContext): AdminSessionContext {
  const request = context.switchToHttp().getRequest<AdminAuthenticatedRequest>();
  return request.adminSession as AdminSessionContext;
}

export const CurrentAdminSession = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AdminSessionContext => {
    return resolveCurrentAdminSession(context);
  },
);
