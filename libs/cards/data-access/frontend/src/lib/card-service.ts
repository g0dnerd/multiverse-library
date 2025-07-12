import { HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '@librarian/core/http-client';
import { CardEntity } from '@multiverse-library/cards/data-access';
import { CardListResponse } from './models/card-list-response';

@Injectable({ providedIn: 'root' })
export class CardService {
  private readonly apiService = inject(ApiService);
  private readonly apiSuffix = '/cards';

  getCard(id: number): Observable<CardEntity> {
    return this.apiService.get<CardEntity>(`${this.apiSuffix}/${id}`);
  }

  getRandomCards(amount: number): Observable<CardListResponse> {
    return this.apiService.get<CardListResponse>(
      `${this.apiSuffix}/random/${amount}`
    );
  }

  getCardsByKeyword(
    keywords: string[],
    backwards: boolean,
    cursor?: number
  ): Observable<CardListResponse> {
    let params = new HttpParams();
    params = params.append('keywords', keywords.join(','));
    if (cursor) {
      params = params.append('cursor', cursor);
    }
    params = params.append('backwards', backwards);
    return this.apiService.get<CardListResponse>(
      `${this.apiSuffix}/by-keyword`,
      params
    );
  }
}
