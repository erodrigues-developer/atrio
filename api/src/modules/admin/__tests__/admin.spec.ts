import 'reflect-metadata';
import { ApiException } from 'src/common/exceptions/api.exception';
import { AdminAccessTokenGuard } from 'src/common/guards/admin-access-token.guard';
import { resolveCurrentAdminSession } from 'src/common/decorators/current-admin-session.decorator';
import {
  AdminAuthController,
  AdminMeController,
} from '../controllers/admin-auth.controller';
import { AdminDashboardController } from '../controllers/admin-dashboard.controller';
import {
  AdminExperienceCollectionsController,
  AdminExperiencesController,
  AdminReservationsController,
} from '../controllers/admin-experiences.controller';
import {
  AdminRequestsController,
  AdminServicesController,
} from '../controllers/admin-services.controller';
import {
  AdminGuestsController,
  AdminStaysController,
} from '../controllers/admin-stays.controller';
import { AuditService } from '../services/audit.service';
import { AdminAuthService } from '../services/admin-auth.service';
import { AdminDashboardService } from '../services/admin-dashboard.service';
import { AdminExperiencesService } from '../services/admin-experiences.service';
import { AdminServicesService } from '../services/admin-services.service';
import { AdminStaysService } from '../services/admin-stays.service';
import { PasswordService } from '../services/password.service';

