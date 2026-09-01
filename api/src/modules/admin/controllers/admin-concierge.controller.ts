import { Body, Controller, Get, Param, Post, Query, UseGuards, Version } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentAdminSession } from 'src/common/decorators/current-admin-session.decorator';
import { AdminAccessTokenGuard } from 'src/common/guards/admin-access-token.guard';
import { AdminSessionContext } from 'src/common/interfaces/admin-session-context.interface';
import { AdminConciergeQueryDto, CreateAdminConciergeMessageDto } from '../dto/admin-concierge.dto';
import { AdminConciergeService } from '../services/admin-concierge.service';

@ApiTags('admin concierge')
@ApiBearerAuth()
@UseGuards(AdminAccessTokenGuard)
@Controller('admin/concierge')
export class AdminConciergeController {
  constructor(private readonly adminConciergeService: AdminConciergeService) {}

  @Get('conversations')
  @Version('1')
  @ApiOkResponse()
  async listConversations(@CurrentAdminSession() session: AdminSessionContext, @Query() query: AdminConciergeQueryDto) {
    return this.adminConciergeService.listConversations(session, query);
  }

  @Get('conversations/:stayId/messages')
  @Version('1')
  @ApiOkResponse()
  async listMessages(@CurrentAdminSession() session: AdminSessionContext, @Param('stayId') stayId: string) {
    return this.adminConciergeService.listMessages(session, stayId);
  }

  @Post('conversations/:stayId/messages')
  @Version('1')
  @ApiOkResponse()
  async createHotelMessage(
    @CurrentAdminSession() session: AdminSessionContext,
    @Param('stayId') stayId: string,
    @Body() body: CreateAdminConciergeMessageDto,
  ) {
    return this.adminConciergeService.createHotelMessage(session, stayId, body);
  }
}

