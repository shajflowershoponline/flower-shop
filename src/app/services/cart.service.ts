import { Injectable } from '@angular/core';
import { CartItems } from '../model/cart.model';
import { Subject, Observable, tap, catchError, of, BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../model/api-response.model';
import { HttpClient } from '@angular/common/http';
import { CustomerCoupon } from '../model/customer-coupon.model';
import { Discounts } from '../model/discounts';
import { Collection } from '../model/collection';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  // Holds the current cart count with initial value 0
  private cartCountSubject = new BehaviorSubject<number>(0);
  // Observable to expose to components
  cartCount$: Observable<number> = this.cartCountSubject.asObservable();

  constructor(private http: HttpClient) { }

  async ngOnDestroy() {
    this.ngUnsubscribe.next();
    // This completes the subject properlly.
    this.ngUnsubscribe.complete();
  }

  // Call this to update cart count
  setCartCount(count: number): void {
    this.cartCountSubject.next(count);
  }

  getItems(customerUserId: string): Observable<ApiResponse<{
    results: CartItems[];
    activeCoupon: CustomerCoupon;
    collections: Collection[];
  }>> {
    return this.http.get<any>(environment.apiBaseUrl + environment.api.cart.getItems + customerUserId)
      .pipe(
        tap(_ => this.log('cart')),
        catchError(this.handleError('cart', []))
      );
  }

  getActiveCoupon(customerUserId: string): Observable<ApiResponse<CustomerCoupon>> {
    return this.http.get<any>(environment.apiBaseUrl + environment.api.cart.getActiveCoupon + customerUserId)
      .pipe(
        tap(_ => this.log('cart')),
        catchError(this.handleError('cart', []))
      );
  }

  create(data: any): Observable<ApiResponse<CartItems>> {
    return this.http.post<any>(environment.apiBaseUrl + environment.api.cart.create, data)
      .pipe(
        tap(_ => this.log('cart')),
        catchError(this.handleError('cart', []))
      );
  }

  update(data: any): Observable<ApiResponse<CartItems>> {
    return this.http.put<any>(environment.apiBaseUrl + environment.api.cart.update, data)
      .pipe(
        tap(_ => this.log('users')),
        catchError(this.handleError('users', []))
      );
  }

  manageCoupon(data: any): Observable<ApiResponse<CustomerCoupon>> {
    return this.http.post<any>(environment.apiBaseUrl + environment.api.cart.manageCoupon, data)
      .pipe(
        tap(_ => this.log('customer-coupon')),
        catchError(this.handleError('customer-coupon', []))
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
