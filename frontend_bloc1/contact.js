class ContactForm {
    constructor() {
        this.form = document.querySelector('.contact-form');
        this.apiBaseUrl = this.resolveApiBaseUrl('/api');
        this.init();
    }

    // Adapte automatiquement l'URL de l'API selon l'environnement d'exécution.
    resolveApiBaseUrl(basePath) {
        const { protocol, hostname, port } = window.location;
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
        const isFileProtocol = protocol === 'file:';

        if (isFileProtocol) {
            return `http://localhost:3000${basePath}`;
        }

        if (isLocalhost && port && port !== '3000') {
            return `${protocol}//${hostname}:3000${basePath}`;
        }

        return basePath;
    }

    init() {
        if (this.form) {
            this.form.addEventListener('submit', (event) => this.handleSubmit(event));
            this.addRealTimeValidation();
            this.showSuccessFromQuery();
        }
    }

    showSuccessFromQuery() {
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get('sent') === '1') {
            this.showMessage('success', 'Message envoyÃ© avec succÃ¨s!');
            searchParams.delete('sent');
            const nextQuery = searchParams.toString();
            const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}`;
            window.history.replaceState({}, '', nextUrl);
        }
    }

    addRealTimeValidation() {
        const inputs = this.form.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
            // Valide au blur, puis revalide pendant la saisie seulement si le champ est déjà en erreur.
            input.addEventListener('blur', () => {
                this.validateField(input);
            });

            input.addEventListener('input', () => {
                if (input.classList.contains('invalid')) {
                    this.validateField(input);
                }
            });
        });
    }

    validateField(field) {
        const fieldName = field.name;
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Nettoie l'état précédent avant de recalculer la validité du champ.
        this.clearFieldError(field);

        switch (fieldName) {
            case 'name':
                if (!value) {
                    errorMessage = 'Le nom est requis';
                    isValid = false;
                } else if (value.length < 2) {
                    errorMessage = 'Le nom doit contenir au moins 2 caractères';
                    isValid = false;
                }
                break;

            case 'email':
                if (!value) {
                    errorMessage = 'L\'email est requis';
                    isValid = false;
                } else if (!this.validateEmail(value)) {
                    errorMessage = 'Veuillez entrer un email valide';
                    isValid = false;
                }
                break;

            case 'subject':
                if (!value) {
                    errorMessage = 'Le sujet est requis';
                    isValid = false;
                } else if (value.length < 3) {
                    errorMessage = 'Le sujet doit contenir au moins 3 caractères';
                    isValid = false;
                }
                break;

            case 'message':
                if (!value) {
                    errorMessage = 'Le message est requis';
                    isValid = false;
                } else if (value.length < 10) {
                    errorMessage = 'Le message doit contenir au moins 10 caractères';
                    isValid = false;
                }
                break;
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        } else {
            field.classList.add('valid');
        }

        return isValid;
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showFieldError(field, message) {
        field.classList.add('invalid');
        field.classList.remove('valid');

        // Garantit qu'un seul message d'erreur reste affiché sous le champ.
        this.clearFieldError(field);

        // Ajoute le message juste sous le champ concerné.
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.classList.remove('invalid');
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    clearAllErrors() {
        const fields = this.form.querySelectorAll('input, textarea');
        fields.forEach(field => {
            this.clearFieldError(field);
            field.classList.remove('valid', 'invalid');
        });

        // Supprime aussi le message général du formulaire.
        const existingMessage = this.form.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
    }

    setSubmitState(isLoading, loadingText = 'Envoi en cours...') {
        const submitBtn = this.form.querySelector('button[type="submit"]');
        if (!submitBtn) return;

        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
            submitBtn.textContent = loadingText;
        } else {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            submitBtn.textContent = 'Envoyer';
        }
    }

    showMessage(type, message) {
        // Remplace le message existant pour éviter l'empilement.
        const existingMessage = this.form.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Affiche un retour global de succès ou d'échec pour l'utilisateur.
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message ${type}`;
        messageDiv.innerHTML = `
            <div class="message-content">
                ${type === 'success' ? '✅' : '❌'} ${message}
            </div>
        `;

        // Le message est inséré en haut du formulaire pour être visible immédiatement.
        this.form.insertBefore(messageDiv, this.form.firstChild);

        // Nettoyage automatique après quelques secondes.
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    async handleSubmit(event) {
        event.preventDefault();
        this.clearAllErrors();

        const formData = new FormData(this.form);
        const data = {
            name: formData.get('name')?.trim() || '',
            email: formData.get('email')?.trim() || '',
            subject: formData.get('subject')?.trim() || '',
            message: formData.get('message')?.trim() || ''
        };

        // Relance une validation complète avant d'appeler l'API.
        let isValid = true;
        const fields = ['name', 'email', 'subject', 'message'];
        
        for (const fieldName of fields) {
            const field = this.form.querySelector(`[name="${fieldName}"]`);
            if (!this.validateField(field)) {
                isValid = false;
            }
        }

        if (!isValid) {
            this.showMessage('error', 'Veuillez corriger les erreurs dans le formulaire');
            return;
        }

        this.setSubmitState(true);

        try {
            // Le backend gère ensuite la persistance du message et l'envoi des emails.
            const response = await fetch(`${this.apiBaseUrl}/contact/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.showMessage('success', result.message || 'Message envoyé avec succès!');
                this.form.reset();
                
                // Après reset, on retire l'état visuel de validation.
                const fields = this.form.querySelectorAll('input, textarea');
                fields.forEach(field => {
                    field.classList.remove('valid');
                });
            } else {
                // Réaffiche les erreurs de validation détaillées renvoyées par l'API.
                if (result.errors && Array.isArray(result.errors)) {
                    result.errors.forEach(error => {
                        const field = this.form.querySelector(`[name="${error.path}"]`);
                        if (field) {
                            this.showFieldError(field, error.msg);
                        }
                    });
                }
                
                this.showMessage('error', result.message || 'Une erreur est survenue lors de l\'envoi du message');
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message:', error);
            this.showMessage('error', 'Une erreur est survenue. Veuillez vérifier votre connexion et réessayer.');
        } finally {
            this.setSubmitState(false);
        }
    }
}

// Initialise le gestionnaire une fois le DOM prêt.
document.addEventListener('DOMContentLoaded', () => {
    new ContactForm();
});

// Export utile pour des tests ou une réutilisation côté Node.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContactForm;
}
