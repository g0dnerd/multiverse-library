import { Component, inject } from '@angular/core';

import { CardListStore } from '@librarian/cards/data-access';
import { CardListItem } from '../card-list-item/card-list-item';

@Component({
  selector: 'lib-random-card-list',
  imports: [CardListItem],
  templateUrl: './feature-random-card-list.html',
})
export class FeatureRandomCardList {
  private readonly cardListStore = inject(CardListStore);

  $cards = this.cardListStore.cards;
  $isLoading = this.cardListStore.getRandomCardsLoading;

  getRandomCards() {
    this.cardListStore.getRandomCards(5);
  }
}
