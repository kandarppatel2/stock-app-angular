import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, lastValueFrom, map, of, switchMap } from 'rxjs';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(private http: HttpClient) {
    this.filteredOptions = this.formControl.valueChanges.pipe(
      switchMap((val) => {
        if (!val) return of(null);
        return this.getSuggestions(val);
      }),
      map((response) => {
        if (!response) return [];
        return response.tickers;
      })
    );
  }

  formControl = new FormControl();
  options = [];
  autoValue = '';
  filteredOptions: Observable<string[]>;

  selectedTickers: { ticker: string; price: number }[] = [];

  getSuggestions(query: string) {
    return this.http.get<any>(
      `https://us-west2-csci201-376723.cloudfunctions.net/stocks/v1/search?query=` +
        query
    );
  }

  getPrice(query: string) {
    return this.http.get<any>(
      `https://us-west2-csci201-376723.cloudfunctions.net/stocks/v1/price?ticker=` +
        query
    );
  }

  onSelectionChange(event: MatAutocompleteSelectedEvent) {
    this.getPrice(event.option['value'] as string).subscribe((response) => {
      this.selectedTickers.push({
        ticker: event.option['value'] as string,
        price: response.price,
      });
      this.formControl.reset('');
    });
  }

  async refreshPrice() {
    const newSelectedTickers = [];
    for (const tickerObj of this.selectedTickers) {
      const response = await lastValueFrom(this.getPrice(tickerObj.ticker));
      newSelectedTickers.push({
        ticker: tickerObj.ticker,
        price: response.price,
      });
    }
    this.selectedTickers = newSelectedTickers;
  }
}
