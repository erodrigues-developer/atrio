import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'reservations' })
export class Reservation {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  id!: string;

  @Column({ name: 'stay_id', type: 'varchar', length: 100 })
  stayId!: string;

  @Column({ name: 'experience_id', type: 'varchar', length: 100 })
  experienceId!: string;

  @Column({ type: 'varchar', length: 150 })
  title!: string;

  @Column({ type: 'varchar', length: 50 })
  status!: string;

  @Column({ name: 'status_label', type: 'varchar', length: 100 })
  statusLabel!: string;

  @Column({ name: 'date_label', type: 'varchar', length: 50 })
  dateLabel!: string;

  @Column({ name: 'time_label', type: 'varchar', length: 10 })
  timeLabel!: string;

  @Column({ name: 'scheduled_at', type: 'timestamptz' })
  scheduledAt!: Date;

  @Column({ name: 'location_label', type: 'varchar', length: 150 })
  locationLabel!: string;

  @Column({ name: 'price_label', type: 'varchar', length: 100 })
  priceLabel!: string;

  @Column({ type: 'varchar', length: 255 })
  note!: string;

  @Column({ name: 'guest_note', type: 'varchar', length: 255, nullable: true })
  guestNote!: string | null;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
