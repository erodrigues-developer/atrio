import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Stay } from './stay.entity';

@Entity({ name: 'stay_useful_info' })
export class StayUsefulInfo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'public_id', type: 'varchar', length: 100, unique: true })
  publicId!: string;

  @Column({ name: 'stay_id', type: 'varchar', length: 100 })
  stayId!: string;

  @Column({ type: 'varchar', length: 20 })
  scope!: 'dashboard' | 'stay';

  @Column({ type: 'varchar', length: 150 })
  title!: string;

  @Column({ type: 'varchar', length: 255 })
  description!: string;

  @Column({ type: 'int' })
  position!: number;

  @ManyToOne(() => Stay, (stay) => stay.usefulInfo)
  @JoinColumn({ name: 'stay_id', referencedColumnName: 'publicId' })
  stay!: Stay;
}
