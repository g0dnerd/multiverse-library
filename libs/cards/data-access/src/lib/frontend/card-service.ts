import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '@multiverse-library/core/http-client';
import { CardEntity } from '../models/card.entity';

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
