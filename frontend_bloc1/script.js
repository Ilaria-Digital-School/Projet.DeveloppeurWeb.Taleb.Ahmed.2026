// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Active navigation highlighting
const navLinks = document.querySelectorAll('.nav-link');
const currentPath = window.location.pathname;
const currentPage = currentPath.split('/').pop() || 'index.html';

navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    if (linkPath === currentPage || 
        (currentPage === 'index.html' && linkPath === 'index.html') ||
        (currentPage === '' && linkPath === 'index.html')) {
        link.classList.add('active');
    } else {
        link.classList.remove('active');
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Form submissions
const contactForm = document.querySelector('.contact-form');
const newsletterForms = document.querySelectorAll('.newsletter-form');

// Contact form handler
if (false && contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        // Basic validation
        if (!data.name || !data.email || !data.subject || !data.message) {
            alert('Veuillez remplir tous les champs du formulaire.');
            return;
        }
        
        if (!isValidEmail(data.email)) {
            alert('Veuillez entrer une adresse email valide.');
            return;
        }
        
        // Show success message
        alert('Merci pour votre message! Nous vous répondrons dans les plus brefs délais.');
        this.reset();
    });
}

// Newsletter form handlers
newsletterForms.forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = this.querySelector('input[type="email"]').value;
        
        if (!email || !isValidEmail(email)) {
            alert('Veuillez entrer une adresse email valide.');
            return;
        }
        
        // Show success message
        alert('Merci de vous être inscrit à notre newsletter!');
        this.reset();
    });
});

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function createContactBubble() {
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
            <a class="contact-bubble-link primary" href="contact.html">Ouvrir le formulaire</a>
            <a class="contact-bubble-link" href="mailto:contact@vaguesderiffs.fr">contact@vaguesderiffs.fr</a>
            <a class="contact-bubble-link" href="tel:+33123456789">+33 1 23 45 67 89</a>
        </div>
    `;

    document.body.appendChild(bubble);

    const toggle = bubble.querySelector('.contact-bubble-toggle');
    const panel = bubble.querySelector('.contact-bubble-panel');

    toggle.addEventListener('click', () => {
        const isOpen = !panel.hasAttribute('hidden');

        if (isOpen) {
            panel.setAttribute('hidden', '');
            toggle.setAttribute('aria-expanded', 'false');
            bubble.classList.remove('open');
            return;
        }

        panel.removeAttribute('hidden');
        toggle.setAttribute('aria-expanded', 'true');
        bubble.classList.add('open');
    });

    document.addEventListener('click', (event) => {
        if (!bubble.contains(event.target)) {
            panel.setAttribute('hidden', '');
            toggle.setAttribute('aria-expanded', 'false');
            bubble.classList.remove('open');
        }
    });
}

// Load more functionality for portfolio
const loadMoreBtn = document.querySelector('.load-more');
const portfolioGrid = document.querySelector('.portfolio-grid');

if (loadMoreBtn && portfolioGrid) {
    let itemsLoaded = 6;
    const totalItems = 12; // Simulated total items
    
    loadMoreBtn.addEventListener('click', function() {
        // Simulate loading more items
        const newItems = generatePortfolioItems(itemsLoaded, Math.min(itemsLoaded + 6, totalItems));
        
        newItems.forEach(item => {
            portfolioGrid.appendChild(item);
        });
        
        itemsLoaded += 6;
        
        // Hide button if all items are loaded
        if (itemsLoaded >= totalItems) {
            loadMoreBtn.style.display = 'none';
        }
    });
}

// Generate portfolio items (simulation)
function generatePortfolioItems(start, end) {
    const items = [];
    const titles = ['Nouvel Album', 'Session Studio', 'Festival Été', 'Clip Vidéo', 'Interview Radio', 'Photoshoot'];
    const descriptions = ['Production/Enregistrement', 'Live/Performance', 'Création/Art', 'Promotion/Media'];
    
    for (let i = start; i < end; i++) {
        const item = document.createElement('div');
        item.className = 'portfolio-item';
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        
        const titleIndex = i % titles.length;
        const descIndex = i % descriptions.length;
        
        item.innerHTML = `
            <img src="" alt="${titles[titleIndex]}">
            <div class="portfolio-info">
                <h3>${titles[titleIndex]}</h3>
                <p>${descriptions[descIndex]}</p>
            </div>
        `;
        
        // Animate new items
        setTimeout(() => {
            item.style.transition = 'opacity 0.5s, transform 0.5s';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, 100);
        
        items.push(item);
    }
    
    return items;
}

// Concert ticket buttons
const ticketButtons = document.querySelectorAll('.concert-item .btn-primary');

ticketButtons.forEach(button => {
    button.addEventListener('click', function() {
        const concertTitle = this.closest('.concert-item').querySelector('h3').textContent;
        alert(`Billets pour "${concertTitle}" - Redirection vers la billetterie...`);
    });
});

// Concert info buttons
const infoButtons = document.querySelectorAll('.concert-item .btn-secondary');

infoButtons.forEach(button => {
    button.addEventListener('click', function() {
        const concertTitle = this.closest('.concert-item').querySelector('h3').textContent;
        alert(`Plus d'informations pour "${concertTitle}" - Page de détails...`);
    });
});

// Scroll to top button (optional enhancement)
window.addEventListener('scroll', function() {
    const scrollToTop = document.querySelector('.scroll-to-top');
    if (!scrollToTop) {
        createScrollToTopButton();
    }
});

function createScrollToTopButton() {
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
    
    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    document.body.appendChild(button);
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            button.style.display = 'block';
        } else {
            button.style.display = 'none';
        }
    });
}

// Add fade-in animation to sections on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all sections
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s, transform 0.6s';
    observer.observe(section);
});

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    createContactBubble();
    console.log('Vagues de Riffs website loaded successfully!');
});
