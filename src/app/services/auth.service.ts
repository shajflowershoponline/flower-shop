import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

import { catchError, takeUntil, tap } from 'rxjs/operators';
import { IServices } from './interface/iservices';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { ApiResponse } from '../model/api-response.model';
import { CustomerUser } from '../model/customer-user';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements IServices {

  isLoggedIn = false;
  redirectUrl: string;
  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private http: HttpClient,
    private router: Router,
    private storageService: StorageService) { }

  async ngOnDestroy() {
    this.ngUnsubscribe.next();
    // This completes the subject properlly.
    this.ngUnsubscribe.complete();
  }

  login(data: any) : Observable<ApiResponse<CustomerUser>> {
    return this.http.post<any>(environment.apiBaseUrl + environment.api.auth.login, data)
    .pipe(
      tap(_ => this.isLoggedIn = true),
      catchError(this.handleError('login', []))
    );
  }

  registerCustomer(data: any): Observable<ApiResponse<CustomerUser>> {
    return this.http.post<any>(environment.apiBaseUrl + environment.api.auth.registerCustomer, data)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        tap(_ => this.log('register')),
        catchError(this.handleError('register', []))
      );
  }

  registerVerify(data: any): Observable<ApiResponse<CustomerUser>> {
    return this.http.post<any>(environment.apiBaseUrl + environment.api.auth.registerVerify, data)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        tap(_ => this.isLoggedIn = true),
        catchError(this.handleError('login', []))
      );
  }

  resetSubmit(data: any): Observable<ApiResponse<boolean>> {
    return this.http.post<any>(environment.apiBaseUrl + environment.api.auth.resetSubmit, data)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        tap(_ => this.isLoggedIn = true),
        catchError(this.handleError('login', []))
      );
  }

  resetVerify(data: any): Observable<ApiResponse<boolean>> {
    return this.http.post<any>(environment.apiBaseUrl + environment.api.auth.resetVerify, data)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        tap(_ => this.isLoggedIn = true),
        catchError(this.handleError('login', []))
      );
  }

  resetPassword(data: any): Observable<ApiResponse<CustomerUser>> {
    return this.http.post<any>(environment.apiBaseUrl + environment.api.auth.resetPassword, data)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        tap(_ => this.isLoggedIn = true),
        catchError(this.handleError('login', []))
      );
  }

  redirectToPage(auth: boolean) {
    this.router.navigate([auth ? '/login' : ''], { replaceUrl: true });
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
