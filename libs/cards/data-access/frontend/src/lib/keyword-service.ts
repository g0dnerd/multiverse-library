import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '@librarian/core/http-client';

@Injectable({ providedIn: 'root' })
export class KeywordService {
  private readonly apiService = inject(ApiService);
  private readonly apiSuffix = '/scryfall/catalog/keyword-abilities';

  getKeywordAbilities(): Observable<string[]> {
    return this.apiService.get<string[]>(this.apiSuffix);
  }
}
