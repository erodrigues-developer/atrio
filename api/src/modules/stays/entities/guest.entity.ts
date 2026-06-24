import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Stay } from './stay.entity';

@Entity({ name: 'guests' })
export class Guest {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  id!: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName!: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName!: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 30 })
  phoneNumber!: string;

  @Column({ name: 'masked_phone', type: 'varchar', length: 30 })
  maskedPhone!: string;

  @OneToMany(() => Stay, (stay) => stay.guest)
  stays!: Stay[];
}
