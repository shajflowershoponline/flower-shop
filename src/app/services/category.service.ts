import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IServices } from './interface/iservices';
import { ApiResponse } from '../model/api-response.model';
import { Category } from '../model/category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService implements IServices {

  constructor(private http: HttpClient) { }

  getAdvanceSearch(params:{
    keywords: string;
    order?: string;
    pageSize: number;
    pageIndex: number;
  }): Observable<ApiResponse<{ results: Category[], total: number}>> {
    return this.http.post<any>(environment.apiBaseUrl + environment.api.category.getAdvanceSearch,
      {
        keywords: params.keywords,
        order: params.order,
        pageSize: params.pageSize,
        pageIndex: params.pageIndex
      })
    .pipe(
      tap(_ => this.log('category')),
      catchError(this.handleError('category', []))
    );
  }

  getByCode(sku: string): Observable<ApiResponse<Category>> {
    return this.http.get<any>(environment.apiBaseUrl + environment.api.category.getByCode + sku)
    .pipe(
      tap(_ => this.log('category')),
      catchError(this.handleError('category', []))
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
