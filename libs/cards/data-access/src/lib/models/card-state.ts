import { CardEntity } from './card.entity';

export interface CardState {
  data: CardEntity | null;
}

export const cardInitialState: CardState = {
  data: null,
};

export interface CardListState {
  cards: CardEntity[];
}

export const cardListInitialState: CardListState = {
  cards: [],
};
