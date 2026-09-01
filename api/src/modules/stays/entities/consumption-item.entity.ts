import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Stay } from './stay.entity';

@Entity({ name: 'consumption_items' })
export class ConsumptionItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'public_id', type: 'varchar', length: 100, unique: true })
  publicId!: string;

  @Column({ name: 'stay_id', type: 'varchar', length: 100 })
  stayId!: string;

  @Column({ type: 'varchar', length: 150 })
  title!: string;

  @Column({ type: 'varchar', length: 255 })
  description!: string;

  @Column({ type: 'varchar', length: 50 })
  category!: string;

  @Column({ type: 'varchar', length: 30 })
  icon!: string;

  @Column({ name: 'amount_cents', type: 'int' })
  amountCents!: number;

  @Column({ type: 'varchar', length: 3, default: 'BRL' })
  currency!: string;

  @Column({ name: 'occurred_at', type: 'timestamptz' })
  occurredAt!: Date;

  @ManyToOne(() => Stay, (stay) => stay.consumptionItems)
  @JoinColumn({ name: 'stay_id', referencedColumnName: 'publicId' })
  stay!: Stay;
}
