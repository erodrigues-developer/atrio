import 'reflect-metadata';
import { ApiException } from 'src/common/exceptions/api.exception';
import { SessionController } from '../controllers/session.controller';
import { StayAccessController } from '../controllers/stay-access.controller';
import { GuestSessionRepository } from '../repositories/guest-session.repository';
import { AuthService } from '../services/auth.service';

describe('auth module', () => {
  const stay = {
    publicId: 'stay_001',
    guestId: 'guest_001',
    hotelId: 'copacabana-palace',
    roomNumber: '304',
    checkOutTime: '12:00',
    hotel: { name: 'Copacabana Palace' },
    guest: { firstName: 'Everton', lastName: 'Rodrigues', maskedPhone: '(31) *****-1234' },
  };

  function createConfigService() {
    return {
      get: jest.fn((key: string) => {
        const values: Record<string, number> = {
          'auth.challengeTtlSeconds': 300,
          'auth.resendCooldownSeconds': 60,
          'auth.accessTokenTtlMinutes': 720,
        };
        return values[key];
      }),
    };
  }

  it('covers the guest session repository', async () => {
    const save = jest.fn();
    const findOne = jest.fn();
    const repository = new GuestSessionRepository({ save, findOne } as never);

    await repository.create({ id: 'session_001' } as never);
    expect(save).toHaveBeenCalled();

    await repository.findActiveByAccessToken('token');
    expect(findOne).toHaveBeenCalled();
  });

  it('handles stay access identify, resend, verify, session and validation flows', async () => {
    const stayRepository = {
      findByHotelRoomAndLastName: jest.fn().mockResolvedValue(stay),
      findById: jest.fn().mockResolvedValue(stay),
    };
    const guestSessionRepository = {
      create: jest.fn(),
      findActiveByAccessToken: jest.fn().mockResolvedValue({ publicId: 'session_001', stayId: 'stay_001' }),
    };
    const redisService = {
      setJson: jest.fn(),
      getJson: jest.fn(),
      delete: jest.fn(),
    };
    const service = new AuthService(
      stayRepository as never,
      guestSessionRepository as never,
      redisService as never,
      createConfigService() as never,
    );

    const identifyResponse = await service.identifyStayAccess({
      hotelId: 'copacabana-palace',
      roomNumber: '304',
      lastName: 'Rodrigues',
    });
    expect(identifyResponse.deliveryChannel).toBe('sms');
    expect(redisService.setJson).toHaveBeenCalled();

    stayRepository.findByHotelRoomAndLastName.mockResolvedValueOnce(null);
    await expect(
      service.identifyStayAccess({
        hotelId: 'copacabana-palace',
        roomNumber: '999',
        lastName: 'Missing',
      }),
    ).rejects.toBeInstanceOf(ApiException);

    redisService.getJson.mockResolvedValueOnce(null);
    await expect(service.resendCode('missing')).rejects.toBeInstanceOf(ApiException);

    redisService.getJson.mockResolvedValueOnce({
      challengeId: 'chl_001',
      code: '123456',
      stayId: 'stay_001',
      guestId: 'guest_001',
      guestName: 'Everton Rodrigues',
      hotelId: 'copacabana-palace',
      hotelName: 'Copacabana Palace',
      roomNumber: '304',
      maskedPhone: '(31) *****-1234',
      expiresAt: new Date(Date.now() + 1000).toISOString(),
      resendAvailableAt: new Date(Date.now() - 1000).toISOString(),
    });
    expect((await service.resendCode('chl_001')).challengeId).toBe('chl_001');

    redisService.getJson.mockResolvedValueOnce({
      challengeId: 'chl_001',
      code: '123456',
      stayId: 'stay_001',
      guestId: 'guest_001',
      guestName: 'Everton Rodrigues',
      hotelId: 'copacabana-palace',
      hotelName: 'Copacabana Palace',
      roomNumber: '304',
      maskedPhone: '(31) *****-1234',
      expiresAt: new Date(Date.now() + 1000).toISOString(),
      resendAvailableAt: new Date(Date.now() + 1000).toISOString(),
    });
    await expect(service.resendCode('chl_001')).rejects.toBeInstanceOf(ApiException);

    redisService.getJson.mockResolvedValueOnce({
      challengeId: 'chl_001',
      code: '000000',
      stayId: 'stay_001',
      guestId: 'guest_001',
      guestName: 'Everton Rodrigues',
      hotelId: 'copacabana-palace',
      hotelName: 'Copacabana Palace',
      roomNumber: '304',
      maskedPhone: '(31) *****-1234',
      expiresAt: new Date(Date.now() + 1000).toISOString(),
      resendAvailableAt: new Date(Date.now() - 1000).toISOString(),
    });
    await expect(service.verifyStayAccess('chl_001', '123456')).rejects.toBeInstanceOf(ApiException);

    redisService.getJson.mockResolvedValueOnce({
      challengeId: 'chl_001',
      code: '123456',
      stayId: 'stay_001',
      guestId: 'guest_001',
      guestName: 'Everton Rodrigues',
      hotelId: 'copacabana-palace',
      hotelName: 'Copacabana Palace',
      roomNumber: '304',
      maskedPhone: '(31) *****-1234',
      expiresAt: new Date(Date.now() + 1000).toISOString(),
      resendAvailableAt: new Date(Date.now() - 1000).toISOString(),
    });
    const verifyResponse = await service.verifyStayAccess('chl_001', '123456');
    expect(guestSessionRepository.create).toHaveBeenCalled();
    expect(redisService.delete).toHaveBeenCalled();
    expect(verifyResponse.session.isAuthenticated).toBe(true);

    const session = await service.getSession({
      accessToken: 'token',
      guestId: 'guest_001',
      guestName: 'Everton Rodrigues',
      hotelId: 'copacabana-palace',
      roomNumber: '304',
      sessionId: 'session_001',
      stayId: 'stay_001',
    });
    expect(session.isAuthenticated).toBe(true);

    guestSessionRepository.findActiveByAccessToken.mockResolvedValueOnce(null);
    await expect(service.validateAccessToken('missing')).rejects.toBeInstanceOf(ApiException);

    redisService.getJson.mockResolvedValueOnce({
      challengeId: 'chl_002',
      code: '123456',
      stayId: 'stay_001',
      guestId: 'guest_001',
      guestName: 'Everton Rodrigues',
      hotelId: 'copacabana-palace',
      hotelName: 'Copacabana Palace',
      roomNumber: '304',
      maskedPhone: '(31) *****-1234',
      expiresAt: new Date(Date.now() + 1000).toISOString(),
      resendAvailableAt: new Date(Date.now() - 1000).toISOString(),
    });
    stayRepository.findById.mockResolvedValueOnce(null);
    await expect(service.verifyStayAccess('chl_002', '123456')).rejects.toBeInstanceOf(ApiException);

    guestSessionRepository.findActiveByAccessToken.mockResolvedValueOnce({ publicId: 'session_001', stayId: 'stay_001' });
    stayRepository.findById.mockResolvedValueOnce(null);
    await expect(service.validateAccessToken('token')).rejects.toBeInstanceOf(ApiException);

    stayRepository.findById.mockResolvedValueOnce(stay);
    const context = await service.validateAccessToken('token');
    expect(context.stayId).toBe('stay_001');
  });

  it('delegates from controllers', async () => {
    const authService = {
      identifyStayAccess: jest.fn().mockResolvedValue({ ok: true }),
      verifyStayAccess: jest.fn().mockResolvedValue({ ok: true }),
      resendCode: jest.fn().mockResolvedValue({ ok: true }),
      getSession: jest.fn().mockResolvedValue({ ok: true }),
    };
    const stayAccessController = new StayAccessController(authService as never);
    const sessionController = new SessionController(authService as never);

    await expect(stayAccessController.identify({ hotelId: 'h', roomNumber: '1', lastName: 'l' })).resolves.toEqual({
      ok: true,
    });
    await expect(stayAccessController.verify({ challengeId: 'c', code: '123456' })).resolves.toEqual({ ok: true });
    await expect(stayAccessController.resendCode({ challengeId: 'c' })).resolves.toEqual({ ok: true });
    await expect(sessionController.getSession({ stayId: 'stay_001' } as never)).resolves.toEqual({ ok: true });
  });
});
