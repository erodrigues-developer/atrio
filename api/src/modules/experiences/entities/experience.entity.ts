import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { ExperienceAvailabilitySlot } from './experience-availability-slot.entity';
import { ExperienceCollectionItem } from './experience-collection-item.entity';

@Entity({ name: 'experiences' })
export class Experience {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  id!: string;

  @Column({ type: 'varchar', length: 150 })
  title!: string;

  @Column({ type: 'varchar', length: 500 })
  description!: string;

  @Column({ type: 'varchar', length: 100 })
  category!: string;

  @Column({ name: 'time_label', type: 'varchar', length: 100 })
  timeLabel!: string;

  @Column({ name: 'price_label', type: 'varchar', length: 100 })
  priceLabel!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  badge!: string | null;

  @Column({ name: 'image_url', type: 'varchar', length: 255 })
  imageUrl!: string;

  @Column({ name: 'duration_label', type: 'varchar', length: 100, nullable: true })
  durationLabel!: string | null;

  @Column({ name: 'availability_label', type: 'varchar', length: 100, nullable: true })
  availabilityLabel!: string | null;

  @Column({ name: 'location_label', type: 'varchar', length: 150, nullable: true })
  locationLabel!: string | null;

  @Column({ name: 'location_description', type: 'varchar', length: 255, nullable: true })
  locationDescription!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  policy!: string | null;

  @Column({ type: 'jsonb', default: [] })
  included!: string[];

  @OneToMany(() => ExperienceCollectionItem, (item) => item.experience)
  collections!: ExperienceCollectionItem[];

  @OneToMany(() => ExperienceAvailabilitySlot, (slot) => slot.experience)
  availabilitySlots!: ExperienceAvailabilitySlot[];
}
