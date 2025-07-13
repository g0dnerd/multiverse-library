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
import { CardListResponse } from './models/card-list-response';

export const CardListStore = signalStore(
  { providedIn: 'root' },
  withState<CardListState>(cardListInitialState),
  withMethods((store, cardService = inject(CardService)) => ({
    getRandomCards: rxMethod<number>(
      pipe(
        switchMap((amount) => {
          patchState(store, {
            cards: cardListInitialState.cards,
            cursor: cardListInitialState.cursor,
            count: cardListInitialState.count,
            ...setLoading('getRandomCards'),
          });
          return cardService.getRandomCards(amount).pipe(
            tapResponse({
              next: (res: CardListResponse) => {
                patchState(store, {
                  cards: res.cards,
                  cursor: null,
                  count: res.count,
                  ...setLoaded('getRandomCards'),
                });
              },
              error: () => {
                patchState(store, {
                  cards: cardListInitialState.cards,
                  cursor: cardListInitialState.cursor,
                  count: cardListInitialState.count,
                  ...setLoaded('getRandomCards'),
                });
              },
            })
          );
        })
      )
    ),
    getCardsByKeyword: rxMethod<{
      keywords: string[];
      cursor?: number;
      backwards: boolean;
    }>(
      pipe(
        switchMap(({ keywords, cursor, backwards }) => {
          patchState(store, {
            cards: cardListInitialState.cards,
            count: cardListInitialState.count,
            ...setLoading('getCardsByKeyword'),
          });
          return cardService.getCardsByQuery(backwards, keywords, cursor).pipe(
            tapResponse({
              next: (res: CardListResponse) => {
                patchState(store, {
                  cards: res.cards,
                  cursor: res.cursor,
                  count: res.count,
                  ...setLoaded('getCardsByKeyword'),
                });
              },
              error: () => {
                patchState(store, {
                  cards: cardListInitialState.cards,
                  cursor: cardListInitialState.cursor,
                  count: cardListInitialState.count,
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
