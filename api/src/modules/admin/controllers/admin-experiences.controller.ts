import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Version,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentAdminSession } from 'src/common/decorators/current-admin-session.decorator';
import { AdminAccessTokenGuard } from 'src/common/guards/admin-access-token.guard';
import { AdminSessionContext } from 'src/common/interfaces/admin-session-context.interface';
import {
  AdminCollectionDto,
  AdminExperienceDto,
  AdminExperienceListResponseDto,
  AdminExperienceQueryDto,
  AdminExperienceSlotDto,
  AdminReservationDto,
  AdminReservationListResponseDto,
  AdminReservationQueryDto,
  CreateAdminExperienceSlotDto,
  CreateAdminReservationDto,
  LinkExperienceToCollectionDto,
  UpdateAdminExperienceSlotDto,
  UpdateAdminReservationStatusDto,
  UpsertAdminCollectionDto,
  UpsertAdminExperienceDto,
} from '../dto/admin-experiences.dto';
import { AdminExperiencesService } from '../services/admin-experiences.service';

@ApiTags('admin experiences')
@ApiBearerAuth()
@UseGuards(AdminAccessTokenGuard)
@Controller('admin/experiences')
export class AdminExperiencesController {
  constructor(
    private readonly adminExperiencesService: AdminExperiencesService,
  ) {}

  @Get()
  @Version('1')
  @ApiOkResponse({ type: AdminExperienceListResponseDto })
  async listExperiences(@Query() query: AdminExperienceQueryDto) {
    return this.adminExperiencesService.listExperiences(query);
  }

  @Post()
  @Version('1')
  @ApiOkResponse({ type: AdminExperienceDto })
  async createExperience(
    @CurrentAdminSession() session: AdminSessionContext,
    @Body() body: UpsertAdminExperienceDto,
  ) {
    return this.adminExperiencesService.createExperience(session, body);
  }

  @Patch(':experienceId')
  @Version('1')
  @ApiOkResponse({ type: AdminExperienceDto })
  async updateExperience(
    @CurrentAdminSession() session: AdminSessionContext,
    @Param('experienceId') experienceId: string,
    @Body() body: UpsertAdminExperienceDto,
  ) {
    return this.adminExperiencesService.updateExperience(
      session,
      experienceId,
      body,
    );
  }

  @Get(':experienceId/slots')
  @Version('1')
  @ApiOkResponse({ type: [AdminExperienceSlotDto] })
  async listSlots(@Param('experienceId') experienceId: string) {
    return this.adminExperiencesService.listSlots(experienceId);
  }

  @Post(':experienceId/slots')
  @Version('1')
  @ApiOkResponse({ type: AdminExperienceSlotDto })
  async createSlot(
    @CurrentAdminSession() session: AdminSessionContext,
    @Param('experienceId') experienceId: string,
    @Body() body: CreateAdminExperienceSlotDto,
  ) {
    return this.adminExperiencesService.createSlot(session, experienceId, body);
  }

  @Patch(':experienceId/slots/:slotId')
  @Version('1')
  @ApiOkResponse({ type: AdminExperienceSlotDto })
  async updateSlot(
    @CurrentAdminSession() session: AdminSessionContext,
    @Param('experienceId') experienceId: string,
    @Param('slotId') slotId: string,
    @Body() body: UpdateAdminExperienceSlotDto,
  ) {
    return this.adminExperiencesService.updateSlot(
      session,
      experienceId,
      slotId,
      body,
    );
  }
}

@ApiTags('admin experience collections')
@ApiBearerAuth()
@UseGuards(AdminAccessTokenGuard)
@Controller('admin/experience-collections')
export class AdminExperienceCollectionsController {
  constructor(
    private readonly adminExperiencesService: AdminExperiencesService,
  ) {}

  @Get()
  @Version('1')
  @ApiOkResponse({ type: [AdminCollectionDto] })
  async listCollections() {
    return this.adminExperiencesService.listCollections();
  }

  @Post()
  @Version('1')
  @ApiOkResponse({ type: AdminCollectionDto })
  async createCollection(
    @CurrentAdminSession() session: AdminSessionContext,
    @Body() body: UpsertAdminCollectionDto,
  ) {
    return this.adminExperiencesService.createCollection(session, body);
  }

  @Patch(':collectionId')
  @Version('1')
  @ApiOkResponse({ type: AdminCollectionDto })
  async updateCollection(
    @CurrentAdminSession() session: AdminSessionContext,
    @Param('collectionId') collectionId: string,
    @Body() body: UpsertAdminCollectionDto,
  ) {
    return this.adminExperiencesService.updateCollection(
      session,
      collectionId,
      body,
    );
  }

  @Post(':collectionId/items')
  @Version('1')
  async linkExperience(
    @CurrentAdminSession() session: AdminSessionContext,
    @Param('collectionId') collectionId: string,
    @Body() body: LinkExperienceToCollectionDto,
  ) {
    return this.adminExperiencesService.linkExperience(
      session,
      collectionId,
      body,
    );
  }
}

@ApiTags('admin reservations')
@ApiBearerAuth()
@UseGuards(AdminAccessTokenGuard)
@Controller('admin/reservations')
export class AdminReservationsController {
  constructor(
    private readonly adminExperiencesService: AdminExperiencesService,
  ) {}

  @Get()
  @Version('1')
  @ApiOkResponse({ type: AdminReservationListResponseDto })
  async listReservations(
    @CurrentAdminSession() session: AdminSessionContext,
    @Query() query: AdminReservationQueryDto,
  ) {
    return this.adminExperiencesService.listReservations(session, query);
  }

  @Post()
  @Version('1')
  @ApiOkResponse({ type: AdminReservationDto })
  async createReservation(
    @CurrentAdminSession() session: AdminSessionContext,
    @Body() body: CreateAdminReservationDto,
  ) {
    return this.adminExperiencesService.createReservation(session, body);
  }

  @Patch(':reservationId/status')
  @Version('1')
  @ApiOkResponse({ type: AdminReservationDto })
  async updateReservationStatus(
    @CurrentAdminSession() session: AdminSessionContext,
    @Param('reservationId') reservationId: string,
    @Body() body: UpdateAdminReservationStatusDto,
  ) {
    return this.adminExperiencesService.updateReservationStatus(
      session,
      reservationId,
      body,
    );
  }
}
