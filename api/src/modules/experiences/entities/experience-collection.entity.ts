import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { ExperienceCollectionItem } from './experience-collection-item.entity';

@Entity({ name: 'experience_collections' })
export class ExperienceCollection {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  id!: string;

  @Column({ type: 'varchar', length: 150 })
  title!: string;

  @Column({ type: 'varchar', length: 255 })
  description!: string;

  @Column({ type: 'boolean', default: false })
  featured!: boolean;

  @OneToMany(() => ExperienceCollectionItem, (item) => item.collection)
  items!: ExperienceCollectionItem[];
}
