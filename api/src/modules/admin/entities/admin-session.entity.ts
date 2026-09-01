import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AdminUser } from './admin-user.entity';

@Entity({ name: 'admin_sessions' })
export class AdminSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'public_id', type: 'varchar', length: 100, unique: true })
  publicId!: string;

  @Column({ name: 'admin_user_id', type: 'varchar', length: 100 })
  adminUserId!: string;

  @Column({ name: 'hotel_id', type: 'varchar', length: 100 })
  hotelId!: string;

  @Column({ name: 'access_token', type: 'varchar', length: 255, unique: true })
  accessToken!: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt!: Date | null;

  @ManyToOne(() => AdminUser, (adminUser) => adminUser.sessions, { eager: true })
  @JoinColumn({ name: 'admin_user_id', referencedColumnName: 'publicId' })
  adminUser!: AdminUser;
}
