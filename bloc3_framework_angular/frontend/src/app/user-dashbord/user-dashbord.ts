import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../services/auth.service';

@Component({
  selector: 'app-user-dashbord',
  imports: [CommonModule],
  templateUrl: './user-dashbord.html',
  styleUrl: './user-dashbord.css',
})
export class UserDashbord implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);

  memberSince = '--';
  newsletterStatus = '--';
  accountStatus = '--';
  userInitials = '--';
  fullName = '--';
  email = '--';
  role = '--';
  userId = '--';
  username = '--';
  lastLoginDay = '--';
  lastLoginMonth = '---';
  lastLoginText = 'Chargement...';
  accountSummary: string[] = [];
  playlist = [
    'Onde Noire',
    'Feu sur l\'Horizon',
    'Nuits Saturées',
    'Dernier Echo'
  ];

  ngOnInit(): void {
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadUserData();
  }

  loadUserData(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        if (user) {
          this.populateUserData(user);
        }
      },
      error: (error) => {
        console.error('Error loading user data:', error);
        this.lastLoginText = 'Erreur de chargement';
      }
    });
  }

  private populateUserData(user: User): void {
    this.userId = user.id;
    this.username = user.username;
    this.email = user.email;
    this.fullName = `${user.firstName} ${user.lastName}`;
    this.role = user.role || 'Utilisateur';
    this.userInitials = this.getInitials(user.firstName, user.lastName);
    
    // Format dates
    if (user.createdAt) {
      const createdDate = new Date(user.createdAt);
      this.memberSince = createdDate.getFullYear().toString();
    }
    
    if (user.lastLogin) {
      const lastLogin = new Date(user.lastLogin);
      this.lastLoginDay = lastLogin.getDate().toString();
      this.lastLoginMonth = lastLogin.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase();
      this.lastLoginText = lastLogin.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      this.lastLoginText = 'Première connexion';
    }
    
    // Status
    this.newsletterStatus = user.newsletter ? 'Oui' : 'Non';
    this.accountStatus = user.isActive ? 'Actif' : 'Inactif';
    
    // Account summary
    this.accountSummary = [
      `Compte créé en ${this.memberSince}`,
      `Newsletter ${this.newsletterStatus.toLowerCase()}`,
      'Aucune réservation en cours',
      'Profil complet à 100%'
    ];
  }

  private getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        this.router.navigate(['/login']);
      }
    });
  }
}
