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

  @OneToMany(() => Stay, (stay) => stay.hotel)
  stays!: Stay[];
}
