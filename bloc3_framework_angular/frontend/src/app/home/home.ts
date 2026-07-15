import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  // Portfolio state
  portfolioItems: any[] = [
    { title: 'Premier Album', description: 'Production/Enregistrement/Mixage', image: '/images/Album1.jpg' },
    { title: 'Tournée 2023', description: 'Live/Production/Scénographie', image: '/images/Concert1.jpg' },
    { title: 'Clip Vidéo', description: 'Réalisation/Montage/Post-production', image: '/images/Clip1.jpg' },
    { title: 'Session Studio', description: 'Enregistrement/Mixage/Mastering', image: '/images/Studio1.jpg' },
    { title: 'Festival Rock', description: 'Performance/Production/Événementiel', image: '/images/Festival.jpg' },
    { title: 'Session Acoustique', description: 'Enregistrement/Live/Production', image: '/images/Acoustic.jpg' }
  ];
  itemsLoaded = 6;
  totalItems = 12;

  loadMorePortfolioItems(): void {
    const titles = ['Nouvel Album', 'Session Studio', 'Festival Été', 'Clip Vidéo', 'Interview Radio', 'Photoshoot'];
    const descriptions = ['Production/Enregistrement', 'Live/Performance', 'Création/Art', 'Promotion/Media'];
    
    for (let i = 0; i < 3 && this.itemsLoaded < this.totalItems; i++) {
      const titleIndex = this.itemsLoaded % titles.length;
      const descIndex = this.itemsLoaded % descriptions.length;
      
      this.portfolioItems.push({
        title: titles[titleIndex],
        description: descriptions[descIndex],
        image: ''
      });
      
      this.itemsLoaded++;
    }
  }
}
