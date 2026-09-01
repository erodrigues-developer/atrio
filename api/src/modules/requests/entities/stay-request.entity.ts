import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'stay_requests' })
export class StayRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'public_id', type: 'varchar', length: 100, unique: true })
  publicId!: string;

  @Column({ name: 'stay_id', type: 'varchar', length: 100 })
  stayId!: string;

  @Column({ name: 'service_id', type: 'varchar', length: 100 })
  serviceId!: string;

  @Column({ type: 'varchar', length: 100 })
  type!: string;

  @Column({ type: 'varchar', length: 150 })
  title!: string;

  @Column({ type: 'varchar', length: 50 })
  status!: string;

  @Column({ name: 'status_label', type: 'varchar', length: 100 })
  statusLabel!: string;

  @Column({ type: 'int', nullable: true })
  quantity!: number | null;

  @Column({ type: 'varchar', length: 500, default: '' })
  note!: string;

  @Column({ name: 'internal_note', type: 'varchar', length: 500, nullable: true })
  internalNote!: string | null;

  @Column({ name: 'room_number', type: 'varchar', length: 20 })
  roomNumber!: string;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
