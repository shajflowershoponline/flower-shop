// system-config.service.ts
import { Injectable } from '@angular/core';
import { SystemConfig } from '../model/system-config';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../model/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class SystemConfigService {
  private readonly STORAGE_KEY = 'app_system_config';
  private configMap = new Map<string, string>();

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<SystemConfig[]>> {
    return this.http.get<any>(environment.apiBaseUrl + environment.api.systemConfig.getAll)
      .pipe(
        tap(_ => this.log('system-config')),
        catchError(this.handleError('system-config', []))
      );
  }

  init(): Promise<void> {
    return new Promise((resolve) => {
      this.getAll().pipe(
        map(res => res.data || []),
        tap(configs => {
          configs.forEach(cfg => this.configMap.set(cfg.key, cfg.value));
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(configs));
        }),
        catchError(_ => {
          const cached = localStorage.getItem(this.STORAGE_KEY);
          if (cached) {
            const parsed: SystemConfig[] = JSON.parse(cached);
            parsed.forEach(cfg => this.configMap.set(cfg.key, cfg.value));
          }
          return of([]);
        })
      ).subscribe(() => resolve());
    });
  }

  get(key: string): string | null {
    return this.configMap.get(key) || null;
  }

  getAllFromCache(): SystemConfig[] {
    return Array.from(this.configMap.entries()).map(([key, value]) => ({ key, value }));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      this.log(`${operation} failed: ${Array.isArray(error.error.message) ? error.error.message[0] : error.error.message}`);
      return of(error.error as T);
    };
  }

  private log(message: string) {
    console.log(`[SystemConfigService]: ${message}`);
  }
}
