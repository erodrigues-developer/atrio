import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'concierge_messages' })
export class ConciergeMessage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'public_id', type: 'varchar', length: 100, unique: true })
  publicId!: string;

  @Column({ name: 'stay_id', type: 'varchar', length: 100 })
  stayId!: string;

  @Column({ type: 'varchar', length: 20 })
  sender!: 'hotel' | 'guest';

  @Column({ type: 'varchar', length: 500 })
  text!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  source!: string | null;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
