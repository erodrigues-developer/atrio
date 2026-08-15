import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Guest } from './guest.entity';
import { Hotel } from './hotel.entity';
import { StayUsefulInfo } from './stay-useful-info.entity';
import { ConsumptionItem } from './consumption-item.entity';

@Entity({ name: 'stays' })
export class Stay {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'public_id', type: 'varchar', length: 100, unique: true })
  publicId!: string;

  @Column({ name: 'hotel_id', type: 'varchar', length: 100 })
  hotelId!: string;

  @Column({ name: 'guest_id', type: 'varchar', length: 100 })
  guestId!: string;

  @Column({ name: 'room_number', type: 'varchar', length: 20 })
  roomNumber!: string;

  @Column({ type: 'varchar', length: 30 })
  status!: string;

  @Column({ name: 'status_label', type: 'varchar', length: 100 })
  statusLabel!: string;

  @Column({ name: 'check_in_date', type: 'date' })
  checkInDate!: string;

  @Column({ name: 'check_out_date', type: 'date' })
  checkOutDate!: string;

  @Column({ name: 'check_out_time', type: 'varchar', length: 10 })
  checkOutTime!: string;

  @Column({ name: 'wifi_network', type: 'varchar', length: 150 })
  wifiNetwork!: string;

  @Column({ name: 'wifi_password', type: 'varchar', length: 150 })
  wifiPassword!: string;

  @Column({ name: 'consumption_enabled', type: 'boolean', default: true })
  consumptionEnabled!: boolean;

  @Column({ name: 'consumption_view', type: 'varchar', length: 30, default: 'ready' })
  consumptionView!: 'ready' | 'empty' | 'unavailable';

  @ManyToOne(() => Hotel, (hotel) => hotel.stays, { eager: true })
  @JoinColumn({ name: 'hotel_id', referencedColumnName: 'publicId' })
  hotel!: Hotel;

  @ManyToOne(() => Guest, (guest) => guest.stays, { eager: true })
  @JoinColumn({ name: 'guest_id', referencedColumnName: 'publicId' })
  guest!: Guest;

  @OneToMany(() => StayUsefulInfo, (usefulInfo) => usefulInfo.stay)
  usefulInfo!: StayUsefulInfo[];

  @OneToMany(() => ConsumptionItem, (consumptionItem) => consumptionItem.stay)
  consumptionItems!: ConsumptionItem[];
}
