import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IServices } from './interface/iservices';
import { ApiResponse } from '../model/api-response.model';
import { Discounts } from '../model/discounts';

@Injectable({
  providedIn: 'root'
})
export class DiscountsService implements IServices {

  constructor(private http: HttpClient) { }

  getAdvanceSearch(params:{
    keywords: string;
    order: string;
    pageSize: number;
    pageIndex: number;
  }): Observable<ApiResponse<{ results: Discounts[], total: number}>> {
    return this.http.post<any>(environment.apiBaseUrl + environment.api.discounts.getAdvanceSearch,
      {
        keywords: params.keywords,
        order: params.order,
        pageSize: params.pageSize,
        pageIndex: params.pageIndex
      })
    .pipe(
      tap(_ => this.log('discounts')),
      catchError(this.handleError('discounts', []))
    );
  }

  getByCode(sku: string): Observable<ApiResponse<Discounts>> {
    return this.http.get<any>(environment.apiBaseUrl + environment.api.discounts.getByCode + sku)
    .pipe(
      tap(_ => this.log('discounts')),
      catchError(this.handleError('discounts', []))
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
