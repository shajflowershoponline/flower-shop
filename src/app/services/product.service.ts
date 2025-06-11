import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of, BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IServices } from './interface/iservices';
import { ApiResponse } from '../model/api-response.model';
import { Product } from '../model/product';
import { Category } from '../model/category';
import { Collection } from '../model/collection';
import { CustomerUserWishlist } from '../model/customer-user-wish-list.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService implements IServices {

  private searchSubject = new BehaviorSubject<string | null>(null);
  search$ = this.searchSubject.asObservable();

  private pageIndexSubject = new BehaviorSubject<number | null>(null);
  pageIndex$ = this.pageIndexSubject.asObservable();

  private filterCategorySubject = new BehaviorSubject<string | null>(null);
  filterCategory$ = this.filterCategorySubject.asObservable();

  private filterCollectionSubject = new BehaviorSubject<string | null>(null);
  filterCollection$ = this.filterCollectionSubject.asObservable();

  private filterColorSubject = new BehaviorSubject<string | null>(null);
  filterColor$ = this.filterColorSubject.asObservable();

  private filterPriceSubject = new BehaviorSubject<string | null>(null);
  filterPrice$ = this.filterPriceSubject.asObservable();

  private searchResultsSubject = new BehaviorSubject<any[] | null>(null);
  searchResults$ = this.searchResultsSubject.asObservable();

  constructor(private http: HttpClient) { }

  setSearch(search: string) {
    this.searchSubject.next(search);
  }

  setPageIndex(pageIndex: number) {
    this.pageIndexSubject.next(pageIndex);
  }

  setFilterCategory(filterCategory: string) {
    this.filterCategorySubject.next(filterCategory);
  }

  setFilterCollection(filterCollection: string) {
    this.filterCollectionSubject.next(filterCollection);
  }

  setFilterColor(filterColor: string) {
    this.filterColorSubject.next(filterColor);
  }

  setFilterPrice(filterPrice: string) {
    this.filterPriceSubject.next(filterPrice);
  }

  setSearchResults(searchResults: any[]) {
    this.searchResultsSubject.next(searchResults);
  }

  getClientPagination(params:{
    customerUserId?: any,
    keyword?: any,
    order?: any,
    columnDef?: { apiNotation: string; filter?: string }[],
    pageSize?: number,
    pageIndex?: number
  }): Observable<ApiResponse<{ results: Product[]; categories: Category[]; total: number}>> {
    return this.http.post<any>(environment.apiBaseUrl + environment.api.product.getClientPagination,
      params)
    .pipe(
      tap(_ => this.log('product')),
      catchError(this.handleError('product', []))
    );
  }

  getSearchFilter(params:{
    keyword?: any,
    columnDef?: { apiNotation: string; filter?: string }[],
  }): Observable<ApiResponse<{
      categories: Category[];
      collections: Collection[];
      colors: { name: string; count: number}[];
    }>> {
    return this.http.post<any>(environment.apiBaseUrl + environment.api.product.getSearchFilter,
      params)
    .pipe(
      tap(_ => this.log('product')),
      catchError(this.handleError('product', []))
    );
  }

  getByCode(sku: string): Observable<ApiResponse<Product>> {
    return this.http.get<any>(environment.apiBaseUrl + environment.api.product.getByCode + sku)
    .pipe(
      tap(_ => this.log('product')),
      catchError(this.handleError('product', []))
    );
  }

  getAllFeaturedProducts(customerUserId): Observable<ApiResponse<Product[]>> {
    return this.http.get<any>(environment.apiBaseUrl + environment.api.product.getAllFeaturedProducts + customerUserId)
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
