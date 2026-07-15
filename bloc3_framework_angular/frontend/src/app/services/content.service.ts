import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from './api.config';

export interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  image: string;
  category: 'album' | 'concert' | 'video' | 'studio' | 'festival' | 'acoustic';
  featured: boolean;
}

export interface BandMember {
  name: string;
  role: string;
  bio: string;
}

export interface DiscographyItem {
  title: string;
  year: string;
  type: 'EP' | 'Album' | 'Single';
  tracks: string[];
}

export interface BandInfo {
  name: string;
  description: string;
  members: BandMember[];
  discography: DiscographyItem[];
}

export interface PortfolioResponse {
  success: boolean;
  data: PortfolioItem[];
}

export interface PortfolioItemResponse {
  success: boolean;
  data: PortfolioItem;
}

export interface BandInfoResponse {
  success: boolean;
  data: BandInfo;
}

export interface BandMembersResponse {
  success: boolean;
  data: BandMember[];
}

export interface DiscographyResponse {
  success: boolean;
  data: DiscographyItem[];
}

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  constructor(private apiService: ApiService) {}

  getPortfolio(category?: string, featured?: boolean): Observable<PortfolioResponse> {
    const params: any = {};
    if (category) params.category = category;
    if (featured !== undefined) params.featured = featured.toString();

    return this.apiService.get<PortfolioResponse>(API_ENDPOINTS.content.portfolio);
  }

  getPortfolioItem(id: string): Observable<PortfolioItemResponse> {
    return this.apiService.get<PortfolioItemResponse>(API_ENDPOINTS.content.portfolioItem(id));
  }

  getBandInfo(): Observable<BandInfoResponse> {
    return this.apiService.get<BandInfoResponse>(API_ENDPOINTS.content.band);
  }

  getBandMembers(): Observable<BandMembersResponse> {
    return this.apiService.get<BandMembersResponse>(API_ENDPOINTS.content.members);
  }

  getDiscography(): Observable<DiscographyResponse> {
    return this.apiService.get<DiscographyResponse>(API_ENDPOINTS.content.discography);
  }
}