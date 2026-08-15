import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'service_definitions' })
export class ServiceDefinition {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'public_id', type: 'varchar', length: 100, unique: true })
  publicId!: string;

  @Column({ type: 'varchar', length: 150 })
  title!: string;

  @Column({ type: 'varchar', length: 255 })
  description!: string;

  @Column({ type: 'varchar', length: 60 })
  icon!: string;

  @Column({ name: 'fulfillment_type', type: 'varchar', length: 60 })
  fulfillmentType!: string;

  @Column({ name: 'request_schema', type: 'jsonb' })
  requestSchema!: {
    fields: Array<Record<string, unknown>>;
  };

  @Column({ type: 'boolean', default: true })
  published!: boolean;
}
