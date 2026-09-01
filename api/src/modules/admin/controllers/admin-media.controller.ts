import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors, Version } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentAdminSession } from 'src/common/decorators/current-admin-session.decorator';
import { AdminAccessTokenGuard } from 'src/common/guards/admin-access-token.guard';
import { AdminSessionContext } from 'src/common/interfaces/admin-session-context.interface';
import { CreateAdminHotelUsefulInfoDto, UpdateAdminHotelOperationHoursDto, UpdateAdminHotelUsefulInfoDto, UpdateAdminHotelWifiDto } from '../dto/admin-hotel-settings.dto';
import { AdminMediaService } from '../services/admin-media.service';

const mediaBody = {
  schema: {
    type: 'object',
    properties: {
      file: {
        type: 'string',
        format: 'binary',
      },
    },
  },
};

@ApiTags('admin hotel settings')
@ApiBearerAuth()
@UseGuards(AdminAccessTokenGuard)
@Controller('admin/hotels/current')
export class AdminHotelSettingsController {
  constructor(private readonly adminMediaService: AdminMediaService) {}

  @Get()
  @Version('1')
  @ApiOkResponse()
  async getSettings(@CurrentAdminSession() session: AdminSessionContext) {
    return this.adminMediaService.getHotelSettings(session);
  }

  @Patch('wifi')
  @Version('1')
  async updateWifi(@CurrentAdminSession() session: AdminSessionContext, @Body() body: UpdateAdminHotelWifiDto) {
    return this.adminMediaService.updateHotelWifi(session, body);
  }

  @Patch('operation-hours')
  @Version('1')
  async updateOperationHours(
    @CurrentAdminSession() session: AdminSessionContext,
    @Body() body: UpdateAdminHotelOperationHoursDto,
  ) {
    return this.adminMediaService.updateHotelOperationHours(session, body);
  }

  @Post('useful-info')
  @Version('1')
  async createUsefulInfo(@CurrentAdminSession() session: AdminSessionContext, @Body() body: CreateAdminHotelUsefulInfoDto) {
    return this.adminMediaService.createHotelUsefulInfo(session, body);
  }

  @Patch('useful-info/:infoId')
  @Version('1')
  async updateUsefulInfo(
    @CurrentAdminSession() session: AdminSessionContext,
    @Param('infoId') infoId: string,
    @Body() body: UpdateAdminHotelUsefulInfoDto,
  ) {
    return this.adminMediaService.updateHotelUsefulInfo(session, infoId, body);
  }

  @Delete('useful-info/:infoId')
  @Version('1')
  async deleteUsefulInfo(
    @CurrentAdminSession() session: AdminSessionContext,
    @Param('infoId') infoId: string,
  ) {
    return this.adminMediaService.deleteHotelUsefulInfo(session, infoId);
  }

  @Post('logo')
  @Version('1')
  @ApiConsumes('multipart/form-data')
  @ApiBody(mediaBody)
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(@CurrentAdminSession() session: AdminSessionContext, @UploadedFile() file: any) {
    return this.adminMediaService.uploadHotelImage(session, 'logo', file);
  }

  @Post('hero-image')
  @Version('1')
  @ApiConsumes('multipart/form-data')
  @ApiBody(mediaBody)
  @UseInterceptors(FileInterceptor('file'))
  async uploadHeroImage(@CurrentAdminSession() session: AdminSessionContext, @UploadedFile() file: any) {
    return this.adminMediaService.uploadHotelImage(session, 'hero-image', file);
  }
}

@ApiTags('admin experience media')
@ApiBearerAuth()
@UseGuards(AdminAccessTokenGuard)
@Controller('admin')
export class AdminExperienceMediaController {
  constructor(private readonly adminMediaService: AdminMediaService) {}

  @Post('experiences/:experienceId/image')
  @Version('1')
  @ApiConsumes('multipart/form-data')
  @ApiBody(mediaBody)
  @UseInterceptors(FileInterceptor('file'))
  async uploadExperienceImage(
    @CurrentAdminSession() session: AdminSessionContext,
    @Param('experienceId') experienceId: string,
    @UploadedFile() file: any,
  ) {
    return this.adminMediaService.uploadExperienceImage(session, experienceId, file);
  }

  @Post('experience-collections/:collectionId/image')
  @Version('1')
  @ApiConsumes('multipart/form-data')
  @ApiBody(mediaBody)
  @UseInterceptors(FileInterceptor('file'))
  async uploadCollectionImage(
    @CurrentAdminSession() session: AdminSessionContext,
    @Param('collectionId') collectionId: string,
    @UploadedFile() file: any,
  ) {
    return this.adminMediaService.uploadCollectionImage(session, collectionId, file);
  }
}
