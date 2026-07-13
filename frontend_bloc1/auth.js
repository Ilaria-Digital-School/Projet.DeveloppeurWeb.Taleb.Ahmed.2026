class AuthManager {
    constructor() {
        this.apiBaseUrl = this.resolveApiBaseUrl('/api/auth');
        this.apiRootUrl = this.resolveApiBaseUrl('/api');
        this.currentUser = this.loadCurrentUser();
        this.token = this.loadToken();
        this.init();
    }

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
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (event) => this.handleLogin(event));
        }

        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (event) => this.handleRegister(event));

            const passwordInput = document.getElementById('password');
            if (passwordInput) {
                passwordInput.addEventListener('input', (event) => {
                    this.checkPasswordStrength(event.target.value);
                });
            }

            this.addRealTimeValidation();
        }

        const logoutButtons = document.querySelectorAll('[data-logout]');
        logoutButtons.forEach((button) => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                this.logout();
            });
        });

        this.checkAuthStatus();
    }

    loadCurrentUser() {
        const user = localStorage.getItem('vaguesCurrentUser');
        return user ? JSON.parse(user) : null;
    }

    saveCurrentUser(user) {
        if (user) {
            localStorage.setItem('vaguesCurrentUser', JSON.stringify(user));
        } else {
            localStorage.removeItem('vaguesCurrentUser');
        }

        this.currentUser = user;
    }

    loadToken() {
        return localStorage.getItem('vaguesAuthToken');
    }

    saveToken(token) {
        if (token) {
            localStorage.setItem('vaguesAuthToken', token);
        } else {
            localStorage.removeItem('vaguesAuthToken');
        }

        this.token = token;
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validateStrongPassword(password) {
        const minLength = password.length >= 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return {
            isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers,
            strength: this.calculatePasswordStrength(password),
            requirements: {
                minLength,
                hasUpperCase,
                hasLowerCase,
                hasNumbers,
                hasSpecialChar
            }
        };
    }

    calculatePasswordStrength(password) {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

        if (strength <= 2) return 'weak';
        if (strength <= 4) return 'medium';
        return 'strong';
    }

    checkPasswordStrength(password) {
        const strengthElement = document.getElementById('passwordStrength');
        if (!strengthElement) return;

        const validation = this.validateStrongPassword(password);
        strengthElement.className = 'password-strength';

        if (password.length > 0) {
            strengthElement.classList.add(validation.strength);
        }
    }

    showError(fieldId, message) {
        const errorElement = document.getElementById(`${fieldId}Error`);
        const inputElement = document.getElementById(fieldId);

        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }

        if (inputElement) {
            inputElement.classList.add('invalid');
            inputElement.classList.remove('valid');
        }
    }

    clearError(fieldId) {
        const errorElement = document.getElementById(`${fieldId}Error`);
        const inputElement = document.getElementById(fieldId);

        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        }

        if (inputElement) {
            inputElement.classList.remove('invalid');
            inputElement.classList.add('valid');
        }
    }

    clearAllErrors() {
        document.querySelectorAll('.error-message').forEach((element) => {
            element.textContent = '';
            element.classList.remove('show');
        });

        document.querySelectorAll('input').forEach((element) => {
            element.classList.remove('invalid', 'valid');
        });
    }

    setSubmitState(form, isLoading, loadingText) {
        const submitBtn = form.querySelector('.auth-btn');
        if (!submitBtn) return null;

        if (!submitBtn.dataset.originalText) {
            submitBtn.dataset.originalText = submitBtn.textContent;
        }

        if (isLoading) {
            submitBtn.classList.add('loading');
            submitBtn.textContent = loadingText;
        } else {
            submitBtn.classList.remove('loading');
            submitBtn.textContent = submitBtn.dataset.originalText;
        }

        return submitBtn;
    }

    async request(path, options = {}) {
        const response = await fetch(`${this.apiBaseUrl}${path}`, {
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            },
            ...options
        });

        const data = await response.json().catch(() => ({
            success: false,
            message: 'Réponse invalide du serveur'
        }));

        if (!response.ok) {
            throw data;
        }

        return data;
    }

    async apiRequest(path, options = {}) {
        const response = await fetch(`${this.apiRootUrl}${path}`, {
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            },
            ...options
        });

        const data = await response.json().catch(() => ({
            success: false,
            message: 'Réponse invalide du serveur'
        }));

        if (!response.ok) {
            throw data;
        }

        return data;
    }

    async authenticatedRequest(path, options = {}) {
        if (!this.token) {
            throw new Error('Token manquant');
        }

        return this.request(path, {
            ...options,
            headers: {
                Authorization: `Bearer ${this.token}`,
                ...(options.headers || {})
            }
        });
    }

    async authenticatedApiRequest(path, options = {}) {
        if (!this.token) {
            throw new Error('Token manquant');
        }

        return this.apiRequest(path, {
            ...options,
            headers: {
                Authorization: `Bearer ${this.token}`,
                ...(options.headers || {})
            }
        });
    }

    mapServerValidationErrors(errors = []) {
        const fieldMap = {
            firstName: 'firstName',
            lastName: 'lastName',
            email: 'email',
            username: 'username',
            password: 'password',
            birthDate: 'birthDate',
            terms: 'terms'
        };

        errors.forEach((error) => {
            const fieldId = fieldMap[error.path];
            if (fieldId) {
                this.showError(fieldId, error.msg);
            }
        });
    }

    async handleLogin(event) {
        event.preventDefault();
        this.clearAllErrors();

        const form = event.target;
        const formData = new FormData(form);
        const email = String(formData.get('email') || '').trim();
        const password = String(formData.get('password') || '');

        let isValid = true;

        if (!email) {
            this.showError('email', 'L\'email est requis');
            isValid = false;
        } else if (!this.validateEmail(email)) {
            this.showError('email', 'Veuillez entrer un email valide');
            isValid = false;
        }

        if (!password) {
            this.showError('password', 'Le mot de passe est requis');
            isValid = false;
        }

        if (!isValid) return;

        this.setSubmitState(form, true, 'Connexion...');

        try {
            const result = await this.request('/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            this.saveCurrentUser(result.data.user);
            this.saveToken(result.data.token);

            this.showMessage('success', 'Connexion réussie. Redirection...');
            setTimeout(() => {
                window.location.href = result.data.user && result.data.user.role === 'admin'
                    ? 'admin-dashboard.html'
                    : 'user-dashboard.html';
            }, 1200);
        } catch (error) {
            if (error.errors) {
                this.mapServerValidationErrors(error.errors);
            }

            this.showMessage('error', error.message || 'Impossible de se connecter');
        } finally {
            this.setSubmitState(form, false);
        }
    }

    async handleRegister(event) {
        event.preventDefault();
        this.clearAllErrors();

        const form = event.target;
        const formData = new FormData(form);
        const firstName = String(formData.get('firstName') || '').trim();
        const lastName = String(formData.get('lastName') || '').trim();
        const email = String(formData.get('email') || '').trim();
        const username = String(formData.get('username') || '').trim();
        const password = String(formData.get('password') || '');
        const confirmPassword = String(formData.get('confirmPassword') || '');
        const birthDate = String(formData.get('birthDate') || '');
        const terms = document.getElementById('terms').checked;
        const newsletter = document.getElementById('newsletter').checked;

        let isValid = true;

        if (!firstName || firstName.length < 2) {
            this.showError('firstName', 'Le prénom doit contenir au moins 2 caractères');
            isValid = false;
        }

        if (!lastName || lastName.length < 2) {
            this.showError('lastName', 'Le nom doit contenir au moins 2 caractères');
            isValid = false;
        }

        if (!email) {
            this.showError('email', 'L\'email est requis');
            isValid = false;
        } else if (!this.validateEmail(email)) {
            this.showError('email', 'Veuillez entrer un email valide');
            isValid = false;
        }

        if (!username || username.length < 3) {
            this.showError('username', 'Le nom d\'utilisateur doit contenir au moins 3 caractères');
            isValid = false;
        }

        const passwordValidation = this.validateStrongPassword(password);
        if (!password) {
            this.showError('password', 'Le mot de passe est requis');
            isValid = false;
        } else if (!passwordValidation.isValid) {
            this.showError('password', 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre');
            isValid = false;
        }

        if (password !== confirmPassword) {
            this.showError('confirmPassword', 'Les mots de passe ne correspondent pas');
            isValid = false;
        }

        if (!birthDate) {
            this.showError('birthDate', 'La date de naissance est requise');
            isValid = false;
        } else if (this.calculateAge(new Date(birthDate)) < 13) {
            this.showError('birthDate', 'Vous devez avoir au moins 13 ans pour vous inscrire');
            isValid = false;
        }

        if (!terms) {
            this.showError('terms', 'Vous devez accepter les conditions d\'utilisation');
            isValid = false;
        }

        if (!isValid) return;

        this.setSubmitState(form, true, 'Inscription...');

        try {
            await this.request('/register', {
                method: 'POST',
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    username,
                    password,
                    birthDate,
                    newsletter: String(newsletter),
                    terms: String(terms)
                })
            });

            this.showMessage('success', 'Inscription réussie. Vous pouvez maintenant vous connecter.');
            form.reset();

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1600);
        } catch (error) {
            if (error.errors) {
                this.mapServerValidationErrors(error.errors);
            }

            this.showMessage('error', error.message || 'Impossible de créer le compte');
        } finally {
            this.setSubmitState(form, false);
        }
    }

    calculateAge(birthDate) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    }

    showMessage(type, message) {
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type} show`;
        messageDiv.textContent = message;

        const form = document.querySelector('.auth-form');
        if (form) {
            form.insertBefore(messageDiv, form.firstChild);
        }

        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    async checkAuthStatus() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const isProtectedPage =
            currentPage === 'user-dashboard.html' ||
            currentPage === 'admin-dashboard.html' ||
            currentPage === 'user-dashboard' ||
            currentPage === 'admin-dashboard';

        if (!isProtectedPage) {
            if (this.currentUser) {
                this.updateUIForLoggedInUser();
            }
            return;
        }

        if (!this.token) {
            this.redirectToLogin();
            return;
        }

        try {
            const result = await this.authenticatedRequest('/me');
            this.saveCurrentUser(result.data);
            this.updateUIForLoggedInUser();

            if (currentPage === 'admin-dashboard.html' && result.data.role !== 'admin') {
                window.location.href = 'user-dashboard.html';
                return;
            }

            if (currentPage === 'user-dashboard.html' && result.data.role === 'admin') {
                window.location.href = 'admin-dashboard.html';
            }
        } catch (error) {
            this.saveCurrentUser(null);
            this.saveToken(null);
            this.redirectToLogin();
        }
    }

    updateUIForLoggedInUser() {
        const ctaButton = document.querySelector('.cta-button');
        const isDashboardPage = window.location.pathname.includes('dashboard');

        if (ctaButton && !ctaButton.hasAttribute('data-logout')) {
            ctaButton.textContent = 'MON ESPACE';
            ctaButton.onclick = () => {
                window.location.href = this.currentUser && this.currentUser.role === 'admin'
                    ? 'admin-dashboard.html'
                    : 'user-dashboard.html';
            };
        }

        if (!isDashboardPage) {
            this.updatePublicNavigation();
        }

        const userInfo = document.querySelector('.user-info');
        if (userInfo && this.currentUser) {
            userInfo.innerHTML = `
                <span>Bonjour ${this.currentUser.firstName}!</span>
                <button onclick="authManager.logout()">Déconnexion</button>
            `;
        }

        this.updateDashboardUserData();
        this.loadAdminDashboardData();
    }

    updatePublicNavigation() {
        const loginLink = document.querySelector('.nav-link[href="login.html"]');
        const registerLink = document.querySelector('.nav-link[href="register.html"]');

        if (loginLink) {
            loginLink.textContent = 'MON ESPACE';
            loginLink.setAttribute(
                'href',
                this.currentUser && this.currentUser.role === 'admin'
                    ? 'admin-dashboard.html'
                    : 'user-dashboard.html'
            );
        }

        if (registerLink) {
            registerLink.textContent = 'DECONNEXION';
            registerLink.setAttribute('href', '#');
            registerLink.addEventListener('click', (event) => {
                event.preventDefault();
                this.logout();
            });
        }
    }

    updateDashboardUserData() {
        if (!this.currentUser) return;

        const firstName = this.currentUser.firstName || 'Utilisateur';
        const lastName = this.currentUser.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim();
        const email = this.currentUser.email || '';
        const username = this.currentUser.username || 'Non renseigne';
        const role = this.formatRoleLabel(this.currentUser.role);
        const initials = `${firstName.charAt(0)}${lastName.charAt(0) || firstName.charAt(1) || ''}`.toUpperCase();
        const memberSince = this.formatMemberSince(this.currentUser.createdAt);
        const newsletterStatus = this.currentUser.newsletter ? 'Oui' : 'Non';
        const accountStatus = this.currentUser.isActive ? 'Actif' : 'Inactif';
        const lastLogin = this.formatLastLogin(this.currentUser.lastLogin);

        const greeting = document.getElementById('userDashboardGreeting');
        if (greeting) {
            greeting.textContent = `Bonjour ${firstName}, prête pour la prochaine vague de riffs ?`;
        }

        const avatar = document.getElementById('userAvatar');
        if (avatar) {
            avatar.textContent = initials;
        }

        const userFullName = document.getElementById('userFullName');
        if (userFullName) {
            userFullName.textContent = fullName;
        }

        const userEmail = document.getElementById('userEmail');
        if (userEmail) {
            userEmail.textContent = email;
        }

        const userRole = document.getElementById('userRole');
        if (userRole) {
            userRole.textContent = role;
        }

        const userMemberSinceValue = document.getElementById('userMemberSinceValue');
        if (userMemberSinceValue) {
            userMemberSinceValue.textContent = memberSince.short;
        }

        const userNewsletterValue = document.getElementById('userNewsletterValue');
        if (userNewsletterValue) {
            userNewsletterValue.textContent = newsletterStatus;
        }

        const userStatusValue = document.getElementById('userStatusValue');
        if (userStatusValue) {
            userStatusValue.textContent = accountStatus;
        }

        const userIdValue = document.getElementById('userIdValue');
        if (userIdValue) {
            userIdValue.textContent = this.currentUser.id || '--';
        }

        const userUsernameValue = document.getElementById('userUsernameValue');
        if (userUsernameValue) {
            userUsernameValue.textContent = username;
        }

        const userLastLoginDay = document.getElementById('userLastLoginDay');
        if (userLastLoginDay) {
            userLastLoginDay.textContent = lastLogin.day;
        }

        const userLastLoginMonth = document.getElementById('userLastLoginMonth');
        if (userLastLoginMonth) {
            userLastLoginMonth.textContent = lastLogin.month;
        }

        const userLastLoginText = document.getElementById('userLastLoginText');
        if (userLastLoginText) {
            userLastLoginText.textContent = lastLogin.label;
        }

        const userAccountSummary = document.getElementById('userAccountSummary');
        if (userAccountSummary) {
            userAccountSummary.innerHTML = `
                <li>Compte cree le <strong>${memberSince.long}</strong>.</li>
                <li>Nom d'utilisateur actuel : <strong>${username}</strong>.</li>
                <li>Abonnement newsletter : <strong>${newsletterStatus}</strong>.</li>
                <li>Statut du compte : <strong>${accountStatus}</strong>.</li>
            `;
        }

        const adminGreeting = document.getElementById('adminDashboardGreeting');
        if (adminGreeting) {
            adminGreeting.textContent = `Bienvenue ${fullName}`;
        }

        const adminSubtitle = document.getElementById('adminDashboardSubtitle');
        if (adminSubtitle) {
            adminSubtitle.textContent = `Connecté avec ${email}. Vous êtes identifié en tant que ${role.toLowerCase()}.`;
        }

        const adminIdentity = document.getElementById('adminIdentity');
        if (adminIdentity) {
            adminIdentity.textContent = `${role} connecté`;
        }
    }

    async loadAdminDashboardData() {
        const isAdminPage = window.location.pathname.includes('admin-dashboard');
        if (!isAdminPage || !this.currentUser || this.currentUser.role !== 'admin') {
            return;
        }

        try {
            const result = await this.authenticatedApiRequest('/users/admin/dashboard');
            const dashboardData = result.data || {};
            const metrics = dashboardData.metrics || {};

            this.setTextContent('adminUsersMetric', metrics.totalUsers ?? '--');
            this.setTextContent('adminUsersMetricDetail', `+${metrics.newUsersThisWeek ?? 0} cette semaine`);
            this.setTextContent('adminConcertsMetric', metrics.totalConcerts ?? '--');
            this.setTextContent('adminConcertsMetricDetail', `${metrics.featuredConcerts ?? 0} en vedette`);
            this.setTextContent('adminMessagesMetric', metrics.totalMessages ?? '--');
            this.setTextContent('adminMessagesMetricDetail', `${metrics.unreadMessages ?? 0} non lus`);
            this.setTextContent('adminNewsletterMetric', metrics.newsletterSubscribers ?? '--');
            this.setTextContent('adminNewsletterMetricDetail', 'Abonnés newsletter');

            this.renderAdminRecentUsers(dashboardData.recentUsers || []);
            this.renderAdminRecentContent(dashboardData.recentPortfolio || []);
            this.renderAdminAlerts(dashboardData.alerts || []);
        } catch (error) {
            this.setTextContent('adminUsersMetricDetail', 'Impossible de charger les données');
            this.setTextContent('adminConcertsMetricDetail', 'Impossible de charger les données');
            this.setTextContent('adminMessagesMetricDetail', 'Impossible de charger les données');
            this.setTextContent('adminNewsletterMetricDetail', 'Impossible de charger les données');
            this.renderAdminAlerts(['Impossible de récupérer les données du dashboard admin']);
        }
    }

    renderAdminRecentUsers(users) {
        const tableBody = document.getElementById('adminRecentUsersTable');
        if (!tableBody) return;

        if (users.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4">Aucun utilisateur trouvé.</td></tr>';
            return;
        }

        tableBody.innerHTML = users.map((user) => `
            <tr>
                <td>${this.escapeHtml(user.fullName || 'Utilisateur')}</td>
                <td>${this.escapeHtml(user.email || '')}</td>
                <td>${this.escapeHtml(this.formatRoleLabel(user.role))}</td>
                <td><span class="badge ${user.isActive ? 'success' : 'warning'}">${user.isActive ? 'Actif' : 'Inactif'}</span></td>
            </tr>
        `).join('');
    }

    renderAdminRecentContent(items) {
        const list = document.getElementById('adminRecentContentList');
        if (!list) return;

        if (items.length === 0) {
            list.innerHTML = `
                <div class="task-item">
                    <div>
                        <h4>Aucun contenu récent</h4>
                        <p>La base ne contient pas encore d'élément de portfolio.</p>
                    </div>
                    <button type="button">--</button>
                </div>
            `;
            return;
        }

        list.innerHTML = items.map((item) => `
            <div class="task-item">
                <div>
                    <h4>${this.escapeHtml(item.title || 'Sans titre')}</h4>
                    <p>${this.escapeHtml(this.formatPortfolioSummary(item))}</p>
                </div>
                <button type="button">${item.isFeatured ? 'Vedette' : 'Normal'}</button>
            </div>
        `).join('');
    }

    renderAdminAlerts(alerts) {
        const list = document.getElementById('adminAlertsList');
        if (!list) return;

        if (alerts.length === 0) {
            list.innerHTML = '<li>Aucune alerte pour le moment.</li>';
            return;
        }

        list.innerHTML = alerts.map((alert) => `<li>${this.escapeHtml(alert)}</li>`).join('');
    }

    formatPortfolioSummary(item) {
        const category = item.category ? `Catégorie : ${item.category}` : 'Catégorie inconnue';
        const createdAt = item.createdAt ? `Ajouté le ${new Date(item.createdAt).toLocaleDateString('fr-FR')}` : 'Date inconnue';
        return `${category} • ${createdAt}`;
    }

    setTextContent(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = String(value);
        }
    }

    escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    formatRoleLabel(role) {
        if (role === 'admin') {
            return 'Administrateur';
        }

        return 'Utilisateur';
    }

    formatMemberSince(createdAt) {
        if (!createdAt) {
            return { short: '--', long: 'date inconnue' };
        }

        const date = new Date(createdAt);
        if (Number.isNaN(date.getTime())) {
            return { short: '--', long: 'date inconnue' };
        }

        return {
            short: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
            long: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
        };
    }

    formatLastLogin(lastLogin) {
        if (!lastLogin) {
            return {
                day: '--',
                month: '---',
                label: 'Aucune connexion enregistree'
            };
        }

        const date = new Date(lastLogin);
        if (Number.isNaN(date.getTime())) {
            return {
                day: '--',
                month: '---',
                label: 'Derniere connexion indisponible'
            };
        }

        return {
            day: date.toLocaleDateString('fr-FR', { day: '2-digit' }),
            month: date.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '').toUpperCase(),
            label: date.toLocaleString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        };
    }

    logout() {
        this.saveCurrentUser(null);
        this.saveToken(null);
        localStorage.removeItem('vaguesRememberMe');
        this.redirectToLogin();
    }

    redirectToLogin() {
        window.location.href = 'login.html';
    }

    addRealTimeValidation() {
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('blur', () => {
                if (emailInput.value && !this.validateEmail(emailInput.value)) {
                    this.showError('email', 'Veuillez entrer un email valide');
                } else if (emailInput.value) {
                    this.clearError('email');
                }
            });
        }

        const usernameInput = document.getElementById('username');
        if (usernameInput) {
            usernameInput.addEventListener('blur', () => {
                if (usernameInput.value && usernameInput.value.length < 3) {
                    this.showError('username', 'Le nom d\'utilisateur doit contenir au moins 3 caractères');
                } else if (usernameInput.value) {
                    this.clearError('username');
                }
            });
        }

        const confirmPasswordInput = document.getElementById('confirmPassword');
        const passwordInput = document.getElementById('password');
        if (confirmPasswordInput && passwordInput) {
            confirmPasswordInput.addEventListener('input', () => {
                if (confirmPasswordInput.value && confirmPasswordInput.value !== passwordInput.value) {
                    this.showError('confirmPassword', 'Les mots de passe ne correspondent pas');
                } else if (confirmPasswordInput.value) {
                    this.clearError('confirmPassword');
                }
            });
        }
    }
}

function togglePassword(fieldId) {
    const passwordInput = document.getElementById(fieldId);
    const toggleIcon = document.getElementById(`${fieldId}Toggle`);

    if (!passwordInput || !toggleIcon) return;

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.textContent = 'Hide';
    } else {
        passwordInput.type = 'password';
        toggleIcon.textContent = 'Show';
    }
}

function socialLogin(provider) {
    const authManager = window.authManager;
    if (authManager) {
        authManager.showMessage('info', `Connexion avec ${provider} bientôt disponible.`);
    }
}

let authManager;
document.addEventListener('DOMContentLoaded', () => {
    authManager = new AuthManager();
    window.authManager = authManager;
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}
