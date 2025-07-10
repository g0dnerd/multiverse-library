import { Route } from '@angular/router';

import { FeatureRandomCardList } from '@librarian/cards/feature-random-card-list';
import { FeatureCuratedCardList } from '@librarian/cards/feature-curated-card-list';

export const appRoutes: Route[] = [
  {
    path: '',
    component: FeatureRandomCardList,
  },
  {
    path: 'keyword',
    component: FeatureCuratedCardList,
  },
];
