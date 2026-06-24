import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Stay } from './stay.entity';

@Entity({ name: 'hotels' })
export class Hotel {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  id!: string;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @OneToMany(() => Stay, (stay) => stay.hotel)
  stays!: Stay[];
}
