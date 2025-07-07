import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FeatureRandomCardList } from '@librarian/cards/feature-random-card-list';

@Component({
  imports: [FeatureRandomCardList, RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'librarian';
}
