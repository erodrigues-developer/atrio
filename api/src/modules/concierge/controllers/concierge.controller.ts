import { Body, Controller, Get, Param, Post, Query, UseGuards, Version } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentSession } from 'src/common/decorators/current-session.decorator';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';
import { AuthSessionContext } from 'src/common/interfaces/auth-session-context.interface';
import {
  ConciergeListQueryDto,
  ConciergeMessagesResponseDto,
  CreateConciergeMessageDto,
  CreateConciergeMessageResponseDto,
} from '../dto/concierge.dto';
import { ConciergeService } from '../services/concierge.service';

@ApiTags('concierge')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('stays/:stayId/concierge/messages')
export class ConciergeController {
  constructor(private readonly conciergeService: ConciergeService) {}

  @Get()
  @Version('1')
  @ApiOkResponse({ type: ConciergeMessagesResponseDto })
  async list(
    @Param('stayId') stayId: string,
    @Query() query: ConciergeListQueryDto,
    @CurrentSession() session: AuthSessionContext,
  ) {
    return this.conciergeService.listMessages(stayId, query, session);
  }

  @Post()
  @Version('1')
  @ApiCreatedResponse({ type: CreateConciergeMessageResponseDto })
  async create(
    @Param('stayId') stayId: string,
    @Body() body: CreateConciergeMessageDto,
    @CurrentSession() session: AuthSessionContext,
  ) {
    return this.conciergeService.createMessage(stayId, body, session);
  }
}
