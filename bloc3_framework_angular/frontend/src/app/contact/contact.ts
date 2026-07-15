import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ContactService, ContactResponse } from '../services/contact.service';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact implements OnInit {
  private fb = inject(FormBuilder);
  private contactService = inject(ContactService);
  private route = inject(ActivatedRoute);

  contactForm!: FormGroup;
  isLoading = false;
  globalMessage: { type: 'success' | 'error'; text: string } | null = null;

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(3)]],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });

    this.showSuccessFromQuery();
  }

  private showSuccessFromQuery(): void {
    this.route.queryParams.subscribe(params => {
      if (params['sent'] === '1') {
        this.triggerGlobalMessage('success', 'Message envoyé avec succès !');
        const url = new URL(window.location.href);
        url.searchParams.delete('sent');
        window.history.replaceState({}, '', url.pathname + url.search);
      }
    });
  }

  private triggerGlobalMessage(type: 'success' | 'error', text: string): void {
    this.globalMessage = { type, text };
    setTimeout(() => {
      this.globalMessage = null;
    }, 5000);
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.contactForm.get(fieldName);
    if (!control) return false;
    return control.invalid && (control.touched || control.dirty);
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      this.triggerGlobalMessage('error', 'Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    this.isLoading = true;
    this.globalMessage = null;

    const formData = this.contactForm.value;

    this.contactService.sendContactForm(formData).subscribe({
      next: (result: ContactResponse) => {
        if (result.success) {
          this.triggerGlobalMessage('success', result.message || 'Message envoyé avec succès !');
          this.contactForm.reset();
        } else {
          this.triggerGlobalMessage('error', result.message || 'Une erreur est survenue lors de l\'envoi');
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors de l\'envoi du message:', error);
        this.triggerGlobalMessage('error', 'Une erreur est survenue. Veuillez vérifier votre connexion.');
        this.isLoading = false;
      }
    });
  }
}