import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  loginForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  globalMessage: { type: 'success' | 'error'; text: string } | null = null;

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [false]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.loginForm.get(fieldName);
    if (!control) return false;
    return control.invalid && (control.touched || control.dirty);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.globalMessage = { type: 'error', text: 'Veuillez corriger les erreurs dans le formulaire' };
      return;
    }

    this.isLoading = true;
    this.globalMessage = null;

    const credentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
      remember: this.loginForm.value.remember
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        if (response.success) {
          this.globalMessage = { type: 'success', text: 'Connexion réussie' };
          this.isLoading = false;
          // Rediriger vers le dashboard utilisateur
          setTimeout(() => {
            this.router.navigate(['/user-dashboard']);
          }, 500);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.globalMessage = { 
          type: 'error', 
          text: error.error?.message || 'Erreur lors de la connexion. Vérifiez vos identifiants.' 
        };
      }
    });
  }
}
