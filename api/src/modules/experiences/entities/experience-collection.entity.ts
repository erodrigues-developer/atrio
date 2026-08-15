import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ExperienceCollectionItem } from './experience-collection-item.entity';

@Entity({ name: 'experience_collections' })
export class ExperienceCollection {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'public_id', type: 'varchar', length: 100, unique: true })
  publicId!: string;

  @Column({ type: 'varchar', length: 150 })
  title!: string;

  @Column({ type: 'varchar', length: 255 })
  description!: string;

  @Column({ name: 'image_url', type: 'varchar', length: 255, nullable: true })
  imageUrl!: string | null;

  @Column({ type: 'boolean', default: false })
  featured!: boolean;

  @Column({ type: 'boolean', default: true })
  published!: boolean;

  @OneToMany(() => ExperienceCollectionItem, (item) => item.collection)
  items!: ExperienceCollectionItem[];
}
