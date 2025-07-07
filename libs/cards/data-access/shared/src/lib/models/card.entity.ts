import { ApiProperty } from '@nestjs/swagger';

import { Card } from '@library/prisma-client';

export class CardEntity implements Card {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  scryfallId: string;

  @ApiProperty()
  isDoubleFaced: boolean;

  @ApiProperty({ required: false, nullable: true })
  frontFaceImg: string | null;

  @ApiProperty({ required: false, nullable: true })
  backFaceImg: string | null;

  @ApiProperty()
  printsSearchUri: string;
}
