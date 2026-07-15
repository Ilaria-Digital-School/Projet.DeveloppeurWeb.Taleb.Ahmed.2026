import { Component, signal, ElementRef, AfterViewInit, OnDestroy, HostListener, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements AfterViewInit, OnDestroy {
  protected readonly title = signal('Vagues de Riffs');
  isMenuOpen = false;
  
  private authService = inject(AuthService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);
  
  // Newsletter email
  newsletterEmail = '';
  
  // Scroll to top button state
  showScrollTop = false;
  scrollTopButton: HTMLElement | null = null;
  
  // Intersection Observer
  private observer: IntersectionObserver | null = null;

  constructor() {}

  ngAfterViewInit(): void {
    this.initializeIntersectionObserver();
    this.createContactBubble();
    this.createScrollToTopButton();
    console.log('Vagues de Riffs website loaded successfully!');
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.removeContactBubble();
    if (this.scrollTopButton) {
      this.scrollTopButton.remove();
    }
  }

  // Menu hamburger
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        this.router.navigate(['/home']);
      }
    });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
    this.closeMenu();
  }

  // Newsletter form
  onNewsletterSubmit(event: Event, email: string): void {
    event.preventDefault();
    
    if (!this.isValidEmail(email)) {
      alert('Veuillez entrer une adresse email valide.');
      return;
    }
    
    alert('Merci de vous être inscrit à notre newsletter!');
    this.newsletterEmail = '';
  }

  // Contact bubble
  toggleContactBubble(): void {
    const bubble = document.querySelector('.contact-bubble');
    if (!bubble) return;

    const panel = bubble.querySelector('.contact-bubble-panel') as HTMLElement;
    const toggle = bubble.querySelector('.contact-bubble-toggle') as HTMLElement;
    
    if (panel && toggle) {
      const isOpen = !panel.hasAttribute('hidden');

      if (isOpen) {
        panel.setAttribute('hidden', '');
        toggle.setAttribute('aria-expanded', 'false');
        bubble.classList.remove('open');
      } else {
        panel.removeAttribute('hidden');
        toggle.setAttribute('aria-expanded', 'true');
        bubble.classList.add('open');
      }
    }
  }

  private createContactBubble(): void {
    if (document.querySelector('.contact-bubble')) {
      return;
    }

    const bubble = document.createElement('div');
    bubble.className = 'contact-bubble';
    bubble.innerHTML = `
      <button type="button" class="contact-bubble-toggle" aria-expanded="false" aria-controls="contactBubblePanel">
        <span class="contact-bubble-icon">?</span>
        <span class="contact-bubble-label">Contact</span>
      </button>
      <div class="contact-bubble-panel" id="contactBubblePanel" hidden>
        <p class="contact-bubble-title">Une question ?</p>
        <p class="contact-bubble-text">On peut vous repondre par mail ou via le formulaire du site.</p>
        <a class="contact-bubble-link primary" href="/contact">Ouvrir le formulaire</a>
        <a class="contact-bubble-link" href="mailto:contact@vaguesderiffs.fr">contact@vaguesderiffs.fr</a>
        <a class="contact-bubble-link" href="tel:+33123456789">+33 1 23 45 67 89</a>
      </div>
    `;

    document.body.appendChild(bubble);

    const toggle = bubble.querySelector('.contact-bubble-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => this.toggleContactBubble());
    }

    document.addEventListener('click', (event) => {
      if (!bubble.contains(event.target as Node)) {
        const panel = bubble.querySelector('.contact-bubble-panel') as HTMLElement;
        const toggleBtn = bubble.querySelector('.contact-bubble-toggle') as HTMLElement;
        if (panel && toggleBtn) {
          panel.setAttribute('hidden', '');
          toggleBtn.setAttribute('aria-expanded', 'false');
          bubble.classList.remove('open');
        }
      }
    });
  }

  private removeContactBubble(): void {
    const bubble = document.querySelector('.contact-bubble');
    if (bubble) {
      bubble.remove();
    }
  }

  // Scroll to top
  @HostListener('window:scroll')
  onScroll(): void {
    this.showScrollTop = window.pageYOffset > 300;
    
    if (this.showScrollTop && this.scrollTopButton) {
      this.scrollTopButton.style.display = 'block';
    } else if (!this.showScrollTop && this.scrollTopButton) {
      this.scrollTopButton.style.display = 'none';
    }
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  private createScrollToTopButton(): void {
    if (document.querySelector('.scroll-to-top')) {
      return;
    }

    const button = document.createElement('button');
    button.className = 'scroll-to-top';
    button.innerHTML = '↑';
    button.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 50px;
      height: 50px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 50%;
      font-size: 20px;
      cursor: pointer;
      display: none;
      z-index: 999;
      transition: all 0.3s;
    `;
    
    button.addEventListener('click', () => this.scrollToTop());
    document.body.appendChild(button);
    this.scrollTopButton = button;
  }

  // Intersection Observer for scroll animations
  private initializeIntersectionObserver(): void {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          target.style.opacity = '1';
          target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    const sections = this.elementRef.nativeElement.querySelectorAll('section');
    sections.forEach((section: HTMLElement) => {
      section.style.opacity = '0';
      section.style.transform = 'translateY(30px)';
      section.style.transition = 'opacity 0.6s, transform 0.6s';
      this.observer?.observe(section);
    });
  }

  // Utility functions
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Smooth scroll for anchor links
  onAnchorClick(event: Event, targetId: string): void {
    event.preventDefault();
    const target = this.elementRef.nativeElement.querySelector(targetId);
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
}