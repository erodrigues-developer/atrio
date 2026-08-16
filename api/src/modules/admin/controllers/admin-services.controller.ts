import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards, Version } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentAdminSession } from 'src/common/decorators/current-admin-session.decorator';
import { AdminAccessTokenGuard } from 'src/common/guards/admin-access-token.guard';
import { AdminSessionContext } from 'src/common/interfaces/admin-session-context.interface';
import {
  AdminServiceDefinitionDto,
  AdminServiceRequestQueryDto,
  AdminStayRequestDto,
  UpdateAdminStayRequestStatusDto,
  UpsertAdminServiceDefinitionDto,
} from '../dto/admin-services.dto';
import { AdminServicesService } from '../services/admin-services.service';

@ApiTags('admin services')
@ApiBearerAuth()
@UseGuards(AdminAccessTokenGuard)
@Controller('admin/services')
export class AdminServicesController {
  constructor(private readonly adminServicesService: AdminServicesService) {}

  @Get()
  @Version('1')
  @ApiOkResponse({ type: [AdminServiceDefinitionDto] })
  async listServices() {
    return this.adminServicesService.listServices();
  }

  @Post()
  @Version('1')
  @ApiOkResponse({ type: AdminServiceDefinitionDto })
  async createService(
    @CurrentAdminSession() session: AdminSessionContext,
    @Body() body: UpsertAdminServiceDefinitionDto,
  ) {
    return this.adminServicesService.createService(session, body);
  }

  @Patch(':serviceId')
  @Version('1')
  @ApiOkResponse({ type: AdminServiceDefinitionDto })
  async updateService(
    @CurrentAdminSession() session: AdminSessionContext,
    @Param('serviceId') serviceId: string,
    @Body() body: UpsertAdminServiceDefinitionDto,
  ) {
    return this.adminServicesService.updateService(session, serviceId, body);
  }

  @Post(':serviceId/publish')
  @Version('1')
  @ApiOkResponse({ type: AdminServiceDefinitionDto })
  async publishService(
    @CurrentAdminSession() session: AdminSessionContext,
    @Param('serviceId') serviceId: string,
  ) {
    return this.adminServicesService.setServicePublished(session, serviceId, true);
  }

  @Post(':serviceId/unpublish')
  @Version('1')
  @ApiOkResponse({ type: AdminServiceDefinitionDto })
  async unpublishService(
    @CurrentAdminSession() session: AdminSessionContext,
    @Param('serviceId') serviceId: string,
  ) {
    return this.adminServicesService.setServicePublished(session, serviceId, false);
  }
}

@ApiTags('admin requests')
@ApiBearerAuth()
@UseGuards(AdminAccessTokenGuard)
@Controller('admin/requests')
export class AdminRequestsController {
  constructor(private readonly adminServicesService: AdminServicesService) {}

  @Get()
  @Version('1')
  @ApiOkResponse({ type: [AdminStayRequestDto] })
  async listRequests(
    @CurrentAdminSession() session: AdminSessionContext,
    @Query() query: AdminServiceRequestQueryDto,
  ) {
    return this.adminServicesService.listRequests(session, query);
  }

  @Patch(':requestId/status')
  @Version('1')
  @ApiOkResponse({ type: AdminStayRequestDto })
  async updateRequestStatus(
    @CurrentAdminSession() session: AdminSessionContext,
    @Param('requestId') requestId: string,
    @Body() body: UpdateAdminStayRequestStatusDto,
  ) {
    return this.adminServicesService.updateRequestStatus(session, requestId, body);
  }
}
