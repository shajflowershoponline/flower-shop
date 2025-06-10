import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../model/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {

  constructor(private http: HttpClient) { }

  calculate(params: {
    pickupCoords: {
      lat: number;
      lng: number;
    };
    dropoffCoords: {
      lat: number;
      lng: number;
    };
  }): Observable<ApiResponse<{
    distanceInKm: number,
    deliveryFee: number
  }>> {
    return this.http.post<any>(environment.apiBaseUrl + environment.api.delivery.calculate, params)
      .pipe(
        tap(_ => this.log('cart')),
        catchError(this.handleError('cart', []))
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

