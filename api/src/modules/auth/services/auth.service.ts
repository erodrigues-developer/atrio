import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiException } from 'src/common/exceptions/api.exception';
import { AuthSessionContext } from 'src/common/interfaces/auth-session-context.interface';
import { buildResourceId } from 'src/common/utils/id.util';
import RedisService from 'src/modules/redis/services/redis.service';
import { StayRepository } from 'src/modules/stays/repositories/stay.repository';
import { Stay } from 'src/modules/stays/entities/stay.entity';
import { GuestSession } from '../entities/guest-session.entity';
import { GuestSessionRepository } from '../repositories/guest-session.repository';

type StayAccessChallenge = {
  challengeId: string;
  code: string;
  stayId: string;
  guestId: string;
  guestName: string;
  hotelId: string;
  hotelName: string;
  roomNumber: string;
  maskedPhone: string;
  expiresAt: string;
  resendAvailableAt: string;
};

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => StayRepository))
    private readonly stayRepository: StayRepository,
    private readonly guestSessionRepository: GuestSessionRepository,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async identifyStayAccess(input: {
    hotelId: string;
    roomNumber: string;
    lastName: string;
  }) {
    const stay = await this.stayRepository.findByHotelRoomAndLastName(
      input.hotelId,
      input.roomNumber,
      input.lastName,
    );

    if (!stay) {
      throw new ApiException(404, 'STAY_NOT_FOUND', 'Stay not found for the provided guest details.');
    }

    const challenge = this.buildChallenge(stay);
    const ttlSeconds = this.configService.get<number>('auth.challengeTtlSeconds') ?? 300;

    await this.redisService.setJson(this.buildChallengeKey(challenge.challengeId), challenge, ttlSeconds);

    return {
      challengeId: challenge.challengeId,
      deliveryChannel: 'sms',
      maskedPhone: challenge.maskedPhone,
      expiresAt: challenge.expiresAt,
      resendAvailableAt: challenge.resendAvailableAt,
    };
  }

  async resendCode(challengeId: string) {
    const challenge = await this.getChallenge(challengeId);

    if (new Date(challenge.resendAvailableAt).getTime() > Date.now()) {
      throw new ApiException(429, 'CHALLENGE_RESEND_NOT_AVAILABLE', 'A new code cannot be requested yet.');
    }

    const refreshedChallenge: StayAccessChallenge = {
      ...challenge,
      expiresAt: new Date(
        Date.now() + (this.configService.get<number>('auth.challengeTtlSeconds') ?? 300) * 1000,
      ).toISOString(),
      resendAvailableAt: new Date(
        Date.now() + (this.configService.get<number>('auth.resendCooldownSeconds') ?? 60) * 1000,
      ).toISOString(),
    };

    await this.redisService.setJson(
      this.buildChallengeKey(challengeId),
      refreshedChallenge,
      this.configService.get<number>('auth.challengeTtlSeconds') ?? 300,
    );

    return {
      challengeId: refreshedChallenge.challengeId,
      deliveryChannel: 'sms',
      maskedPhone: refreshedChallenge.maskedPhone,
      expiresAt: refreshedChallenge.expiresAt,
      resendAvailableAt: refreshedChallenge.resendAvailableAt,
    };
  }

  async createStayAccessChallengeForStay(stayId: string) {
    const stay = await this.stayRepository.findById(stayId);

    if (!stay) {
      throw new ApiException(404, 'STAY_NOT_FOUND', 'Stay was not found.');
    }

    const challenge = this.buildChallenge(stay);
    const ttlSeconds = this.configService.get<number>('auth.challengeTtlSeconds') ?? 300;

    await this.redisService.setJson(this.buildChallengeKey(challenge.challengeId), challenge, ttlSeconds);

    return {
      challengeId: challenge.challengeId,
      deliveryChannel: 'sms',
      maskedPhone: challenge.maskedPhone,
      expiresAt: challenge.expiresAt,
      resendAvailableAt: challenge.resendAvailableAt,
    };
  }

  async verifyStayAccess(challengeId: string, code: string) {
    const challenge = await this.getChallenge(challengeId);

    if (challenge.code !== code) {
      throw new ApiException(409, 'INVALID_CHALLENGE_CODE', 'The verification code is invalid.');
    }

    const stay = await this.stayRepository.findById(challenge.stayId);

    if (!stay) {
      throw new ApiException(404, 'STAY_NOT_FOUND', 'Stay no longer exists.');
    }

    const session = new GuestSession();
    session.publicId = buildResourceId('session');
    session.guestId = stay.guestId;
    session.stayId = stay.publicId;
    session.accessToken = buildResourceId('atk');
    session.refreshToken = buildResourceId('rtk');
    session.createdAt = new Date();
    session.revokedAt = null;
    session.expiresAt = new Date(
      Date.now() + (this.configService.get<number>('auth.accessTokenTtlMinutes') ?? 720) * 60 * 1000,
    );

    await this.guestSessionRepository.create(session);
    await this.redisService.delete(this.buildChallengeKey(challengeId));

    return {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      session: {
        guestId: stay.guestId,
        guestName: `${stay.guest.firstName} ${stay.guest.lastName}`,
        hotelId: stay.hotelId,
        stayId: stay.publicId,
        roomNumber: stay.roomNumber,
        isAuthenticated: true,
      },
      stay: {
        id: stay.publicId,
        hotelName: stay.hotel.name,
        roomNumber: stay.roomNumber,
        checkOutTime: stay.checkOutTime,
      },
    };
  }

  async getSession(context: AuthSessionContext) {
    return {
      guestId: context.guestId,
      guestName: context.guestName,
      hotelId: context.hotelId,
      stayId: context.stayId,
      roomNumber: context.roomNumber,
      isAuthenticated: true,
    };
  }

  async validateAccessToken(accessToken: string): Promise<AuthSessionContext> {
    const guestSession = await this.guestSessionRepository.findActiveByAccessToken(accessToken);

    if (!guestSession) {
      throw new ApiException(401, 'UNAUTHORIZED', 'Token is invalid or expired.');
    }

    const stay = await this.stayRepository.findById(guestSession.stayId);

    if (!stay) {
      throw new ApiException(401, 'UNAUTHORIZED', 'Associated stay could not be loaded.');
    }

    return {
      accessToken,
      guestId: stay.guestId,
      guestName: `${stay.guest.firstName} ${stay.guest.lastName}`,
      hotelId: stay.hotelId,
      roomNumber: stay.roomNumber,
      sessionId: guestSession.publicId,
      stayId: stay.publicId,
    };
  }

  private buildChallenge(stay: Stay) {
    const challengeId = buildResourceId('chl');
    const expiresAt = new Date(
      Date.now() + (this.configService.get<number>('auth.challengeTtlSeconds') ?? 300) * 1000,
    );
    const resendAvailableAt = new Date(
      Date.now() + (this.configService.get<number>('auth.resendCooldownSeconds') ?? 60) * 1000,
    );

    return {
      challengeId,
      code: '123456',
      stayId: stay.publicId,
      guestId: stay.guestId,
      guestName: `${stay.guest.firstName} ${stay.guest.lastName}`,
      hotelId: stay.hotelId,
      hotelName: stay.hotel.name,
      roomNumber: stay.roomNumber,
      maskedPhone: stay.guest.maskedPhone,
      expiresAt: expiresAt.toISOString(),
      resendAvailableAt: resendAvailableAt.toISOString(),
    };
  }

  private async getChallenge(challengeId: string): Promise<StayAccessChallenge> {
    const challenge = await this.redisService.getJson<StayAccessChallenge>(this.buildChallengeKey(challengeId));

    if (!challenge) {
      throw new ApiException(409, 'CHALLENGE_EXPIRED', 'The stay access challenge has expired.');
    }

    return challenge;
  }

  private buildChallengeKey(challengeId: string): string {
    return `stay-access:challenge:${challengeId}`;
  }
}
