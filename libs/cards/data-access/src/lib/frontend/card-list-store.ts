import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { cardListInitialState, CardListState } from '../models/card-state';
import { inject } from '@angular/core';
import { CardService } from './card-service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap } from 'rxjs';
import {
  setLoaded,
  setLoading,
  withCallState,
} from '@multiverse-library/core/data-access';
import { tapResponse } from '@ngrx/operators';
import { CardEntity } from '../models/card.entity';

export const CardListStore = signalStore(
  { providedIn: 'root' },
  withState<CardListState>(cardListInitialState),
  withMethods((store, cardService = inject(CardService)) => ({
    getRandomCards: rxMethod<number>(
      pipe(
        switchMap((amount) => {
          patchState(store, {
            cards: cardListInitialState.cards,
            ...setLoading('getRandomCards'),
          });
          return cardService.getRandomCards(amount).pipe(
            tapResponse({
              next: (cards: CardEntity[]) => {
                patchState(store, {
                  cards,
                  ...setLoaded('getRandomCards'),
                });
              },
              error: () => {
                patchState(store, {
                  cards: cardListInitialState.cards,
                  ...setLoaded('getRandomCards'),
                });
              },
            })
          );
        })
      )
    ),
    initializeCardList: () => {
      patchState(store, cardListInitialState);
    },
  })),
  withCallState({ collection: 'getRandomCards' })
);
