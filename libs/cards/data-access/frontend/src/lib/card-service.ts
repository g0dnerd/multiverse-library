import { HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '@librarian/core/http-client';
import { CardEntity } from '@multiverse-library/cards/data-access';

@Injectable({ providedIn: 'root' })
export class CardService {
  private readonly apiService = inject(ApiService);
  private readonly apiSuffix = '/cards';

  getCard(id: number): Observable<CardEntity> {
    return this.apiService.get<CardEntity>(`${this.apiSuffix}/${id}`);
  }

  getRandomCards(amount: number): Observable<CardEntity[]> {
    return this.apiService.get<CardEntity[]>(
      `${this.apiSuffix}/random/${amount}`
    );
  }

  getCardsByKeyword(keywords: string[]): Observable<CardEntity[]> {
    let params = new HttpParams();
    params = params.append('keywords', keywords.join(','));
    return this.apiService.get<CardEntity[]>(
      `${this.apiSuffix}/by-keyword`,
      params
    );
  }
}
