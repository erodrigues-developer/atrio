import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class AdminGuestResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty()
  phoneNumber!: string;

  @ApiProperty()
  maskedPhone!: string;
}

export class CreateAdminGuestDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  firstName!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  lastName!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(30)
  phoneNumber!: string;
}

export class AdminGuestListQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;
}

export class AdminStayListQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string;
}

export class CreateAdminStayDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  guestId?: string;

  @ApiProperty({ required: false, type: CreateAdminGuestDto })
  @IsOptional()
  guest?: CreateAdminGuestDto;

  @ApiProperty()
  @IsString()
  @MaxLength(20)
  roomNumber!: string;

  @ApiProperty({ example: '2026-08-14' })
  @IsDateString()
  checkInDate!: string;

  @ApiProperty({ example: '2026-08-18' })
  @IsDateString()
  checkOutDate!: string;

  @ApiProperty({ example: '12:00' })
  @IsString()
  @MaxLength(10)
  checkOutTime!: string;

  @ApiProperty({ example: 'active' })
  @IsIn(['scheduled', 'active', 'checked_out', 'cancelled'])
  status!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(150)
  wifiNetwork!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(150)
  wifiPassword!: string;

  @ApiProperty()
  @IsBoolean()
  consumptionEnabled!: boolean;

  @ApiProperty()
  @IsIn(['ready', 'empty', 'unavailable'])
  consumptionView!: 'ready' | 'empty' | 'unavailable';
}

export class AdminStayResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  hotelId!: string;

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
  checkOutTime!: string;

  @ApiProperty()
  wifiNetwork!: string;

  @ApiProperty()
  wifiPassword!: string;

  @ApiProperty()
  consumptionEnabled!: boolean;

  @ApiProperty()
  consumptionView!: string;

  @ApiProperty({ type: AdminGuestResponseDto })
  guest!: AdminGuestResponseDto;

  @ApiProperty()
  activeGuestSessions!: number;
}

export class UpdateAdminStayWifiDto {
  @ApiProperty()
  @IsString()
  @MaxLength(150)
  wifiNetwork!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(150)
  wifiPassword!: string;
}

export class CreateAdminStayUsefulInfoDto {
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

export class AdminStayUsefulInfoResponseDto extends CreateAdminStayUsefulInfoDto {
  @ApiProperty()
  id!: string;
}

export class CreateAdminConsumptionItemDto {
  @ApiProperty()
  @IsString()
  @MaxLength(150)
  title!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(255)
  description!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(50)
  category!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(30)
  icon!: string;

  @ApiProperty()
  @IsInt()
  amountCents!: number;

  @ApiProperty({ example: 'BRL' })
  @IsString()
  @MaxLength(3)
  currency!: string;

  @ApiProperty()
  @IsDateString()
  occurredAt!: string;
}

export class AdminConsumptionItemResponseDto extends CreateAdminConsumptionItemDto {
  @ApiProperty()
  id!: string;
}
