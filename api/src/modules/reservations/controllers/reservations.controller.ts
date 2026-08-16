import { Body, Controller, Get, Param, Post, Query, UseGuards, Version } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentSession } from 'src/common/decorators/current-session.decorator';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';
import { AuthSessionContext } from 'src/common/interfaces/auth-session-context.interface';
import { CreateReservationDto, ReservationItemDto, ReservationListQueryDto, ReservationListResponseDto } from '../dto/reservations.dto';
import { ReservationsService } from '../services/reservations.service';

@ApiTags('reservations')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('stays/:stayId/reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @Version('1')
  @ApiCreatedResponse({ type: ReservationItemDto })
  async create(
    @Param('stayId') stayId: string,
    @Body() body: CreateReservationDto,
    @CurrentSession() session: AuthSessionContext,
  ) {
    return this.reservationsService.createReservation(stayId, body, session);
  }

  @Get()
  @Version('1')
  @ApiOkResponse({ type: ReservationListResponseDto })
  async list(
    @Param('stayId') stayId: string,
    @Query() query: ReservationListQueryDto,
    @CurrentSession() session: AuthSessionContext,
  ) {
    return this.reservationsService.listReservations(stayId, query, session);
  }

  @Get(':reservationId')
  @Version('1')
  @ApiOkResponse({ type: ReservationItemDto })
  async getById(
    @Param('stayId') stayId: string,
    @Param('reservationId') reservationId: string,
    @CurrentSession() session: AuthSessionContext,
  ) {
    return this.reservationsService.getReservation(stayId, reservationId, session);
  }
}
