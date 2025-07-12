import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { CardEntity } from '@multiverse-library/cards/data-access';

@Component({
  imports: [MatButtonModule, MatIconModule],
  selector: 'lib-card-list-item',
  templateUrl: './card-list-item.html',
  styleUrl: './card-list-item.scss',
})
export class CardListItem {
  card = input.required<CardEntity>();

  backFaceVisible = false;

  flip() {
    this.backFaceVisible = !this.backFaceVisible;
  }
}
