import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { buildResourceId } from 'src/common/utils/id.util';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async record(input: {
    hotelId: string;
    adminUserId?: string | null;
    action: string;
    resourceType: string;
    resourceId?: string | null;
    summary: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    const auditLog = new AuditLog();
    auditLog.publicId = buildResourceId('audit');
    auditLog.hotelId = input.hotelId;
    auditLog.adminUserId = input.adminUserId ?? null;
    auditLog.action = input.action;
    auditLog.resourceType = input.resourceType;
    auditLog.resourceId = input.resourceId ?? null;
    auditLog.summary = input.summary;
    auditLog.metadata = input.metadata ?? {};
    auditLog.createdAt = new Date();

    await this.auditLogRepository.save(auditLog);
  }
}
