import { Component, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';

@Component({
  selector: 'lib-mana-value-range',
  imports: [FormsModule, MatSliderModule],
  templateUrl: './mana-value-range.html',
  styleUrl: './mana-value-range.scss',
})
export class ManaValueRange {
  mvMin = output<number>();
  mvMax = output<number>();

  minValue = 1;
  maxValue = 6;
}
