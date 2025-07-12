import { Component, inject, OnInit } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';

import { CardListStore, KeywordListStore } from '@librarian/cards/data-access';
import { CardListItem } from '@librarian/cards/feature-random-card-list';
import { AutocompleteSelect } from '@librarian/core/autocomplete-select';

@Component({
  selector: 'lib-curated-card-list',
  imports: [AutocompleteSelect, CardListItem, MatSelectModule],
  templateUrl: './feature-curated-card-list.html',
})
export class FeatureCuratedCardList implements OnInit {
  private readonly cardListStore = inject(CardListStore);
  private readonly keywordListStore = inject(KeywordListStore);

  $cards = this.cardListStore.cards;
  $allKeywords = this.keywordListStore.keywords;
  $isCardsLoading = this.cardListStore.getCardsByKeywordLoading;
  $isKeywordsLoading = this.keywordListStore.getKeywordAbilitiesLoading;

  ngOnInit() {
    this.keywordListStore.getKeywordAbilities();
  }

  updateCards(keywords: string[]) {
    this.cardListStore.getCardsByKeyword(keywords);
  }
}
