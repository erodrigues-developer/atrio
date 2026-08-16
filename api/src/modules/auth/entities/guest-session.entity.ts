import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'guest_sessions' })
export class GuestSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'public_id', type: 'varchar', length: 100, unique: true })
  publicId!: string;

  @Column({ name: 'guest_id', type: 'varchar', length: 100 })
  guestId!: string;

  @Column({ name: 'stay_id', type: 'varchar', length: 100 })
  stayId!: string;

  @Column({ name: 'access_token', type: 'varchar', length: 255, unique: true })
  accessToken!: string;

  @Column({ name: 'refresh_token', type: 'varchar', length: 255, unique: true })
  refreshToken!: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt!: Date | null;
}
