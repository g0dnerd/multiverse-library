import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { BulkData } from './models/bulk';

@Injectable()
export class ScryfallService {
  private readonly scryfallApiUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService
  ) {
    this.scryfallApiUrl = this.configService.get<string>('SCRYFALL_API_URL')!;
  }

  getBulkUris(): Observable<AxiosResponse<BulkData[]>> {
    return this.httpService.get(`${this.scryfallApiUrl}/bulk-data`);
  }
}
