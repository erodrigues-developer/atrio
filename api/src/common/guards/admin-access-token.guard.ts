import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AdminAuthService } from 'src/modules/admin/services/admin-auth.service';
import { ApiException } from '../exceptions/api.exception';
import { AdminAuthenticatedRequest } from '../interfaces/admin-authenticated-request.interface';

@Injectable()
export class AdminAccessTokenGuard implements CanActivate {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AdminAuthenticatedRequest>();
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new ApiException(401, 'UNAUTHORIZED', 'Missing or invalid admin access token.');
    }

    const accessToken = authorization.replace('Bearer ', '').trim();
    request.adminSession = await this.adminAuthService.validateAccessToken(accessToken);

    return true;
  }
}
