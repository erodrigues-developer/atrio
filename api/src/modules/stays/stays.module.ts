import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { StaysController } from './controllers/stays.controller';
import { ConsumptionItem } from './entities/consumption-item.entity';
import { Guest } from './entities/guest.entity';
import { Hotel } from './entities/hotel.entity';
import { HotelUsefulInfo } from './entities/hotel-useful-info.entity';
import { Stay } from './entities/stay.entity';
import { StayUsefulInfo } from './entities/stay-useful-info.entity';
import { StayRepository } from './repositories/stay.repository';
import { StaysService } from './services/stays.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Hotel, Guest, Stay, StayUsefulInfo, HotelUsefulInfo, ConsumptionItem]),
    forwardRef(() => AuthModule),
  ],
  controllers: [StaysController],
  providers: [StayRepository, StaysService],
  exports: [StayRepository, StaysService],
})
export class StaysModule {}
