import { Component, inject, OnInit } from '@angular/core';

import { CardListStore } from '@librarian/cards/data-access';
import { CardListItem } from '../card-list-item/card-list-item';

@Component({
  selector: 'lib-random-card-list',
  imports: [CardListItem],
  templateUrl: './feature-random-card-list.html',
})
export class FeatureRandomCardList implements OnInit {
  private readonly cardListStore = inject(CardListStore);

  $cards = this.cardListStore.cards;
  $isLoading = this.cardListStore.getRandomCardsLoading;

  ngOnInit() {
    this.cardListStore.getRandomCards(16);
  }
}
