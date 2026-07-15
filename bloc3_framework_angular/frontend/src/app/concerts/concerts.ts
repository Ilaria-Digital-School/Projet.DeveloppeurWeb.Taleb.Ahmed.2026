import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConcertsService, Concert, ConcertListResponse } from '../services/concerts.service';

@Component({
  selector: 'app-concerts',
  imports: [CommonModule],
  templateUrl: './concerts.html',
  styleUrl: './concerts.css',
})
export class Concerts implements OnInit {
  private concertsService = inject(ConcertsService);
  
  concerts: Concert[] = [];
  featuredConcerts: Concert[] = [];
  isLoading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.loadConcerts();
  }

  loadConcerts(): void {
    this.isLoading = true;
    this.error = null;

    // Load both regular and featured concerts
    this.concertsService.getConcerts({ upcoming: true }).subscribe({
      next: (response: ConcertListResponse) => {
        if (response.success) {
          this.concerts = response.data;
        } else {
          this.error = 'Erreur lors du chargement des concerts';
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = 'Erreur de connexion au serveur';
        this.isLoading = false;
        console.error('Error loading concerts:', err);
      }
    });

    this.concertsService.getFeaturedConcerts().subscribe({
      next: (response: { success: boolean; data: Concert[] }) => {
        if (response.success) {
          this.featuredConcerts = response.data;
        }
      },
      error: (err: any) => {
        console.error('Error loading featured concerts:', err);
      }
    });
  }

  onTicketClick(concert: Concert): void {
    if (concert.ticketUrl) {
      window.open(concert.ticketUrl, '_blank');
    } else {
      alert(`Billets pour "${concert.title}" - Contactez-nous pour les réservations`);
    }
  }

  onInfoClick(concert: Concert): void {
    if (concert.infoUrl) {
      window.open(concert.infoUrl, '_blank');
    } else {
      alert(`Plus d'informations pour "${concert.title}" - Page de détails...`);
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  formatPrice(price: any): string {
    if (!price) return 'Gratuit';
    if (price.min && price.max) {
      return `${price.min}€ - ${price.max}€`;
    }
    if (price.min) {
      return `${price.min}€`;
    }
    return 'Gratuit';
  }
}
