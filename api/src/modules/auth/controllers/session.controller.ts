import { Controller, Get, UseGuards, Version } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentSession } from 'src/common/decorators/current-session.decorator';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';
import { AuthSessionContext } from 'src/common/interfaces/auth-session-context.interface';
import { SessionResponseDto } from '../dto/stay-access.dto';
import { AuthService } from '../services/auth.service';

@ApiTags('me')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('me')
export class SessionController {
  constructor(private readonly authService: AuthService) {}

  @Get('session')
  @Version('1')
  @ApiOkResponse({ type: SessionResponseDto })
  async getSession(@CurrentSession() session: AuthSessionContext) {
    return this.authService.getSession(session);
  }
}
