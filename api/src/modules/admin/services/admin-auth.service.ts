import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiException } from 'src/common/exceptions/api.exception';
import { AdminSessionContext } from 'src/common/interfaces/admin-session-context.interface';
import { buildResourceId } from 'src/common/utils/id.util';
import { MoreThan, IsNull, Repository } from 'typeorm';
import { AdminSession } from '../entities/admin-session.entity';
import { AdminUser } from '../entities/admin-user.entity';
import { AuditService } from './audit.service';
import { PasswordService } from './password.service';

@Injectable()
export class AdminAuthService {
  constructor(
    @InjectRepository(AdminUser)
    private readonly adminUserRepository: Repository<AdminUser>,
    @InjectRepository(AdminSession)
    private readonly adminSessionRepository: Repository<AdminSession>,
    private readonly passwordService: PasswordService,
    private readonly auditService: AuditService,
    private readonly configService: ConfigService,
  ) {}

  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const adminUser = await this.adminUserRepository.findOne({ where: { email: normalizedEmail } });

    if (!adminUser || !adminUser.isActive || !this.passwordService.verify(password, adminUser.passwordHash)) {
      throw new ApiException(401, 'ADMIN_INVALID_CREDENTIALS', 'Invalid admin credentials.');
    }

    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + (this.configService.get<number>('auth.accessTokenTtlMinutes') ?? 720) * 60 * 1000,
    );
    const session = new AdminSession();
    session.publicId = buildResourceId('admin_session');
    session.adminUserId = adminUser.publicId;
    session.hotelId = adminUser.hotelId;
    session.accessToken = buildResourceId('admin_atk');
    session.createdAt = now;
    session.expiresAt = expiresAt;
    session.revokedAt = null;

    adminUser.lastLoginAt = now;
    adminUser.updatedAt = now;

    await this.adminSessionRepository.save(session);
    await this.adminUserRepository.save(adminUser);
    await this.auditService.record({
      hotelId: adminUser.hotelId,
      adminUserId: adminUser.publicId,
      action: 'admin.login',
      resourceType: 'admin_user',
      resourceId: adminUser.publicId,
      summary: `${adminUser.email} logged in.`,
    });

    return {
      accessToken: session.accessToken,
      expiresAt: session.expiresAt.toISOString(),
      admin: this.mapAdmin(adminUser),
    };
  }

  async logout(session: AdminSessionContext) {
    await this.adminSessionRepository.update(
      { publicId: session.sessionId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
    await this.auditService.record({
      hotelId: session.hotelId,
      adminUserId: session.adminUserId,
      action: 'admin.logout',
      resourceType: 'admin_session',
      resourceId: session.sessionId,
      summary: `${session.email} logged out.`,
    });

    return { ok: true };
  }

  async getMe(session: AdminSessionContext) {
    const adminUser = await this.adminUserRepository.findOne({ where: { publicId: session.adminUserId } });

    if (!adminUser) {
      throw new ApiException(401, 'UNAUTHORIZED', 'Admin user could not be loaded.');
    }

    return this.mapAdmin(adminUser);
  }

  async validateAccessToken(accessToken: string): Promise<AdminSessionContext> {
    const adminSession = await this.adminSessionRepository.findOne({
      where: {
        accessToken,
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      relations: {
        adminUser: {
          hotel: true,
        },
      },
    });

    if (!adminSession || !adminSession.adminUser?.isActive) {
      throw new ApiException(401, 'UNAUTHORIZED', 'Admin token is invalid or expired.');
    }

    return {
      accessToken,
      adminUserId: adminSession.adminUser.publicId,
      adminUserName: adminSession.adminUser.name,
      email: adminSession.adminUser.email,
      hotelId: adminSession.hotelId,
      role: adminSession.adminUser.role,
      permissions: adminSession.adminUser.permissions,
      sessionId: adminSession.publicId,
    };
  }

  private mapAdmin(adminUser: AdminUser) {
    return {
      adminUserId: adminUser.publicId,
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role,
      permissions: adminUser.permissions,
      hotel: {
        id: adminUser.hotelId,
        name: adminUser.hotel?.name ?? adminUser.hotelId,
      },
    };
  }
}
