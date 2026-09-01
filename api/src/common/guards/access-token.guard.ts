import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ApiException } from '../exceptions/api.exception';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import { AuthService } from 'src/modules/auth/services/auth.service';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new ApiException(401, 'UNAUTHORIZED', 'Missing or invalid access token.');
    }

    const accessToken = authorization.replace('Bearer ', '').trim();
    request.authSession = await this.authService.validateAccessToken(accessToken);

    return true;
  }
}
