import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-autocomplete-select',
  imports: [
    MatAutocompleteModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    FormsModule,
  ],
  templateUrl: './autocomplete-select.html',
})
export class AutocompleteSelect {
  allOptions = input.required<string[]>();
  userSelection = output<string[]>();

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  readonly announcer = inject(LiveAnnouncer);

  readonly currentSelection = model('');
  readonly selectedOptions = signal<string[]>([]);
  readonly availableOptions = computed(() => {
    const selectedOptions = this.selectedOptions();
    return this.allOptions().filter((k) => !selectedOptions.includes(k));
  });
  readonly filteredOptions = computed(() => {
    const currentSelection = this.currentSelection().toLowerCase();
    return currentSelection
      ? this.availableOptions().filter((option) =>
          option.toLowerCase().includes(currentSelection)
        )
      : this.availableOptions().slice();
  });

  constructor() {
    effect(() => {
      this.userSelection.emit(this.selectedOptions());
    });
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value) {
      this.selectedOptions.update((options) => [...options, value]);
    }

    // Clear the input value
    this.currentSelection.set('');
  }

  remove(option: string): void {
    this.selectedOptions.update((options) => {
      const index = options.indexOf(option);
      if (index < 0) {
        return options;
      }

      options.splice(index, 1);
      this.announcer.announce(`Removed ${option}`);
      return [...options];
    });
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.selectedOptions.update((options) => [
      ...options,
      event.option.viewValue,
    ]);
    this.currentSelection.set('');
    event.option.deselect();
  }
}
