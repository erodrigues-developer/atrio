import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsString, MaxLength, Min } from 'class-validator';

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
