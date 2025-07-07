import { inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap } from 'rxjs';

import { CardEntity } from '@multiverse-library/cards/data-access';
import {
  setLoaded,
  setLoading,
  withCallState,
} from '@librarian/core/data-access';
import { cardInitialState, CardState } from './card-state';
import { CardService } from './card-service';

export const CardStore = signalStore(
  { providedIn: 'root' },
  withState<CardState>(cardInitialState),
  withMethods((store, cardService = inject(CardService)) => ({
    getCard: rxMethod<number>(
      pipe(
        switchMap((id) => {
          patchState(store, {
            data: cardInitialState.data,
            ...setLoading('getCard'),
          });
          return cardService.getCard(id).pipe(
            tapResponse({
              next: (card: CardEntity) => {
                patchState(store, { data: card, ...setLoaded('getCard') });
              },
              error: () => {
                patchState(store, {
                  data: cardInitialState.data,
                  ...setLoaded('getCard'),
                });
              },
            })
          );
        })
      )
    ),
    initializeCard: () => {
      patchState(store, cardInitialState);
    },
  })),
  withCallState({ collection: 'getCard' })
);
