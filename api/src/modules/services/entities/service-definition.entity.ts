import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'service_definitions' })
export class ServiceDefinition {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  id!: string;

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
}
