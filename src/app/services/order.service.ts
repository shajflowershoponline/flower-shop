import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../model/api-response.model';
import { CustomerCoupon } from '../model/customer-coupon.model';
import { Order } from '../model/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  // Holds the current order count with initial value 0
  private orderCountSubject = new BehaviorSubject<number>(0);
  // Observable to expose to components
  orderCount$: Observable<number> = this.orderCountSubject.asObservable();

  constructor(private http: HttpClient) { }

  getAdvanceSearch(params: {
    customerUserId: string;
    keywords: string;
    pageSize: number;
    pageIndex: number;
  }): Observable<ApiResponse<{ results: Order[], total: number }>> {
    return this.http.post<any>(
      environment.apiBaseUrl + environment.api.order.getAdvanceSearch,
      {
        customerUserId: params.customerUserId,
        keywords: params.keywords,
        pageSize: params.pageSize,
        pageIndex: params.pageIndex
      }
    ).pipe(
      tap(_ => this.log('order')),
      catchError(this.handleError<ApiResponse<{ results: Order[], total: number }>>('order'))
    );
  }

  getByCode(sku: string): Observable<ApiResponse<Order>> {
    return this.http.get<any>(environment.apiBaseUrl + environment.api.order.getByCode + sku)
    .pipe(
      tap(_ => this.log('order')),
      catchError(this.handleError('order', []))
    );
  }

  create(data: any): Observable<ApiResponse<Order>> {
    return this.http.post<any>(environment.apiBaseUrl + environment.api.order.create, data)
    .pipe(
      tap(_ => this.log('order')),
      catchError(this.handleError('order', []))
    );
  }

  updateStatus(orderCode, data: any): Observable<ApiResponse<Order>> {
    return this.http.put<any>(environment.apiBaseUrl + environment.api.order.updateStatus + orderCode, data)
    .pipe(
      tap(_ => this.log('order')),
      catchError(this.handleError('order', []))
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
