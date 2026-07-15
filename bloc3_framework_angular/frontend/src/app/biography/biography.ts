import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService, BandInfo, PortfolioItem, BandInfoResponse, PortfolioResponse } from '../services/content.service';

@Component({
  selector: 'app-biography',
  imports: [CommonModule],
  templateUrl: './biography.html',
  styleUrl: './biography.css',
})
export class Biography implements OnInit {
  private contentService = inject(ContentService);
  
  bandInfo: BandInfo | null = null;
  portfolioItems: PortfolioItem[] = [];
  isLoading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.loadContent();
  }

  loadContent(): void {
    this.isLoading = true;
    this.error = null;

    // Load band info
    this.contentService.getBandInfo().subscribe({
      next: (response: BandInfoResponse) => {
        if (response.success) {
          this.bandInfo = response.data;
        } else {
          this.error = 'Erreur lors du chargement des informations du groupe';
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = 'Erreur de connexion au serveur';
        this.isLoading = false;
        console.error('Error loading band info:', err);
      }
    });

    // Load portfolio items
    this.contentService.getPortfolio(undefined, true).subscribe({
      next: (response: PortfolioResponse) => {
        if (response.success) {
          this.portfolioItems = response.data;
        }
      },
      error: (err: any) => {
        console.error('Error loading portfolio:', err);
      }
    });
  }

  getPortfolioCategory(category: string): string {
    const categoryMap: { [key: string]: string } = {
      'album': 'Album',
      'concert': 'Concert',
      'video': 'Vidéo',
      'studio': 'Studio',
      'festival': 'Festival',
      'acoustic': 'Acoustique'
    };
    return categoryMap[category] || category;
  }
}
