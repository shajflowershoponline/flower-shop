import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IServices } from './interface/iservices';
import { ApiResponse } from '../model/api-response.model';
import { Collection } from '../model/collection';

@Injectable({
  providedIn: 'root'
})
export class ProductCollectionService implements IServices {

  constructor(private http: HttpClient) { }

  getAdvanceSearch(params:{
    order: any,
    columnDef: { apiNotation: string; filter: string }[],
    pageSize: number,
    pageIndex: number
  }): Observable<ApiResponse<{ results: Collection[], total: number}>> {
    return this.http.post<any>(environment.apiBaseUrl + environment.api.collection.getAdvanceSearch,
      params)
    .pipe(
      tap(_ => this.log('collection')),
      catchError(this.handleError('collection', []))
    );
  }

  getByCode(sku: string): Observable<ApiResponse<Collection>> {
    return this.http.get<any>(environment.apiBaseUrl + environment.api.collection.getByCode + sku)
    .pipe(
      tap(_ => this.log('collection')),
      catchError(this.handleError('collection', []))
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
