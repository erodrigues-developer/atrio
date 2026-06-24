import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Experience } from './experience.entity';

@Entity({ name: 'experience_availability_slots' })
export class ExperienceAvailabilitySlot {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  id!: string;

  @Column({ name: 'experience_id', type: 'varchar', length: 100 })
  experienceId!: string;

  @Column({ type: 'date' })
  date!: string;

  @Column({ name: 'day_label', type: 'varchar', length: 50 })
  dayLabel!: string;

  @Column({ name: 'date_label', type: 'varchar', length: 50 })
  dateLabel!: string;

  @Column({ type: 'varchar', length: 10 })
  time!: string;

  @Column({ name: 'starts_at', type: 'timestamptz' })
  startsAt!: Date;

  @Column({ name: 'is_available', type: 'boolean', default: true })
  isAvailable!: boolean;

  @Column({ type: 'int' })
  position!: number;

  @ManyToOne(() => Experience, (experience) => experience.availabilitySlots)
  @JoinColumn({ name: 'experience_id' })
  experience!: Experience;
}
