import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards, Version } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentAdminSession } from 'src/common/decorators/current-admin-session.decorator';
import { AdminAccessTokenGuard } from 'src/common/guards/admin-access-token.guard';
import { AdminSessionContext } from 'src/common/interfaces/admin-session-context.interface';
import {
  AdminGuestListQueryDto,
  AdminGuestResponseDto,
  AdminStayListQueryDto,
  AdminStayResponseDto,
  AdminStayUsefulInfoResponseDto,
  AdminConsumptionItemResponseDto,
  CreateAdminConsumptionItemDto,
  CreateAdminGuestDto,
  CreateAdminStayDto,
  CreateAdminStayUsefulInfoDto,
  UpdateAdminStayDto,
  UpdateAdminStayWifiDto,
} from '../dto/admin-stays.dto';
import { AdminStaysService } from '../services/admin-stays.service';

@ApiTags('admin guests')
@ApiBearerAuth()
@UseGuards(AdminAccessTokenGuard)
@Controller('admin/guests')
export class AdminGuestsController {
  constructor(private readonly adminStaysService: AdminStaysService) {}

  @Get()
  @Version('1')
  @ApiOkResponse({ type: [AdminGuestResponseDto] })
  async listGuests(
    @CurrentAdminSession() session: AdminSessionContext,
    @Query() query: AdminGuestListQueryDto,
  ) {
    return this.adminStaysService.listGuests(session, query.search);
  }

  @Post()
  @Version('1')
  @ApiOkResponse({ type: AdminGuestResponseDto })
  async createGuest(
    @CurrentAdminSession() session: AdminSessionContext,
    @Body() body: CreateAdminGuestDto,
  ) {
    return this.adminStaysService.createGuest(session, body);
  }
}

@ApiTags('admin stays')
@ApiBearerAuth()
@UseGuards(AdminAccessTokenGuard)
@Controller('admin/stays')
export class AdminStaysController {
  constructor(private readonly adminStaysService: AdminStaysService) {}

  @Get()
  @Version('1')
  @ApiOkResponse({ type: [AdminStayResponseDto] })
  async listStays(
    @CurrentAdminSession() session: AdminSessionContext,
    @Query() query: AdminStayListQueryDto,
  ) {
    return this.adminStaysService.listStays(session, query);
  }

  @Post()
  @Version('1')
  @ApiOkResponse({ type: AdminStayResponseDto })
  async createStay(
    @CurrentAdminSession() session: AdminSessionContext,
    @Body() body: CreateAdminStayDto,
  ) {
    return this.adminStaysService.createStay(session, body);
  }

  @Get(':stayId')
  @Version('1')
  @ApiOkResponse({ type: AdminStayResponseDto })
  async getStay(
    @CurrentAdminSession() session: AdminSessionContext,
    @Param('stayId') stayId: string,
  ) {
    return this.adminStaysService.getStay(session, stayId);
  }

  @Patch(':stayId')
  @Version('1')
  @ApiOkResponse({ type: AdminStayResponseDto })
  async updateStay(
    @CurrentAdminSession() session: AdminSessionContext,
    @Param('stayId') stayId: string,
    @Body() body: UpdateAdminStayDto,
  ) {
    return this.adminStaysService.updateStay(session, stayId, body);
  }

  @Post(':stayId/access/resend')
  @Version('1')
  async resendAccess(
    @CurrentAdminSession() session: AdminSessionContext,
    @Param('stayId') stayId: string,
  ) {
    return this.adminStaysService.resendAccess(session, stayId);
  }

  @Post(':stayId/sessions/revoke')
  @Version('1')
  async revokeGuestSessions(
    @CurrentAdminSession() session: AdminSessionContext,
    @Param('stayId') stayId: string,
  ) {
    return this.adminStaysService.revokeGuestSessions(session, stayId);
  }

  @Post(':stayId/check-in')
  @Version('1')
  @ApiOkResponse({ type: AdminStayResponseDto })
  async checkInStay(
    @CurrentAdminSession() session: AdminSessionContext,
    @Param('stayId') stayId: string,
  ) {
    return this.adminStaysService.checkInStay(session, stayId);
  }

  @Post(':stayId/check-out')
  @Version('1')
  async checkOutStay(
    @CurrentAdminSession() session: AdminSessionContext,
    @Param('stayId') stayId: string,
  ) {
    return this.adminStaysService.checkOutStay(session, stayId);
  }

  @Post(':stayId/cancel')
  @Version('1')
  @ApiOkResponse({ type: AdminStayResponseDto })
  async cancelStay(
    @CurrentAdminSession() session: AdminSessionContext,
    @Param('stayId') stayId: string,
  ) {
    return this.adminStaysService.cancelStay(session, stayId);
  }

  @Patch(':stayId/wifi')
  @Version('1')
  @ApiOkResponse({ type: AdminStayResponseDto })
  async updateWifi(
    @CurrentAdminSession() session: AdminSessionContext,
    @Param('stayId') stayId: string,
    @Body() body: UpdateAdminStayWifiDto,
  ) {
    return this.adminStaysService.updateWifi(session, stayId, body);
  }

  @Get(':stayId/useful-info')
  @Version('1')
  @ApiOkResponse({ type: [AdminStayUsefulInfoResponseDto] })
  async listUsefulInfo(
    @CurrentAdminSession() session: AdminSessionContext,
    @Param('stayId') stayId: string,
  ) {
    return this.adminStaysService.listUsefulInfo(session, stayId);
  }

  @Post(':stayId/useful-info')
  @Version('1')
  @ApiOkResponse({ type: AdminStayUsefulInfoResponseDto })
  async createUsefulInfo(
    @CurrentAdminSession() session: AdminSessionContext,
    @Param('stayId') stayId: string,
    @Body() body: CreateAdminStayUsefulInfoDto,
  ) {
    return this.adminStaysService.createUsefulInfo(session, stayId, body);
  }

  @Get(':stayId/consumption')
  @Version('1')
  @ApiOkResponse({ type: [AdminConsumptionItemResponseDto] })
  async listConsumption(
    @CurrentAdminSession() session: AdminSessionContext,
    @Param('stayId') stayId: string,
  ) {
    return this.adminStaysService.listConsumption(session, stayId);
  }

  @Post(':stayId/consumption')
  @Version('1')
  @ApiOkResponse({ type: AdminConsumptionItemResponseDto })
  async createConsumption(
    @CurrentAdminSession() session: AdminSessionContext,
    @Param('stayId') stayId: string,
    @Body() body: CreateAdminConsumptionItemDto,
  ) {
    return this.adminStaysService.createConsumption(session, stayId, body);
  }
}
