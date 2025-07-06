import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateCardDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @ApiProperty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty()
  scryfallId: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false, default: false })
  isDoubleFaced?: boolean;

  @IsOptional()
  @IsString()
  @IsUrl()
  @IsNotEmpty()
  @ApiProperty({ required: false, nullable: true })
  frontFaceImg?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  @IsNotEmpty()
  @ApiProperty({ required: false, nullable: true })
  backFaceImg?: string;

  @IsString()
  @IsUrl()
  @IsNotEmpty()
  @ApiProperty()
  printsSearchUri: string;
}
