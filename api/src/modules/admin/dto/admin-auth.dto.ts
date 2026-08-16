import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class AdminLoginRequestDto {
  @ApiProperty({ example: 'admin@atrio.app' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'admin123' })
  @IsString()
  @MinLength(6)
  password!: string;
}

export class AdminHotelDto {
  @ApiProperty({ example: 'copacabana-palace' })
  id!: string;

  @ApiProperty({ example: 'Copacabana Palace' })
  name!: string;
}

export class AdminMeResponseDto {
  @ApiProperty({ example: 'admin_001' })
  adminUserId!: string;

  @ApiProperty({ example: 'Atrio Manager' })
  name!: string;

  @ApiProperty({ example: 'admin@atrio.app' })
  email!: string;

  @ApiProperty({ example: 'owner' })
  role!: string;

  @ApiProperty({ type: [String] })
  permissions!: string[];

  @ApiProperty({ type: AdminHotelDto })
  hotel!: AdminHotelDto;
}

export class AdminLoginResponseDto {
  @ApiProperty({ example: 'adm_atk_123' })
  accessToken!: string;

  @ApiProperty({ example: '2026-08-14T20:00:00.000Z' })
  expiresAt!: string;

  @ApiProperty({ type: AdminMeResponseDto })
  admin!: AdminMeResponseDto;
}
