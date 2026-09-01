import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'audit_logs' })
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'public_id', type: 'varchar', length: 100, unique: true })
  publicId!: string;

  @Column({ name: 'hotel_id', type: 'varchar', length: 100 })
  hotelId!: string;

  @Column({ name: 'admin_user_id', type: 'varchar', length: 100, nullable: true })
  adminUserId!: string | null;

  @Column({ type: 'varchar', length: 100 })
  action!: string;

  @Column({ name: 'resource_type', type: 'varchar', length: 100 })
  resourceType!: string;

  @Column({ name: 'resource_id', type: 'varchar', length: 100, nullable: true })
  resourceId!: string | null;

  @Column({ type: 'varchar', length: 255 })
  summary!: string;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
