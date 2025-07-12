import { Component, inject, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';

import { CardListStore, KeywordListStore } from '@librarian/cards/data-access';
import { CardListItem } from '@librarian/cards/feature-random-card-list';
import { AutocompleteSelect } from '@librarian/core/autocomplete-select';
import { Paginator } from '@librarian/core/paginator';

@Component({
  selector: 'lib-curated-card-list',
  imports: [AutocompleteSelect, CardListItem, MatSelectModule, Paginator],
  templateUrl: './feature-curated-card-list.html',
})
export class FeatureCuratedCardList implements OnInit {
  private readonly cardListStore = inject(CardListStore);
  private readonly keywordListStore = inject(KeywordListStore);

  private keywords: string[] = [];

  readonly $cards = this.cardListStore.cards;
  readonly $cursor = this.cardListStore.cursor;
  readonly $count = this.cardListStore.count;
  readonly $isCardsLoading = this.cardListStore.getCardsByKeywordLoading;

  readonly $allKeywords = this.keywordListStore.keywords;
  readonly $isKeywordsLoading =
    this.keywordListStore.getKeywordAbilitiesLoading;

  ngOnInit() {
    this.keywordListStore.getKeywordAbilities();
  }

  updateCards(keywords: string[]) {
    this.keywords = keywords;
    if (keywords.length > 0) {
      this.cardListStore.getCardsByKeyword({ keywords, backwards: false });
    }
  }

  handlePageChange(e: PageEvent) {
    const pageIdx = e.pageIndex;
    const prevPageIdx = e.previousPageIndex;
    const backwards = prevPageIdx && prevPageIdx > pageIdx ? true : false;

    const cursor = this.$cursor();
    const keywords = this.keywords;

    if (cursor !== null) {
      this.cardListStore.getCardsByKeyword({ keywords, backwards, cursor });
    } else {
      this.cardListStore.getCardsByKeyword({ keywords, backwards: false });
    }
  }
}
