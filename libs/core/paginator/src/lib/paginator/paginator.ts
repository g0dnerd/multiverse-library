import { Component, input, output } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'lib-paginator',
  imports: [MatPaginatorModule],
  templateUrl: './paginator.html',
  styleUrl: './paginator.scss',
})
export class Paginator {
  readonly count = input.required<number>();
  readonly total = input.required<number>();
  pageChanged = output<PageEvent>();

  readonly pageSize = 16;
  pageIndex = 0;

  pageEvent: PageEvent | null = null;

  handlePageEvent(e: PageEvent) {
    this.pageChanged.emit(e);
    this.pageEvent = e;
    this.pageIndex = e.pageIndex;
  }
}
