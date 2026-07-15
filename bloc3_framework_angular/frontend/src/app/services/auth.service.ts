import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from './api.config';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role?: string;
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
  newsletter?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  birthDate: string;
  terms: boolean;
  newsletter?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } catch (error) {
        this.clearAuthData();
      }
    }
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>(API_ENDPOINTS.auth.login, credentials).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setAuthData(response.data.user, response.data.token);
        }
      })
    );
  }

  register(credentials: RegisterCredentials): Observable<AuthResponse> {
    const registerData = {
      firstName: credentials.firstName,
      lastName: credentials.lastName,
      email: credentials.email,
      username: credentials.username,
      password: credentials.password,
      birthDate: credentials.birthDate,
      terms: credentials.terms.toString(),
      newsletter: credentials.newsletter
    };

    return this.apiService.post<AuthResponse>(API_ENDPOINTS.auth.register, registerData).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setAuthData(response.data.user, response.data.token);
        }
      })
    );
  }

  logout(): Observable<any> {
    return this.apiService.post(API_ENDPOINTS.auth.logout, {}).pipe(
      tap(() => {
        this.clearAuthData();
      })
    );
  }

  getCurrentUser(): Observable<User | null> {
    if (this.isAuthenticatedSubject.value) {
      return this.currentUser$;
    }
    
    return this.apiService.get<any>(API_ENDPOINTS.auth.me).pipe(
      map(response => {
        if (response.success && response.data) {
          this.setAuthData(response.data, localStorage.getItem('token') || '');
          return response.data;
        }
        return null;
      })
    );
  }

  private setAuthData(user: User, token: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('userData', JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}