import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap } from 'rxjs';

import {
  setLoaded,
  setLoading,
  withCallState,
} from '@librarian/core/data-access';
import { KeywordService } from './keyword-service';
import { keywordListInitialState, KeywordListState } from './keyword-state';

export const KeywordListStore = signalStore(
  { providedIn: 'root' },
  withState<KeywordListState>(keywordListInitialState),
  withMethods((store, keywordService = inject(KeywordService)) => ({
    getKeywordAbilities: rxMethod<void>(
      pipe(
        switchMap(() => {
          patchState(store, {
            keywords: keywordListInitialState.keywords,
            ...setLoading('getKeywordAbilities'),
          });
          return keywordService.getKeywordAbilities().pipe(
            tapResponse({
              next: (keywords: string[]) => {
                patchState(store, {
                  keywords,
                  ...setLoaded('getKeywordAbilities'),
                });
              },
              error: () => {
                patchState(store, {
                  keywords: keywordListInitialState.keywords,
                  ...setLoaded('getKeywordAbilities'),
                });
              },
            })
          );
        })
      )
    ),
    initializeKeywords: () => {
      patchState(store, keywordListInitialState);
    },
  })),
  withCallState({ collection: 'getKeywordAbilities' })
);