describe('admin module', () => {
  const adminUser = {
    publicId: 'admin_001',
    hotelId: 'copacabana-palace',
    name: 'Atrio Manager',
    email: 'admin@atrio.app',
    passwordHash:
      'pbkdf2_sha512$120000$atrio-admin-seed-salt$ffb133790918feb58ef749dcd10680b0aa9206c117110813e33c8b68d15637dc8504f8e47021da1aaa072f22f224bc4cd1adf65a958cc4c98bdb796c1c94ef42',
    role: 'owner',
    permissions: ['stays.read/write'],
    isActive: true,
    hotel: { name: 'Copacabana Palace' },
  };
  const sessionContext = {
    accessToken: 'token',
    adminUserId: 'admin_001',
    adminUserName: 'Atrio Manager',
    email: 'admin@atrio.app',
    hotelId: 'copacabana-palace',
    role: 'owner',
    permissions: ['stays.read/write'],
    sessionId: 'admin_session_001',
  };
  const guest = {
    publicId: 'guest_001',
    firstName: 'Everton',
    lastName: 'Rodrigues',
    phoneNumber: '+5531999991234',
    maskedPhone: '*****-1234',
  };
  const stay = {
    publicId: 'stay_001',
    hotelId: 'copacabana-palace',
    guestId: 'guest_001',
    roomNumber: '304',
    status: 'active',
    statusLabel: 'Hospedagem ativa',
    checkInDate: '2026-08-14',
    checkOutDate: '2026-08-18',
    checkOutTime: '12:00',
    wifiNetwork: 'Atrio Guest',
    wifiPassword: 'atrio304',
    consumptionEnabled: true,
    consumptionView: 'ready',
    guest,
  };
  const usefulInfo = {
    publicId: 'info_001',
    stayId: 'stay_001',
    scope: 'stay',
    title: 'Check-out',
    description: 'Ate 12:00',
    position: 1,
  };
  const consumptionItem = {
    publicId: 'cons_001',
    stayId: 'stay_001',
    title: 'Room service',
    description: 'Pedido',
    category: 'food',
    icon: 'Utensils',
    amountCents: 1200,
    currency: 'BRL',
    occurredAt: new Date('2026-08-14T12:00:00.000Z'),
  };
  const serviceDefinition = {
    publicId: 'towels',
    title: 'Toalhas',
    description: 'Solicite toalhas extras.',
    icon: 'Bath',
    fulfillmentType: 'hotel_staff',
    requestSchema: { fields: [] },
    published: true,
  };
  const experience = {
    publicId: 'exp_001',
    title: 'Jantar',
    description: 'Jantar especial',
    category: 'Gastronomia',
    timeLabel: 'Hoje',
    priceLabel: 'Sob consulta',
    badge: null,
    imageUrl: 'https://example.com/image.jpg',
    durationLabel: '2h',
    availabilityLabel: 'Hoje',
    locationLabel: 'Restaurante',
    locationDescription: 'Lobby',
    policy: 'Cancelar com antecedencia.',
    included: ['Mesa reservada'],
    published: true,
  };
  const collection = {
    publicId: 'col_001',
    title: 'Gastronomia',
    description: 'Experiencias de mesa',
    featured: false,
    published: true,
  };
  const slot = {
    publicId: 'slot_001',
    experienceId: 'exp_001',
    date: '2026-08-14',
    dayLabel: 'sex.',
    dateLabel: '14/08',
    time: '19:00',
    startsAt: new Date('2026-08-14T19:00:00.000Z'),
    isAvailable: true,
    position: 1,
  };
  const reservation = {
    publicId: 'res_001',
    stayId: 'stay_001',
    experienceId: 'exp_001',
    title: 'Jantar',
    status: 'requested',
    statusLabel: 'Solicitada',
    scheduledAt: new Date('2026-08-14T19:00:00.000Z'),
    dateLabel: 'Hoje',
    timeLabel: '19:00',
    locationLabel: 'Restaurante',
    priceLabel: 'Sob consulta',
    note: 'Nota',
    guestNote: null,
    createdAt: new Date('2026-08-14T12:00:00.000Z'),
  };
  const stayRequest = {
    publicId: 'req_001',
    stayId: 'stay_001',
    serviceId: 'towels',
    title: 'Toalhas extras',
    status: 'received',
    statusLabel: 'Recebido',
    quantity: 2,
    note: '',
    internalNote: null,
    roomNumber: '304',
    createdAt: new Date('2026-08-14T12:00:00.000Z'),
  };

  it('hashes and verifies passwords', () => {
    const passwordService = new PasswordService();
    const hash = passwordService.hash('secret123');

    expect(passwordService.verify('secret123', hash)).toBe(true);
    expect(passwordService.verify('wrong123', hash)).toBe(false);
    expect(passwordService.verify('secret123', 'invalid')).toBe(false);
  });

  it('records audit logs', async () => {
    const save = jest.fn();
    const service = new AuditService({ save } as never);

    await service.record({
      hotelId: 'copacabana-palace',
      adminUserId: 'admin_001',
      action: 'admin.login',
      resourceType: 'admin_user',
      resourceId: 'admin_001',
      summary: 'Logged in.',
      metadata: { ip: '127.0.0.1' },
    });

    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'admin.login' }),
    );
  });

  it('handles admin login, session validation, me and logout', async () => {
    const adminUserRepository = {
      findOne: jest.fn().mockResolvedValue(adminUser),
      save: jest.fn(),
    };
    const adminSessionRepository = {
      save: jest.fn(),
      update: jest.fn(),
      findOne: jest.fn().mockResolvedValue({
        publicId: 'admin_session_001',
        hotelId: 'copacabana-palace',
        adminUser,
      }),
    };
    const auditService = { record: jest.fn() };
    const configService = { get: jest.fn().mockReturnValue(720) };
    const service = new AdminAuthService(
      adminUserRepository as never,
      adminSessionRepository as never,
      new PasswordService(),
      auditService as never,
      configService as never,
    );

    const loginResponse = await service.login(' ADMIN@ATRIO.APP ', 'admin123');
    expect(loginResponse.admin.hotel.name).toBe('Copacabana Palace');
    expect(adminSessionRepository.save).toHaveBeenCalled();
    expect(auditService.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'admin.login' }),
    );

    adminUserRepository.findOne.mockResolvedValueOnce(null);
    await expect(
      service.login('missing@atrio.app', 'admin123'),
    ).rejects.toBeInstanceOf(ApiException);

    adminUserRepository.findOne.mockResolvedValueOnce({
      ...adminUser,
      isActive: false,
    });
    await expect(
      service.login('admin@atrio.app', 'admin123'),
    ).rejects.toBeInstanceOf(ApiException);

    adminUserRepository.findOne.mockResolvedValueOnce(adminUser);
    await expect(
      service.login('admin@atrio.app', 'wrong123'),
    ).rejects.toBeInstanceOf(ApiException);

    const context = await service.validateAccessToken('token');
    expect(context.adminUserId).toBe('admin_001');

    adminSessionRepository.findOne.mockResolvedValueOnce(null);
    await expect(service.validateAccessToken('missing')).rejects.toBeInstanceOf(
      ApiException,
    );

    adminSessionRepository.findOne.mockResolvedValueOnce({
      publicId: 'admin_session_001',
      hotelId: 'copacabana-palace',
      adminUser: { ...adminUser, isActive: false },
    });
    await expect(
      service.validateAccessToken('inactive'),
    ).rejects.toBeInstanceOf(ApiException);

    adminUserRepository.findOne.mockResolvedValueOnce(adminUser);
    await expect(service.getMe(sessionContext)).resolves.toHaveProperty(
      'email',
      'admin@atrio.app',
    );

    adminUserRepository.findOne.mockResolvedValueOnce({
      ...adminUser,
      hotel: undefined,
    });
    await expect(service.getMe(sessionContext)).resolves.toHaveProperty(
      'hotel.name',
      'copacabana-palace',
    );

    adminUserRepository.findOne.mockResolvedValueOnce(null);
    await expect(service.getMe(sessionContext)).rejects.toBeInstanceOf(
      ApiException,
    );

    await expect(service.logout(sessionContext)).resolves.toEqual({ ok: true });
    expect(adminSessionRepository.update).toHaveBeenCalled();
  });

  it('builds the admin dashboard', async () => {
    const dataSource = {
      query: jest.fn((sql: string) => {
        if (sql.includes('FROM hotels')) {
          return Promise.resolve([
            { id: 'copacabana-palace', name: 'Copacabana Palace' },
          ]);
        }
        if (sql.includes("status = 'active'")) {
          return Promise.resolve([{ count: 2 }]);
        }
        if (sql.includes('check_in_date')) {
          return Promise.resolve([{ count: 3 }]);
        }
        if (sql.includes('check_out_date')) {
          return Promise.resolve([{ count: 4 }]);
        }
        if (
          sql.includes('COUNT(*)::int AS count') &&
          sql.includes('stay_requests') &&
          sql.includes("INTERVAL '30 minutes'")
        ) {
          return Promise.resolve([{ count: 1 }]);
        }
        if (sql.includes('COUNT(*)::int') && sql.includes('stay_requests')) {
          return Promise.resolve([{ count: 5 }]);
        }
        if (sql.includes('COUNT(*)::int') && sql.includes('reservations')) {
          return Promise.resolve([{ count: 6 }]);
        }
        if (sql.includes('conversation_activity') && sql.includes('delayed')) {
          return Promise.resolve([{ count: 2, delayed: 1 }]);
        }
        if (
          sql.includes('FROM stay_requests sr') &&
          sql.includes('waitMinutes')
        ) {
          return Promise.resolve([
            {
              id: 'req_001',
              title: 'Toalhas',
              priority: 'critical',
              roomNumber: '304',
              waitMinutes: 42,
            },
          ]);
        }
        if (
          sql.includes('FROM reservations r') &&
          sql.includes('Aguardando confirmação')
        ) {
          return Promise.resolve([{ id: 'res_001', title: 'Jantar' }]);
        }
        if (sql.includes('conversation_activity')) {
          return Promise.resolve([{ id: 'stay_001', title: 'Concierge' }]);
        }
        if (sql.includes('UNION ALL')) {
          return Promise.resolve([{ id: 'move_001', title: 'Mariana Costa', scheduledAt: null }]);
        }

        return Promise.resolve([]);
      }),
    };
    const service = new AdminDashboardService(dataSource as never);
    const response = await service.getDashboard(sessionContext);

    expect(response.hotelName).toBe('Copacabana Palace');
    expect(response.metrics).toHaveLength(6);
    expect(response.pendingRequests).toHaveLength(1);
    expect(response.pendingExperiences).toHaveLength(1);
    expect(response.conciergeConversations).toHaveLength(1);
    expect(response.upcomingMovements).toHaveLength(1);
    expect(response.upcomingMovements[0]).not.toHaveProperty('scheduledAt');
  });

  it('delegates from controllers and guards admin tokens', async () => {
    const authService = {
      login: jest.fn().mockResolvedValue({ ok: true }),
      logout: jest.fn().mockResolvedValue({ ok: true }),
      getMe: jest.fn().mockResolvedValue({ ok: true }),
      validateAccessToken: jest.fn().mockResolvedValue(sessionContext),
    };
    const dashboardService = {
      getDashboard: jest.fn().mockResolvedValue({ ok: true }),
    };
    const authController = new AdminAuthController(authService as never);
    const meController = new AdminMeController(authService as never);
    const dashboardController = new AdminDashboardController(
      dashboardService as never,
    );

    await expect(
      authController.login({ email: 'admin@atrio.app', password: 'admin123' }),
    ).resolves.toEqual({ ok: true });
    await expect(authController.logout(sessionContext)).resolves.toEqual({
      ok: true,
    });
    await expect(meController.me(sessionContext)).resolves.toEqual({
      ok: true,
    });
    await expect(
      dashboardController.getDashboard(sessionContext),
    ).resolves.toEqual({ ok: true });

    const request = { headers: { authorization: 'Bearer token' } };
    const executionContext = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    };
    const guard = new AdminAccessTokenGuard(authService as never);

    await expect(guard.canActivate(executionContext as never)).resolves.toBe(
      true,
    );
    expect(request).toHaveProperty('adminSession', sessionContext);
    expect(resolveCurrentAdminSession(executionContext as never)).toBe(
      sessionContext,
    );

    const missingHeaderContext = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }),
      }),
    };

    await expect(
      guard.canActivate(missingHeaderContext as never),
    ).rejects.toBeInstanceOf(ApiException);
  });

  it('handles admin guest and stay management flows', async () => {
    const guestQueryBuilder = {
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[guest], 1]),
    };
    const guestRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(guestQueryBuilder),
      findOne: jest.fn().mockResolvedValue(guest),
      save: jest.fn((entity) => Promise.resolve(entity)),
      softRemove: jest.fn((entity) => Promise.resolve(entity)),
    };
    const queryBuilder = {
      withDeleted: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[stay], 11]),
    };
    const stayRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      findOne: jest.fn().mockResolvedValue(stay),
      save: jest.fn((entity) => Promise.resolve({ ...entity, guest })),
    };
    const hotelRepository = {
      findOne: jest.fn().mockResolvedValue({
        publicId: 'copacabana-palace',
        wifiNetwork: 'Atrio Guest',
        wifiPassword: 'atrio',
      }),
      save: jest.fn((entity) => Promise.resolve(entity)),
    };
    const guestSessionRepository = {
      count: jest.fn().mockResolvedValue(1),
      update: jest.fn().mockResolvedValue({ affected: 2 }),
    };
    const usefulInfoRepository = {
      find: jest.fn().mockResolvedValue([usefulInfo]),
      save: jest.fn((entity) => Promise.resolve(entity)),
    };
    const hotelUsefulInfoRepository = {
      find: jest.fn().mockResolvedValue([usefulInfo]),
      save: jest.fn((entity) => Promise.resolve(entity)),
    };
    const consumptionItemRepository = {
      find: jest.fn().mockResolvedValue([consumptionItem]),
      findOne: jest.fn().mockResolvedValue(consumptionItem),
      remove: jest.fn().mockResolvedValue(consumptionItem),
      save: jest.fn((entity) => Promise.resolve(entity)),
    };
    const authService = {
      createStayAccessChallengeForStay: jest
        .fn()
        .mockResolvedValue({ challengeId: 'chl_001' }),
    };
    const auditService = { record: jest.fn() };
    const service = new AdminStaysService(
      guestRepository as never,
      stayRepository as never,
      hotelRepository as never,
      guestSessionRepository as never,
      usefulInfoRepository as never,
      hotelUsefulInfoRepository as never,
      consumptionItemRepository as never,
      authService as never,
      auditService as never,
    );

    const guests = await service.listGuests(sessionContext, {
      search: 'everton',
      page: 1,
      pageSize: 10,
    });
    expect(guests.items).toHaveLength(1);
    expect(guests.total).toBe(1);
    const createdGuest = await service.createGuest(sessionContext, {
      firstName: 'Ana',
      lastName: 'Silva',
      phoneNumber: '(31) 99999-9876',
    });
    expect(createdGuest.maskedPhone).toBe('*****-9876');
    await expect(
      service.updateGuest(sessionContext, 'guest_001', {
        firstName: 'Everton',
        lastName: 'Rodrigues',
        phoneNumber: '+5531999991234',
      }),
    ).resolves.toMatchObject({
      id: 'guest_001',
      maskedPhone: '*****-1234',
    });
    await expect(
      service.deleteGuest(sessionContext, 'guest_001'),
    ).resolves.toEqual({ id: 'guest_001' });
    expect(guestRepository.softRemove).toHaveBeenCalledWith(guest);

    const stays = await service.listStays(sessionContext, {
      search: '304',
      status: 'active',
      dateFrom: '2026-08-01',
      dateTo: '2026-08-31',
      page: 2,
      pageSize: 5,
    });
    expect(stays.items[0].activeGuestSessions).toBe(1);
    expect(stays).toMatchObject({
      total: 11,
      page: 2,
      pageSize: 5,
      totalPages: 3,
    });
    expect(queryBuilder.skip).toHaveBeenCalledWith(5);
    expect(queryBuilder.take).toHaveBeenCalledWith(5);
    expect(queryBuilder.andWhere).toHaveBeenCalled();

    await expect(
      service.getStay(sessionContext, 'stay_001'),
    ).resolves.toHaveProperty('id', 'stay_001');

    const createdStay = await service.createStay(sessionContext, {
      guestId: 'guest_001',
      roomNumber: '305',
      checkInDate: '2026-08-14',
      checkOutDate: '2026-08-18',
      checkOutTime: '12:00',
      status: 'scheduled',
      consumptionEnabled: true,
      consumptionView: 'ready',
    });
    expect(createdStay.statusLabel).toBe('Agendada');

    guestRepository.findOne.mockResolvedValueOnce(null);
    await expect(
      service.createStay(sessionContext, {
        guestId: 'missing',
        roomNumber: '305',
        checkInDate: '2026-08-14',
        checkOutDate: '2026-08-18',
        checkOutTime: '12:00',
        status: 'scheduled',
        consumptionEnabled: true,
        consumptionView: 'ready',
      }),
    ).rejects.toBeInstanceOf(ApiException);

    await expect(
      service.createStay(sessionContext, {
        roomNumber: '305',
        checkInDate: '2026-08-14',
        checkOutDate: '2026-08-18',
        checkOutTime: '12:00',
        status: 'scheduled',
        consumptionEnabled: true,
        consumptionView: 'ready',
      }),
    ).rejects.toBeInstanceOf(ApiException);

    await expect(
      service.resendAccess(sessionContext, 'stay_001'),
    ).resolves.toHaveProperty('challengeId', 'chl_001');
    await expect(
      service.revokeGuestSessions(sessionContext, 'stay_001'),
    ).resolves.toEqual({ revokedSessions: 2 });

    stayRepository.findOne.mockResolvedValueOnce({
      ...stay,
      status: 'scheduled',
      statusLabel: 'Agendada',
    });
    await expect(
      service.checkInStay(sessionContext, 'stay_001'),
    ).resolves.toHaveProperty('status', 'active');
    stayRepository.findOne.mockResolvedValueOnce({
      ...stay,
      status: 'active',
      statusLabel: 'Ativa',
    });
    await expect(
      service.checkOutStay(sessionContext, 'stay_001'),
    ).resolves.toHaveProperty('stay.status', 'checked_out');
    stayRepository.findOne.mockResolvedValueOnce({
      ...stay,
      status: 'scheduled',
      statusLabel: 'Agendada',
    });
    await expect(
      service.cancelStay(sessionContext, 'stay_001'),
    ).resolves.toHaveProperty('status', 'cancelled');

    await expect(
      service.updateWifi(sessionContext, 'stay_001', {
        wifiNetwork: 'New Wi-Fi',
        wifiPassword: 'new-password',
      }),
    ).resolves.toHaveProperty('id', 'stay_001');
    await expect(
      service.listUsefulInfo(sessionContext, 'stay_001'),
    ).resolves.toHaveLength(1);
    await expect(
      service.createUsefulInfo(sessionContext, 'stay_001', {
        scope: 'stay',
        title: 'Piscina',
        description: 'Aberta ate 20:00',
        position: 2,
      }),
    ).resolves.toHaveProperty('title', 'Piscina');
    await expect(
      service.listConsumption(sessionContext, 'stay_001'),
    ).resolves.toHaveLength(1);
    await expect(
      service.createConsumption(sessionContext, 'stay_001', {
        title: 'Agua',
        description: 'Frigobar',
        category: 'minibar',
        icon: 'Bottle',
        amountCents: 900,
        currency: 'BRL',
        occurredAt: '2026-08-14T12:00:00.000Z',
      }),
    ).resolves.toHaveProperty('amountCents', 900);
    await expect(
      service.updateConsumption(sessionContext, 'stay_001', 'cons_001', {
        title: 'Agua com gas',
        description: 'Frigobar',
        category: 'minibar',
        icon: 'Bottle',
        amountCents: 1100,
        currency: 'BRL',
        occurredAt: '2026-08-14T13:00:00.000Z',
      }),
    ).resolves.toHaveProperty('amountCents', 1100);
    await expect(
      service.deleteConsumption(sessionContext, 'stay_001', 'cons_001'),
    ).resolves.toEqual({ id: 'cons_001' });
    expect(consumptionItemRepository.remove).toHaveBeenCalledWith(
      consumptionItem,
    );

    stayRepository.findOne.mockResolvedValueOnce(null);
    await expect(
      service.getStay(sessionContext, 'missing'),
    ).rejects.toBeInstanceOf(ApiException);
  });

  it('delegates from admin guest and stay controllers', async () => {
    const service = {
      listGuests: jest.fn().mockResolvedValue({
        items: [{ id: 'guest_001' }],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      }),
      createGuest: jest.fn().mockResolvedValue({ id: 'guest_002' }),
      updateGuest: jest.fn().mockResolvedValue({ id: 'guest_001' }),
      deleteGuest: jest.fn().mockResolvedValue({ id: 'guest_001' }),
      listStays: jest.fn().mockResolvedValue({
        items: [{ id: 'stay_001' }],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      }),
      createStay: jest.fn().mockResolvedValue({ id: 'stay_002' }),
      getStay: jest.fn().mockResolvedValue({ id: 'stay_001' }),
      resendAccess: jest.fn().mockResolvedValue({ challengeId: 'chl_001' }),
      revokeGuestSessions: jest.fn().mockResolvedValue({ revokedSessions: 1 }),
      checkInStay: jest
        .fn()
        .mockResolvedValue({ id: 'stay_001', status: 'active' }),
      checkOutStay: jest.fn().mockResolvedValue({
        stay: { id: 'stay_001', status: 'checked_out' },
        revokedSessions: 1,
      }),
      cancelStay: jest
        .fn()
        .mockResolvedValue({ id: 'stay_001', status: 'cancelled' }),
      updateWifi: jest.fn().mockResolvedValue({ id: 'stay_001' }),
      listUsefulInfo: jest.fn().mockResolvedValue([{ id: 'info_001' }]),
      createUsefulInfo: jest.fn().mockResolvedValue({ id: 'info_002' }),
      listConsumption: jest.fn().mockResolvedValue([{ id: 'cons_001' }]),
      createConsumption: jest.fn().mockResolvedValue({ id: 'cons_002' }),
      updateConsumption: jest.fn().mockResolvedValue({ id: 'cons_001' }),
      deleteConsumption: jest.fn().mockResolvedValue({ id: 'cons_001' }),
    };
    const guestsController = new AdminGuestsController(service as never);
    const staysController = new AdminStaysController(service as never);

    await expect(
      guestsController.listGuests(sessionContext, { search: 'ana' }),
    ).resolves.toHaveProperty('total', 1);
    await expect(
      guestsController.createGuest(sessionContext, {
        firstName: 'Ana',
        lastName: 'Silva',
        phoneNumber: '+5531999999999',
      }),
    ).resolves.toHaveProperty('id', 'guest_002');
    await expect(
      guestsController.updateGuest(sessionContext, 'guest_001', {
        firstName: 'Ana',
        lastName: 'Silva',
        phoneNumber: '+5531999999999',
      }),
    ).resolves.toHaveProperty('id', 'guest_001');
    await expect(
      guestsController.deleteGuest(sessionContext, 'guest_001'),
    ).resolves.toEqual({ id: 'guest_001' });
    await expect(
      staysController.listStays(sessionContext, { status: 'active' }),
    ).resolves.toHaveProperty('items.length', 1);
    await expect(
      staysController.createStay(sessionContext, {} as never),
    ).resolves.toHaveProperty('id', 'stay_002');
    await expect(
      staysController.getStay(sessionContext, 'stay_001'),
    ).resolves.toHaveProperty('id', 'stay_001');
    await expect(
      staysController.resendAccess(sessionContext, 'stay_001'),
    ).resolves.toHaveProperty('challengeId', 'chl_001');
    await expect(
      staysController.revokeGuestSessions(sessionContext, 'stay_001'),
    ).resolves.toEqual({ revokedSessions: 1 });
    await expect(
      staysController.checkInStay(sessionContext, 'stay_001'),
    ).resolves.toHaveProperty('status', 'active');
    await expect(
      staysController.checkOutStay(sessionContext, 'stay_001'),
    ).resolves.toHaveProperty('stay.status', 'checked_out');
    await expect(
      staysController.cancelStay(sessionContext, 'stay_001'),
    ).resolves.toHaveProperty('status', 'cancelled');
    await expect(
      staysController.updateWifi(sessionContext, 'stay_001', {
        wifiNetwork: 'A',
        wifiPassword: 'B',
      }),
    ).resolves.toHaveProperty('id', 'stay_001');
    await expect(
      staysController.listUsefulInfo(sessionContext, 'stay_001'),
    ).resolves.toHaveLength(1);
    await expect(
      staysController.createUsefulInfo(sessionContext, 'stay_001', {} as never),
    ).resolves.toHaveProperty('id', 'info_002');
    await expect(
      staysController.listConsumption(sessionContext, 'stay_001'),
    ).resolves.toHaveLength(1);
    await expect(
      staysController.createConsumption(
        sessionContext,
        'stay_001',
        {} as never,
      ),
    ).resolves.toHaveProperty('id', 'cons_002');
    await expect(
      staysController.updateConsumption(
        sessionContext,
        'stay_001',
        'cons_001',
        {} as never,
      ),
    ).resolves.toHaveProperty('id', 'cons_001');
    await expect(
      staysController.deleteConsumption(sessionContext, 'stay_001', 'cons_001'),
    ).resolves.toHaveProperty('id', 'cons_001');
  });

  it('handles admin service catalog and request queue flows', async () => {
    const serviceQueryBuilder = {
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[serviceDefinition], 1]),
    };
    const serviceDefinitionRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(serviceQueryBuilder),
      findOne: jest.fn().mockResolvedValue(serviceDefinition),
      save: jest.fn((entity) => Promise.resolve(entity)),
    };
    const requestQueryBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(1),
      getRawMany: jest
        .fn()
        .mockResolvedValue([
          { ...stayRequest, id: 'req_001', guestName: 'Everton Rodrigues' },
        ]),
      getOne: jest.fn().mockResolvedValue(stayRequest),
    };
    const stayRequestRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(requestQueryBuilder),
      save: jest.fn((entity) => Promise.resolve(entity)),
    };
    const auditService = { record: jest.fn() };
    const service = new AdminServicesService(
      serviceDefinitionRepository as never,
      stayRequestRepository as never,
      auditService as never,
    );

    await expect(service.listServices({})).resolves.toMatchObject({ total: 1 });
    await expect(
      service.createService(sessionContext, serviceDefinition as never),
    ).resolves.toHaveProperty('id');
    await expect(
      service.updateService(
        sessionContext,
        'towels',
        serviceDefinition as never,
      ),
    ).resolves.toHaveProperty('title', 'Toalhas');
    await expect(
      service.setServicePublished(sessionContext, 'towels', false),
    ).resolves.toHaveProperty('published', false);
    await expect(
      service.listRequests(sessionContext, {
        status: 'received',
        search: '304',
      }),
    ).resolves.toMatchObject({ total: 1 });
    await expect(
      service.updateRequestStatus(sessionContext, 'req_001', {
        status: 'on_the_way',
        internalNote: 'Saiu da rouparia',
      }),
    ).resolves.toHaveProperty('statusLabel', 'A caminho');

    serviceDefinitionRepository.findOne.mockResolvedValueOnce(null);
    await expect(
      service.updateService(
        sessionContext,
        'missing',
        serviceDefinition as never,
      ),
    ).rejects.toBeInstanceOf(ApiException);
    requestQueryBuilder.getOne.mockResolvedValueOnce(null);
    await expect(
      service.updateRequestStatus(sessionContext, 'missing', {
        status: 'completed',
      }),
    ).rejects.toBeInstanceOf(ApiException);
  });

  it('delegates from admin services and requests controllers', async () => {
    const service = {
      listServices: jest.fn().mockResolvedValue({
        items: [{ id: 'towels' }],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      }),
      createService: jest.fn().mockResolvedValue({ id: 'laundry' }),
      updateService: jest.fn().mockResolvedValue({ id: 'towels' }),
      setServicePublished: jest.fn().mockResolvedValue({ id: 'towels' }),
      listRequests: jest.fn().mockResolvedValue({
        items: [{ id: 'req_001' }],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      }),
      updateRequestStatus: jest.fn().mockResolvedValue({ id: 'req_001' }),
    };
    const servicesController = new AdminServicesController(service as never);
    const requestsController = new AdminRequestsController(service as never);

    await expect(servicesController.listServices({})).resolves.toHaveProperty(
      'total',
      1,
    );
    await expect(
      servicesController.createService(
        sessionContext,
        serviceDefinition as never,
      ),
    ).resolves.toHaveProperty('id', 'laundry');
    await expect(
      servicesController.updateService(
        sessionContext,
        'towels',
        serviceDefinition as never,
      ),
    ).resolves.toHaveProperty('id', 'towels');
    await expect(
      servicesController.publishService(sessionContext, 'towels'),
    ).resolves.toHaveProperty('id', 'towels');
    await expect(
      servicesController.unpublishService(sessionContext, 'towels'),
    ).resolves.toHaveProperty('id', 'towels');
    await expect(
      requestsController.listRequests(sessionContext, { status: 'received' }),
    ).resolves.toHaveProperty('total', 1);
    await expect(
      requestsController.updateRequestStatus(sessionContext, 'req_001', {
        status: 'completed',
      }),
    ).resolves.toHaveProperty('id', 'req_001');
  });

  it('handles admin experience, collection, slot and reservation flows', async () => {
    const experienceQueryBuilder = {
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[experience], 1]),
    };
    const experienceRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(experienceQueryBuilder),
      findOne: jest.fn().mockResolvedValue(experience),
      save: jest.fn((entity) => Promise.resolve(entity)),
    };
    const collectionRepository = {
      find: jest.fn().mockResolvedValue([collection]),
      findOne: jest.fn().mockResolvedValue(collection),
      save: jest.fn((entity) => Promise.resolve(entity)),
    };
    const collectionItemRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      save: jest.fn((entity) => Promise.resolve(entity)),
    };
    const slotRepository = {
      find: jest.fn().mockResolvedValue([slot]),
      findOne: jest.fn().mockResolvedValue(slot),
      save: jest.fn((entity) => Promise.resolve(entity)),
    };
    const reservationQueryBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      innerJoinAndMapOne: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(1),
      getRawMany: jest.fn().mockResolvedValue([
        {
          ...reservation,
          id: 'res_001',
          roomNumber: '304',
          guestName: 'Everton Rodrigues',
        },
      ]),
      getOne: jest.fn().mockResolvedValue(reservation),
    };
    const reservationRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(reservationQueryBuilder),
      save: jest.fn((entity) => Promise.resolve(entity)),
    };
    const stayRepository = {
      findOne: jest.fn().mockResolvedValue(stay),
    };
    const auditService = { record: jest.fn() };
    const service = new AdminExperiencesService(
      experienceRepository as never,
      collectionRepository as never,
      collectionItemRepository as never,
      slotRepository as never,
      reservationRepository as never,
      stayRepository as never,
      auditService as never,
    );

    await expect(service.listExperiences({})).resolves.toMatchObject({
      total: 1,
    });
    await expect(
      service.createExperience(sessionContext, experience as never),
    ).resolves.toHaveProperty('id');
    await expect(
      service.updateExperience(sessionContext, 'exp_001', experience as never),
    ).resolves.toHaveProperty('title', 'Jantar');
    await expect(service.listCollections()).resolves.toHaveLength(1);
    await expect(
      service.createCollection(sessionContext, collection as never),
    ).resolves.toHaveProperty('id');
    await expect(
      service.updateCollection(sessionContext, 'col_001', collection as never),
    ).resolves.toHaveProperty('title', 'Gastronomia');
    await expect(
      service.linkExperience(sessionContext, 'col_001', {
        experienceId: 'exp_001',
        position: 1,
      }),
    ).resolves.toHaveProperty('experienceId', 'exp_001');
    await expect(service.listSlots('exp_001')).resolves.toHaveLength(1);
    await expect(
      service.createSlot(sessionContext, 'exp_001', {
        startsAt: '2026-08-14T19:00:00.000Z',
        isAvailable: true,
        position: 1,
      }),
    ).resolves.toHaveProperty('isAvailable', true);
    await expect(
      service.updateSlot(sessionContext, 'exp_001', 'slot_001', {
        isAvailable: false,
      }),
    ).resolves.toHaveProperty('isAvailable', false);
    await expect(
      service.listReservations(sessionContext, {
        status: 'requested',
        search: '304',
      }),
    ).resolves.toMatchObject({ total: 1 });
    slotRepository.findOne.mockResolvedValueOnce({
      ...slot,
      isAvailable: true,
    });
    await expect(
      service.createReservation(sessionContext, {
        stayId: 'stay_001',
        experienceId: 'exp_001',
        slotId: 'slot_001',
      }),
    ).resolves.toHaveProperty('status', 'confirmed');
    await expect(
      service.updateReservationStatus(sessionContext, 'res_001', {
        status: 'completed',
      }),
    ).resolves.toHaveProperty('statusLabel', 'Concluida');

    experienceRepository.findOne.mockResolvedValueOnce(null);
    await expect(
      service.updateExperience(sessionContext, 'missing', experience as never),
    ).rejects.toBeInstanceOf(ApiException);
    collectionRepository.findOne.mockResolvedValueOnce(null);
    await expect(
      service.updateCollection(sessionContext, 'missing', collection as never),
    ).rejects.toBeInstanceOf(ApiException);
    slotRepository.findOne.mockResolvedValueOnce(null);
    await expect(
      service.updateSlot(sessionContext, 'exp_001', 'missing', {
        isAvailable: true,
      }),
    ).rejects.toBeInstanceOf(ApiException);
    slotRepository.findOne.mockResolvedValueOnce({
      ...slot,
      isAvailable: false,
    });
    await expect(
      service.createReservation(sessionContext, {
        stayId: 'stay_001',
        experienceId: 'exp_001',
        slotId: 'slot_001',
      }),
    ).rejects.toBeInstanceOf(ApiException);
    stayRepository.findOne.mockResolvedValueOnce(null);
    await expect(
      service.createReservation(sessionContext, {
        stayId: 'missing',
        experienceId: 'exp_001',
        slotId: 'slot_001',
      }),
    ).rejects.toBeInstanceOf(ApiException);
    reservationQueryBuilder.getOne.mockResolvedValueOnce(null);
    await expect(
      service.updateReservationStatus(sessionContext, 'missing', {
        status: 'cancelled',
      }),
    ).rejects.toBeInstanceOf(ApiException);
  });

  it('delegates from admin experience and reservation controllers', async () => {
    const service = {
      listExperiences: jest.fn().mockResolvedValue({
        items: [{ id: 'exp_001' }],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      }),
      createExperience: jest.fn().mockResolvedValue({ id: 'exp_002' }),
      updateExperience: jest.fn().mockResolvedValue({ id: 'exp_001' }),
      listSlots: jest.fn().mockResolvedValue([{ id: 'slot_001' }]),
      createSlot: jest.fn().mockResolvedValue({ id: 'slot_002' }),
      updateSlot: jest.fn().mockResolvedValue({ id: 'slot_001' }),
      listCollections: jest.fn().mockResolvedValue([{ id: 'col_001' }]),
      createCollection: jest.fn().mockResolvedValue({ id: 'col_002' }),
      updateCollection: jest.fn().mockResolvedValue({ id: 'col_001' }),
      linkExperience: jest.fn().mockResolvedValue({ id: 'col_item_001' }),
      listReservations: jest.fn().mockResolvedValue({
        items: [{ id: 'res_001' }],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      }),
      createReservation: jest.fn().mockResolvedValue({ id: 'res_002' }),
      updateReservationStatus: jest.fn().mockResolvedValue({ id: 'res_001' }),
    };
    const experiencesController = new AdminExperiencesController(
      service as never,
    );
    const collectionsController = new AdminExperienceCollectionsController(
      service as never,
    );
    const reservationsController = new AdminReservationsController(
      service as never,
    );

    await expect(
      experiencesController.listExperiences({}),
    ).resolves.toHaveProperty('total', 1);
    await expect(
      experiencesController.createExperience(
        sessionContext,
        experience as never,
      ),
    ).resolves.toHaveProperty('id', 'exp_002');
    await expect(
      experiencesController.updateExperience(
        sessionContext,
        'exp_001',
        experience as never,
      ),
    ).resolves.toHaveProperty('id', 'exp_001');
    await expect(
      experiencesController.listSlots('exp_001'),
    ).resolves.toHaveLength(1);
    await expect(
      experiencesController.createSlot(sessionContext, 'exp_001', {} as never),
    ).resolves.toHaveProperty('id', 'slot_002');
    await expect(
      experiencesController.updateSlot(
        sessionContext,
        'exp_001',
        'slot_001',
        {} as never,
      ),
    ).resolves.toHaveProperty('id', 'slot_001');
    await expect(collectionsController.listCollections()).resolves.toHaveLength(
      1,
    );
    await expect(
      collectionsController.createCollection(
        sessionContext,
        collection as never,
      ),
    ).resolves.toHaveProperty('id', 'col_002');
    await expect(
      collectionsController.updateCollection(
        sessionContext,
        'col_001',
        collection as never,
      ),
    ).resolves.toHaveProperty('id', 'col_001');
    await expect(
      collectionsController.linkExperience(sessionContext, 'col_001', {
        experienceId: 'exp_001',
        position: 1,
      }),
    ).resolves.toHaveProperty('id', 'col_item_001');
    await expect(
      reservationsController.listReservations(sessionContext, {}),
    ).resolves.toHaveProperty('total', 1);
    await expect(
      reservationsController.createReservation(sessionContext, {} as never),
    ).resolves.toHaveProperty('id', 'res_002');
    await expect(
      reservationsController.updateReservationStatus(
        sessionContext,
        'res_001',
        { status: 'confirmed' },
      ),
    ).resolves.toHaveProperty('id', 'res_001');
  });
});
