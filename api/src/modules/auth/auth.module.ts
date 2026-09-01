import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '../redis/redis.module';
import { StaysModule } from '../stays/stays.module';
import { StayAccessController } from './controllers/stay-access.controller';
import { SessionController } from './controllers/session.controller';
import { GuestSession } from './entities/guest-session.entity';
import { GuestSessionRepository } from './repositories/guest-session.repository';
import { AuthService } from './services/auth.service';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';

@Module({
  imports: [TypeOrmModule.forFeature([GuestSession]), RedisModule, forwardRef(() => StaysModule)],
  controllers: [StayAccessController, SessionController],
  providers: [AuthService, GuestSessionRepository, AccessTokenGuard],
  exports: [AuthService, GuestSessionRepository, AccessTokenGuard],
})
export class AuthModule {}
