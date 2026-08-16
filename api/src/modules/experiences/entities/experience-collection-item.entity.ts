import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ExperienceCollection } from './experience-collection.entity';
import { Experience } from './experience.entity';

@Entity({ name: 'experience_collection_items' })
export class ExperienceCollectionItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'public_id', type: 'varchar', length: 150, unique: true })
  publicId!: string;

  @Column({ name: 'collection_id', type: 'varchar', length: 100 })
  collectionId!: string;

  @Column({ name: 'experience_id', type: 'varchar', length: 100 })
  experienceId!: string;

  @Column({ type: 'int' })
  position!: number;

  @ManyToOne(() => ExperienceCollection, (collection) => collection.items)
  @JoinColumn({ name: 'collection_id', referencedColumnName: 'publicId' })
  collection!: ExperienceCollection;

  @ManyToOne(() => Experience, (experience) => experience.collections, { eager: true })
  @JoinColumn({ name: 'experience_id', referencedColumnName: 'publicId' })
  experience!: Experience;
}
