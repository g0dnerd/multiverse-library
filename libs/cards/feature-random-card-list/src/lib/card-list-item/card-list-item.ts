import { Component, input } from '@angular/core';

import { CardEntity } from '@multiverse-library/cards/data-access';

@Component({
  selector: 'lib-card-list-item',
  templateUrl: './card-list-item.html',
})
export class CardListItem {
  card = input.required<CardEntity>();
}
