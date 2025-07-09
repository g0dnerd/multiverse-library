import { $Enums } from '@library/prisma-client';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Min,
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

  @IsOptional()
  @IsInt()
  @Min(0)
  @ApiProperty({ required: false, default: 0 })
  manaValue?: number;

  @IsArray()
  @ApiProperty()
  keywords: string[];

  @IsArray()
  @ApiProperty()
  colors: $Enums.Color[];
}
