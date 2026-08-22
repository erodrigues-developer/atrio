import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Hotel } from './hotel.entity';

@Entity({ name: 'hotel_useful_info' })
export class HotelUsefulInfo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'public_id', type: 'varchar', length: 100, unique: true })
  publicId!: string;

  @Column({ name: 'hotel_id', type: 'varchar', length: 100 })
  hotelId!: string;

  @Column({ type: 'varchar', length: 20 })
  scope!: 'dashboard' | 'stay';

  @Column({ type: 'varchar', length: 150 })
  title!: string;

  @Column({ type: 'varchar', length: 255 })
  description!: string;

  @Column({ type: 'int' })
  position!: number;

  @ManyToOne(() => Hotel)
  @JoinColumn({ name: 'hotel_id', referencedColumnName: 'publicId' })
  hotel!: Hotel;
}
