import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Stay } from './stay.entity';

@Entity({ name: 'hotels' })
export class Hotel {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'public_id', type: 'varchar', length: 100, unique: true })
  publicId!: string;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ name: 'logo_url', type: 'varchar', length: 255, nullable: true })
  logoUrl!: string | null;

  @Column({ name: 'hero_image_url', type: 'varchar', length: 255, nullable: true })
  heroImageUrl!: string | null;

  @Column({ name: 'wifi_network', type: 'varchar', length: 150, nullable: true })
  wifiNetwork!: string | null;

  @Column({ name: 'wifi_password', type: 'varchar', length: 150, nullable: true })
  wifiPassword!: string | null;

  @Column({ name: 'check_in_time', type: 'varchar', length: 5, default: '14:00' })
  checkInTime!: string;

  @Column({ name: 'check_out_time', type: 'varchar', length: 5, default: '12:00' })
  checkOutTime!: string;

  @Column({ type: 'varchar', length: 80, default: 'America/Sao_Paulo' })
  timezone!: string;

  @OneToMany(() => Stay, (stay) => stay.hotel)
  stays!: Stay[];
}
