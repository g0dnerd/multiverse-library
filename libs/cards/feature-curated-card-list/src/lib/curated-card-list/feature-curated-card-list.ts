import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  Component,
  computed,
  inject,
  model,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

import { CardListStore, KeywordListStore } from '@librarian/cards/data-access';
import { CardListItem } from '@librarian/cards/feature-random-card-list';

@Component({
  selector: 'lib-curated-card-list',
  imports: [
    CardListItem,
    MatAutocompleteModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    FormsModule,
  ],
  templateUrl: './feature-curated-card-list.html',
})
export class FeatureCuratedCardList implements OnInit {
  private readonly cardListStore = inject(CardListStore);
  private readonly keywordListStore = inject(KeywordListStore);

  $cards = this.cardListStore.cards;
  $allKeywords = this.keywordListStore.keywords;
  $isCardsLoading = this.cardListStore.getCardsByKeywordLoading;
  $isKeywordsLoading = this.keywordListStore.getKeywordAbilitiesLoading;

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  readonly currentKeyword = model('');
  readonly keywords = signal<string[]>([]);

  readonly availableKeywords = computed(() => {
    const selectedKeywords = this.keywords();
    return this.$allKeywords().filter((k) => !selectedKeywords.includes(k));
  });
  readonly filteredKeywords = computed(() => {
    const currentKeyword = this.currentKeyword().toLowerCase();
    return currentKeyword
      ? this.availableKeywords().filter((keyword) =>
          keyword.toLowerCase().includes(currentKeyword)
        )
      : this.availableKeywords().slice();
  });

  readonly announcer = inject(LiveAnnouncer);

  ngOnInit() {
    this.keywordListStore.getKeywordAbilities();
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value) {
      this.keywords.update((keywords) => [...keywords, value]);
    }

    // Clear the input value
    this.currentKeyword.set('');
  }

  remove(keyword: string): void {
    this.keywords.update((keywords) => {
      const index = keywords.indexOf(keyword);
      if (index < 0) {
        return keywords;
      }

      keywords.splice(index, 1);
      this.announcer.announce(`Removed ${keyword}`);
      return [...keywords];
    });
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.keywords.update((keywords) => [...keywords, event.option.viewValue]);
    this.currentKeyword.set('');
    event.option.deselect();
  }

  onSubmit() {
    const keywords = this.keywords();
    if (!keywords) return;

    this.cardListStore.getCardsByKeyword(keywords);
  }
}
