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
}
