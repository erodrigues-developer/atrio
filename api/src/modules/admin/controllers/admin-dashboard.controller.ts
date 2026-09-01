import { Controller, Get, UseGuards, Version } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentAdminSession } from 'src/common/decorators/current-admin-session.decorator';
import { AdminAccessTokenGuard } from 'src/common/guards/admin-access-token.guard';
import { AdminSessionContext } from 'src/common/interfaces/admin-session-context.interface';
import { AdminDashboardResponseDto } from '../dto/admin-dashboard.dto';
import { AdminDashboardService } from '../services/admin-dashboard.service';

@ApiTags('admin dashboard')
@ApiBearerAuth()
@UseGuards(AdminAccessTokenGuard)
@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Get()
  @Version('1')
  @ApiOkResponse({ type: AdminDashboardResponseDto })
  async getDashboard(@CurrentAdminSession() session: AdminSessionContext) {
    return this.adminDashboardService.getDashboard(session);
  }
}
