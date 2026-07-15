import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from './api.config';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  constructor(private apiService: ApiService) {}

  sendContactForm(formData: ContactFormData): Observable<ContactResponse> {
    return this.apiService.post<ContactResponse>(API_ENDPOINTS.contact.send, formData);
  }
}