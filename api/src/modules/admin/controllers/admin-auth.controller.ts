import { Body, Controller, Get, Post, UseGuards, Version } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentAdminSession } from 'src/common/decorators/current-admin-session.decorator';
import { AdminAccessTokenGuard } from 'src/common/guards/admin-access-token.guard';
import { AdminSessionContext } from 'src/common/interfaces/admin-session-context.interface';
import { AdminLoginRequestDto, AdminLoginResponseDto, AdminMeResponseDto } from '../dto/admin-auth.dto';
import { AdminAuthService } from '../services/admin-auth.service';

@ApiTags('admin auth')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('login')
  @Version('1')
  @ApiOkResponse({ type: AdminLoginResponseDto })
  async login(@Body() body: AdminLoginRequestDto) {
    return this.adminAuthService.login(body.email, body.password);
  }

  @Post('logout')
  @Version('1')
  @ApiBearerAuth()
  @UseGuards(AdminAccessTokenGuard)
  async logout(@CurrentAdminSession() session: AdminSessionContext) {
    return this.adminAuthService.logout(session);
  }
}

@ApiTags('admin me')
@Controller('admin')
export class AdminMeController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Get('me')
  @Version('1')
  @ApiBearerAuth()
  @UseGuards(AdminAccessTokenGuard)
  @ApiOkResponse({ type: AdminMeResponseDto })
  async me(@CurrentAdminSession() session: AdminSessionContext) {
    return this.adminAuthService.getMe(session);
  }
}
