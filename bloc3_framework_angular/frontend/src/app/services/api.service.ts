import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { API_CONFIG } from './api.config';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }

  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    return throwError(() => error);
  }

  get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(`${API_CONFIG.baseURL}${endpoint}`, {
      headers: this.getHeaders(),
      params,
      timeout: API_CONFIG.timeout
    }).pipe(
      timeout(API_CONFIG.timeout),
      catchError(this.handleError)
    );
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${API_CONFIG.baseURL}${endpoint}`, body, {
      headers: this.getHeaders(),
      timeout: API_CONFIG.timeout
    }).pipe(
      timeout(API_CONFIG.timeout),
      catchError(this.handleError)
    );
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${API_CONFIG.baseURL}${endpoint}`, body, {
      headers: this.getHeaders(),
      timeout: API_CONFIG.timeout
    }).pipe(
      timeout(API_CONFIG.timeout),
      catchError(this.handleError)
    );
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${API_CONFIG.baseURL}${endpoint}`, {
      headers: this.getHeaders(),
      timeout: API_CONFIG.timeout
    }).pipe(
      timeout(API_CONFIG.timeout),
      catchError(this.handleError)
    );
  }
}