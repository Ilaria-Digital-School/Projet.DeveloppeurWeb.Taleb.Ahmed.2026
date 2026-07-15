import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  registerForm!: FormGroup;
  isLoading = false;
  showPassword: { password: boolean; confirmPassword: boolean } = { password: false, confirmPassword: false };
  globalMessage: { type: 'success' | 'error'; text: string } | null = null;

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      birthDate: ['', [Validators.required]],
      terms: [false, [Validators.requiredTrue]],
      newsletter: [false]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.registerForm.get(fieldName);
    if (!control) return false;
    return control.invalid && (control.touched || control.dirty);
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    this.showPassword[field] = !this.showPassword[field];
  }

  getPasswordStrengthClass(): string {
    const password = this.registerForm.get('password')?.value || '';
    if (password.length < 4) return '';
    if (password.length < 8) return 'weak';
    if (password.length < 12) return 'medium';
    return 'strong';
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.globalMessage = { type: 'error', text: 'Veuillez corriger les erreurs dans le formulaire' };
      return;
    }

    this.isLoading = true;
    this.globalMessage = null;

    // Temporairement désactivé pour tester
    setTimeout(() => {
      this.globalMessage = { type: 'success', text: 'Mode test - Inscription simulée' };
      this.isLoading = false;
    }, 1000);
  }
}
