import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class IdentifyStayAccessDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  hotelId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  roomNumber!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName!: string;
}

export class VerifyStayAccessDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  challengeId!: string;

  @ApiProperty()
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/)
  code!: string;
}

export class ResendStayAccessCodeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  challengeId!: string;
}

export class StayAccessChallengeResponseDto {
  @ApiProperty()
  challengeId!: string;

  @ApiProperty()
  deliveryChannel!: string;

  @ApiProperty()
  maskedPhone!: string;

  @ApiProperty()
  expiresAt!: string;

  @ApiProperty()
  resendAvailableAt!: string;
}

class SessionDto {
  @ApiProperty()
  guestId!: string;

  @ApiProperty()
  guestName!: string;

  @ApiProperty()
  hotelId!: string;

  @ApiProperty()
  stayId!: string;

  @ApiProperty()
  roomNumber!: string;

  @ApiProperty()
  isAuthenticated!: boolean;
}

class StayDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  hotelName!: string;

  @ApiProperty()
  roomNumber!: string;

  @ApiProperty()
  checkOutTime!: string;
}

export class VerifyStayAccessResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  refreshToken!: string;

  @ApiProperty({ type: SessionDto })
  session!: SessionDto;

  @ApiProperty({ type: StayDto })
  stay!: StayDto;
}

export class SessionResponseDto {
  @ApiProperty()
  guestId!: string;

  @ApiProperty()
  guestName!: string;

  @ApiProperty()
  hotelId!: string;

  @ApiProperty()
  stayId!: string;

  @ApiProperty()
  roomNumber!: string;

  @ApiProperty()
  isAuthenticated!: boolean;
}
