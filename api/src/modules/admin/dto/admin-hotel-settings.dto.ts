import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsString, Matches, MaxLength, Min } from 'class-validator';

export class UpdateAdminHotelWifiDto {
  @ApiProperty()
  @IsString()
  @MaxLength(150)
  wifiNetwork!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(150)
  wifiPassword!: string;
}

export class UpdateAdminHotelOperationHoursDto {
  @ApiProperty({ example: '14:00' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  checkInTime!: string;

  @ApiProperty({ example: '12:00' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  checkOutTime!: string;
}

export class CreateAdminHotelUsefulInfoDto {
  @ApiProperty()
  @IsIn(['dashboard', 'stay'])
  scope!: 'dashboard' | 'stay';

  @ApiProperty()
  @IsString()
  @MaxLength(150)
  title!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(255)
  description!: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  position!: number;
}

export class UpdateAdminHotelUsefulInfoDto extends CreateAdminHotelUsefulInfoDto {}
