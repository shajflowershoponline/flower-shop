import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of, takeUntil, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../model/api-response.model';
import { IServices } from './interface/iservices';
import { CustomerUser } from '../model/customer-user';

@Injectable({
  providedIn: 'root'
})
export class CustomerUserService implements IServices {
  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(private http: HttpClient,) { }


  async ngOnDestroy() {
    this.ngUnsubscribe.next();
    // This completes the subject properlly.
    this.ngUnsubscribe.complete();
  }

  getByCode(userCode: string): Observable<ApiResponse<CustomerUser>> {
    return this.http.get<any>(environment.apiBaseUrl + environment.api.users.getByCode + userCode + "/details")
    .pipe(
      tap(_ => this.log('user')),
      catchError(this.handleError('user', []))
    );
  }

  updateProfile(userCode: string, data: any): Observable<ApiResponse<CustomerUser>> {
    return this.http.put<any>(environment.apiBaseUrl + environment.api.users.updateProfile + userCode, data)
    .pipe(
      tap(_ => this.log('users')),
      catchError(this.handleError('users', []))
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
