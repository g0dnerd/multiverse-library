import { CardEntity } from '@multiverse-library/cards/data-access';

export interface CardState {
  data: CardEntity | null;
}

export const cardInitialState: CardState = {
  data: null,
};

export interface CardListState {
  cards: CardEntity[];
  cursor: number | null;
  count: number;
}

export const cardListInitialState: CardListState = {
  cards: [],
  cursor: null,
  count: 0,
};
