import { CardEntity } from '@multiverse-library/cards/data-access';

export interface CardListResponse {
  cards: CardEntity[];
  cursor?: number;
  count: number;
}
