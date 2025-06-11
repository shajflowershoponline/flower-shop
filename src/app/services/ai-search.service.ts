import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../model/api-response.model';
import { Product } from '../model/product';

@Injectable({
  providedIn: 'root'
})
export class AiSearchService {
  private prompts = new BehaviorSubject([]);
  prompts$ = this.prompts.asObservable();

  private aiPromptSubject = new BehaviorSubject<string | null>(null);
  aiPrompt$ = this.aiPromptSubject.asObservable();

  private isAIResultFeedingSubject = new BehaviorSubject<boolean | null>(null);
  isAIResultFeeding$ = this.isAIResultFeedingSubject.asObservable();

  constructor(private http: HttpClient) { }

  setAIPrompt(aiPrompt: string) {
    this.aiPromptSubject.next(aiPrompt);
  }

  setIsAIResultFeeding(isFeedin: boolean) {
    this.isAIResultFeedingSubject.next(isFeedin);
  }

  init() {
    this.http.get<string[]>('.././../assets/json/ai-prompt-placeholder.json').subscribe((data) => {
      this.prompts.next(data);
    });
  }

  autocompleteAISearch(q: string): Observable<any> {
    return this.http.get<any>(environment.autocompleteAIApiBaseUrl + environment.api.autocompleteAI.search + "?q=" + q)
      .pipe(
        tap(_ => this.log('ai')),
        catchError(this.handleError('ai', {} as any))
      );
  }

  getAiSearchResponse(params: {
    customerUserId?: any,
    query?: any,

  }): Observable<ApiResponse<{ results: {
    categories: string[];
    collections: string[];
    colors: string[];
    products: Product[];
    hotPicks: {
        productId: any;
        popularityScore: number;
    }[];
    bestSellers: {
        productId: any;
        totalOrders: number;
    }[]; suggestions };
    params }>> {
    return this.http.post<any>(environment.apiBaseUrl + environment.api.aiSearch.search,
      params)
      .pipe(
        tap(_ => this.log('ai')),
        catchError(this.handleError('ai', []))
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
