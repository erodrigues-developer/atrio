import { Controller, Get, Param, UseGuards, Version } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentSession } from 'src/common/decorators/current-session.decorator';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';
import { AuthSessionContext } from 'src/common/interfaces/auth-session-context.interface';
import { ConsumptionResponseDto } from '../dto/consumption-response.dto';
import { DashboardResponseDto } from '../dto/dashboard-response.dto';
import { StayResponseDto, WifiResponseDto } from '../dto/stay-response.dto';
import { StaysService } from '../services/stays.service';

@ApiTags('stays')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('stays')
export class StaysController {
  constructor(private readonly staysService: StaysService) {}

  @Get(':stayId')
  @Version('1')
  @ApiOkResponse({ type: StayResponseDto })
  async getStay(
    @Param('stayId') stayId: string,
    @CurrentSession() session: AuthSessionContext,
  ) {
    return this.staysService.getStaySummary(stayId, session);
  }

  @Get(':stayId/dashboard')
  @Version('1')
  @ApiOkResponse({ type: DashboardResponseDto })
  async getDashboard(
    @Param('stayId') stayId: string,
    @CurrentSession() session: AuthSessionContext,
  ) {
    return this.staysService.getDashboard(stayId, session);
  }

  @Get(':stayId/wifi')
  @Version('1')
  @ApiOkResponse({ type: WifiResponseDto })
  async getWifi(
    @Param('stayId') stayId: string,
    @CurrentSession() session: AuthSessionContext,
  ) {
    return this.staysService.getWifi(stayId, session);
  }

  @Get(':stayId/consumption')
  @Version('1')
  @ApiOkResponse({ type: ConsumptionResponseDto })
  async getConsumption(
    @Param('stayId') stayId: string,
    @CurrentSession() session: AuthSessionContext,
  ) {
    return this.staysService.getConsumption(stayId, session);
  }
}
