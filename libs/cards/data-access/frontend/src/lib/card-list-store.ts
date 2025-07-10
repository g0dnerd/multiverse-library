import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap } from 'rxjs';

import { CardEntity } from '@multiverse-library/cards/data-access';
import {
  setLoaded,
  setLoading,
  withCallState,
} from '@librarian/core/data-access';
import { CardService } from './card-service';
import { cardListInitialState, CardListState } from './card-state';

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
    getCardsByKeyword: rxMethod<string[]>(
      pipe(
        switchMap((keywords) => {
          patchState(store, {
            cards: cardListInitialState.cards,
            ...setLoading('getCardsByKeyword'),
          });
          return cardService.getCardsByKeyword(keywords).pipe(
            tapResponse({
              next: (cards: CardEntity[]) => {
                patchState(store, {
                  cards,
                  ...setLoaded('getCardsByKeyword'),
                });
              },
              error: () => {
                patchState(store, {
                  cards: cardListInitialState.cards,
                  ...setLoaded('getCardsByKeyword'),
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
  withCallState({ collection: 'getRandomCards' }),
  withCallState({ collection: 'getCardsByKeyword' })
);
