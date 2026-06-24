import { Body, Controller, Get, Param, Post, Query, UseGuards, Version } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentSession } from 'src/common/decorators/current-session.decorator';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';
import { AuthSessionContext } from 'src/common/interfaces/auth-session-context.interface';
import { CreateStayRequestDto, StayRequestItemDto, StayRequestListQueryDto, StayRequestListResponseDto } from '../dto/requests.dto';
import { RequestsService } from '../services/requests.service';

@ApiTags('requests')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('stays/:stayId/requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @Version('1')
  @ApiCreatedResponse({ type: StayRequestItemDto })
  async create(
    @Param('stayId') stayId: string,
    @Body() body: CreateStayRequestDto,
    @CurrentSession() session: AuthSessionContext,
  ) {
    return this.requestsService.createStayRequest(stayId, body, session);
  }

  @Get()
  @Version('1')
  @ApiOkResponse({ type: StayRequestListResponseDto })
  async list(
    @Param('stayId') stayId: string,
    @Query() query: StayRequestListQueryDto,
    @CurrentSession() session: AuthSessionContext,
  ) {
    return this.requestsService.listStayRequests(stayId, query, session);
  }

  @Get(':requestId')
  @Version('1')
  @ApiOkResponse({ type: StayRequestItemDto })
  async getById(
    @Param('stayId') stayId: string,
    @Param('requestId') requestId: string,
    @CurrentSession() session: AuthSessionContext,
  ) {
    return this.requestsService.getStayRequest(stayId, requestId, session);
  }
}
