import { Component, inject, OnInit } from '@angular/core';

import { CardListStore } from '@librarian/cards/data-access';
import { CardListItem } from '@librarian/cards/feature-random-card-list';

@Component({
  selector: 'lib-curated-card-list',
  imports: [CardListItem],
  templateUrl: './feature-curated-card-list.html',
})
export class FeatureCuratedCardList implements OnInit {
  private readonly cardListStore = inject(CardListStore);

  $cards = this.cardListStore.cards;
  $isLoading = this.cardListStore.getCardsByKeywordLoading;

  ngOnInit() {
    this.cardListStore.getCardsByKeyword(['flying', 'vigilance']);
  }
}
