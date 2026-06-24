import { ApiProperty } from '@nestjs/swagger';

class GreetingDto {
  @ApiProperty()
  periodLabel!: string;

  @ApiProperty()
  guestFirstName!: string;

  @ApiProperty()
  message!: string;
}

class DashboardStayDto {
  @ApiProperty()
  hotelName!: string;

  @ApiProperty()
  roomNumber!: string;

  @ApiProperty()
  checkOutTime!: string;
}

class QuickActionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  icon!: string;

  @ApiProperty()
  target!: string;
}

class FeaturedExperienceDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  badge!: string;

  @ApiProperty()
  category!: string;

  @ApiProperty()
  timeLabel!: string;

  @ApiProperty()
  priceLabel!: string;

  @ApiProperty()
  imageUrl!: string;
}

class RequestSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  statusLabel!: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  roomNumber!: string;

  @ApiProperty()
  createdAt!: string;
}

class ReservationSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  experienceId!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  statusLabel!: string;

  @ApiProperty()
  scheduledAt!: string;

  @ApiProperty()
  dateLabel!: string;

  @ApiProperty()
  timeLabel!: string;
}

class UsefulInfoDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  description!: string;
}

export class DashboardResponseDto {
  @ApiProperty({ type: GreetingDto })
  greeting!: GreetingDto;

  @ApiProperty({ type: DashboardStayDto })
  stay!: DashboardStayDto;

  @ApiProperty({ type: [QuickActionDto] })
  quickActions!: QuickActionDto[];

  @ApiProperty({ type: FeaturedExperienceDto })
  featuredExperience!: FeaturedExperienceDto;

  @ApiProperty({ type: [RequestSummaryDto] })
  requests!: RequestSummaryDto[];

  @ApiProperty({ type: [ReservationSummaryDto] })
  reservations!: ReservationSummaryDto[];

  @ApiProperty({ type: [UsefulInfoDto] })
  usefulInfo!: UsefulInfoDto[];
}
