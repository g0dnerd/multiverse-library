import { TitleCasePipe } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';

import { CardListStore, KeywordListStore } from '@librarian/cards/data-access';
import { CardListItem } from '@librarian/cards/feature-random-card-list';
import { AutocompleteSelect } from '@librarian/core/autocomplete-select';
import { Paginator } from '@librarian/core/paginator';
import { ManaValueRange } from '../mana-value-range/mana-value-range';

@Component({
  selector: 'lib-curated-card-list',
  imports: [
    AutocompleteSelect,
    CardListItem,
    ManaValueRange,
    MatSelectModule,
    Paginator,
  ],
  templateUrl: './feature-curated-card-list.html',
  providers: [TitleCasePipe],
})
export class FeatureCuratedCardList implements OnInit {
  private readonly cardListStore = inject(CardListStore);
  private readonly keywordListStore = inject(KeywordListStore);
  private readonly titleCasePipe = inject(TitleCasePipe);

  pageIdx = 0;

  private keywords: string[] = [];

  readonly $cards = this.cardListStore.cards;
  readonly $cursor = this.cardListStore.cursor;
  readonly $count = this.cardListStore.count;
  readonly $isCardsLoading = this.cardListStore.getCardsByKeywordLoading;
  readonly $isCardsLoaded = this.cardListStore.getCardsByKeywordLoaded;

  readonly $allKeywords = this.keywordListStore.keywords;
  readonly $isKeywordsLoading =
    this.keywordListStore.getKeywordAbilitiesLoading;
  readonly $isKeywordsLoaded = this.keywordListStore.getKeywordAbilitiesLoaded;

  readonly $allKeywordsTransformed = computed(() =>
    this.$allKeywords().map((k) => this.titleCasePipe.transform(k))
  );

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
    this.pageIdx = pageIdx;
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
