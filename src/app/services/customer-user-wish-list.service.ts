import { Injectable } from '@angular/core';
import { CustomerUserWishlist } from '../model/customer-user-wish-list.model';
import { Subject, Observable, tap, catchError, of, BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../model/api-response.model';
import { HttpClient } from '@angular/common/http';
import { CustomerCoupon } from '../model/customer-coupon.model';
import { Discounts } from '../model/discounts';

@Injectable({
  providedIn: 'root'
})
export class CustomerUserWishlistService {

  constructor(private http: HttpClient) { }

  getAdvanceSearch(params: {
    customerUserId: string;
    keywords: string;
    order?: string;
    pageSize: number;
    pageIndex: number;
  }): Observable<ApiResponse<{ results: CustomerUserWishlist[], total: number }>> {
    return this.http.post<any>(environment.apiBaseUrl + environment.api.customerUserWishlist.getAdvanceSearch,
      {
        customerUserId: params.customerUserId,
        keywords: params.keywords,
        order: params.order,
        pageSize: params.pageSize,
        pageIndex: params.pageIndex
      })
      .pipe(
        tap(_ => this.log('customer-user-wish-list')),
        catchError(this.handleError('customer-user-wish-list', []))
      );
  }

  getByCode(sku: string): Observable<ApiResponse<CustomerUserWishlist>> {
    return this.http.get<any>(environment.apiBaseUrl + environment.api.customerUserWishlist.getByCode + sku)
      .pipe(
        tap(_ => this.log('customer-user-wish-list')),
        catchError(this.handleError('customer-user-wish-list', []))
      );
  }

  getBySKU(customerUserId: string, sku: string): Observable<ApiResponse<CustomerUserWishlist>> {
    return this.http.get<any>(environment.apiBaseUrl + environment.api.customerUserWishlist.getBySKU + customerUserId + "/" + sku)
      .pipe(
        tap(_ => this.log('customer-user-wish-list')),
        catchError(this.handleError('customer-user-wish-list', []))
      );
  }

  create(data: any): Observable<ApiResponse<CustomerUserWishlist>> {
    return this.http.post<any>(environment.apiBaseUrl + environment.api.customerUserWishlist.create, data)
      .pipe(
        tap(_ => this.log('customer-user-wish-list')),
        catchError(this.handleError('customer-user-wish-list', []))
      );
  }

  delete(customerUserWishlistId): Observable<ApiResponse<CustomerUserWishlist>> {
    return this.http.delete<any>(environment.apiBaseUrl + environment.api.customerUserWishlist.delete + customerUserWishlistId)
    .pipe(
      tap(_ => this.log('customer-user-wish-list')),
      catchError(this.handleError('customer-user-wish-list', []))
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
