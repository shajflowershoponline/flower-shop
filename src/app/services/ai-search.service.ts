import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../model/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class AiSearchService {
  private prompts = new BehaviorSubject([]);
  prompts$ = this.prompts.asObservable();
  constructor(private http: HttpClient) { }

  init() {
    this.http.get<string[]>('.././../assets/json/ai-prompt-placeholder.json').subscribe((data) => {
      this.prompts.next(data);
    });
  }

  autocompleteAISearch(q: string): Observable<any> {
    return this.http.get<any>(environment.autocompleteAIApiBaseUrl + environment.api.autocompleteAI.search + "?q=" + q)
      .pipe(
        tap(_ => this.log('product')),
        catchError(this.handleError('product', {} as any))
      );
  }

  handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      this.log(`${operation} failed: ${Array.isArray(error.error.message) ? error.error.message[0] : error.error.message}`);
      return of(error.error as T);
    };
  }

  log(message: string) {
    console.log(message);
  }
}
