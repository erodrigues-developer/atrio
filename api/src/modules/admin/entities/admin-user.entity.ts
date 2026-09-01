import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Hotel } from 'src/modules/stays/entities/hotel.entity';
import { AdminSession } from './admin-session.entity';

@Entity({ name: 'admin_users' })
export class AdminUser {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'public_id', type: 'varchar', length: 100, unique: true })
  publicId!: string;

  @Column({ name: 'hotel_id', type: 'varchar', length: 100 })
  hotelId!: string;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({ type: 'varchar', length: 50 })
  role!: string;

  @Column({ type: 'jsonb', default: [] })
  permissions!: string[];

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt!: Date | null;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => Hotel, { eager: true })
  @JoinColumn({ name: 'hotel_id', referencedColumnName: 'publicId' })
  hotel!: Hotel;

  @OneToMany(() => AdminSession, (session) => session.adminUser)
  sessions!: AdminSession[];
}
