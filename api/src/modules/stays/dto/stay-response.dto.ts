import { ApiProperty } from '@nestjs/swagger';

class StaySummaryDto {
  @ApiProperty()
  requests!: string;

  @ApiProperty()
  reservations!: string;
}

class UsefulInfoDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  description!: string;
}

export class StayResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  hotelId!: string;

  @ApiProperty()
  hotelName!: string;

  @ApiProperty()
  guestId!: string;

  @ApiProperty()
  roomNumber!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  statusLabel!: string;

  @ApiProperty()
  checkInDate!: string;

  @ApiProperty()
  checkOutDate!: string;

  @ApiProperty()
  checkInLabel!: string;

  @ApiProperty()
  checkOutLabel!: string;

  @ApiProperty()
  checkOutTime!: string;

  @ApiProperty({ type: StaySummaryDto })
  summaries!: StaySummaryDto;

  @ApiProperty({ type: [UsefulInfoDto] })
  usefulInfo!: UsefulInfoDto[];
}

export class WifiResponseDto {
  @ApiProperty()
  network!: string;

  @ApiProperty()
  password!: string;

  @ApiProperty()
  updatedAt!: string;
}
