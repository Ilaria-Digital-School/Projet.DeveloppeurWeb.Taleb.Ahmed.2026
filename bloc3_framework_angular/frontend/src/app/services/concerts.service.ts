import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from './api.config';

export interface Venue {
  name: string;
  address: string;
  city: string;
  capacity?: number;
}

export interface Price {
  min: number;
  max?: number;
  currency: string;
}

export interface Concert {
  id: string;
  title: string;
  venue: Venue;
  date: string;
  time: string;
  price?: Price;
  description?: string;
  status: 'upcoming' | 'cancelled' | 'completed';
  ticketUrl?: string;
  infoUrl?: string;
  image?: string;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConcertListResponse {
  success: boolean;
  data: Concert[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ConcertResponse {
  success: boolean;
  data: Concert;
}

export interface ConcertFilters {
  page?: number;
  limit?: number;
  status?: string;
  city?: string;
  upcoming?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConcertsService {
  constructor(private apiService: ApiService) {}

  getConcerts(filters?: ConcertFilters): Observable<ConcertListResponse> {
    const params: any = {};
    
    if (filters) {
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;
      if (filters.status) params.status = filters.status;
      if (filters.city) params.city = filters.city;
      if (filters.upcoming !== undefined) params.upcoming = filters.upcoming;
    }

    return this.apiService.get<ConcertListResponse>(API_ENDPOINTS.concerts.list);
  }

  getFeaturedConcerts(): Observable<{ success: boolean; data: Concert[] }> {
    return this.apiService.get<{ success: boolean; data: Concert[] }>(API_ENDPOINTS.concerts.featured);
  }

  getConcertById(id: string): Observable<ConcertResponse> {
    return this.apiService.get<ConcertResponse>(API_ENDPOINTS.concerts.details(id));
  }

  getCities(): Observable<{ success: boolean; data: string[] }> {
    return this.apiService.get<{ success: boolean; data: string[] }>(API_ENDPOINTS.concerts.cities);
  }
}