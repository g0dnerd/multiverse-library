import { ScryfallCard } from './card';

export interface ScryfallPrints {
  object: 'list';
  total_cards: number;
  has_more: boolean;
  data: ScryfallCard[];
}
