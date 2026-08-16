import { Body, Controller, Post, Version } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  IdentifyStayAccessDto,
  ResendStayAccessCodeDto,
  StayAccessChallengeResponseDto,
  VerifyStayAccessDto,
  VerifyStayAccessResponseDto,
} from '../dto/stay-access.dto';
import { AuthService } from '../services/auth.service';

@ApiTags('stay-access')
@Controller('stay-access')
export class StayAccessController {
  constructor(private readonly authService: AuthService) {}

  @Post('identify')
  @Version('1')
  @ApiOkResponse({ type: StayAccessChallengeResponseDto })
  async identify(@Body() body: IdentifyStayAccessDto) {
    return this.authService.identifyStayAccess(body);
  }

  @Post('verify')
  @Version('1')
  @ApiOkResponse({ type: VerifyStayAccessResponseDto })
  async verify(@Body() body: VerifyStayAccessDto) {
    return this.authService.verifyStayAccess(body.challengeId, body.code);
  }

  @Post('resend-code')
  @Version('1')
  @ApiCreatedResponse({ type: StayAccessChallengeResponseDto })
  async resendCode(@Body() body: ResendStayAccessCodeDto) {
    return this.authService.resendCode(body.challengeId);
  }
}
