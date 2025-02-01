// Theme Management
const themeToggle = document.querySelector('.theme-toggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    } else if (prefersDarkScheme.matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
        updateThemeIcon('dark');
    }
}

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

themeToggle?.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

// Toast Notifications
const toastContainer = document.createElement('div');
toastContainer.className = 'toast-container';
document.body.appendChild(toastContainer);

function showToast(message, type = 'success', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = document.createElement('i');
    icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    
    const text = document.createElement('span');
    text.textContent = message;
    
    toast.appendChild(icon);
    toast.appendChild(text);
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
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

// Intersection Observer for Animations
const animateOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-slide-up');
            animateOnScroll.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '50px'
});

document.querySelectorAll('.card, .store-item, .post-card').forEach(element => {
    animateOnScroll.observe(element);
});

// Mobile Navigation
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

mobileMenuBtn?.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileMenuBtn.classList.toggle('active');
});

// Form Validation
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', (e) => {
        if (!form.checkValidity()) {
            e.preventDefault();
            Array.from(form.elements).forEach(input => {
                if (!input.checkValidity()) {
                    input.classList.add('invalid');
                    showInputError(input);
                }
            });
        }
    });
});

function showInputError(input) {
    const errorMessage = input.validationMessage;
    const errorElement = document.createElement('div');
    errorElement.className = 'input-error';
    errorElement.textContent = errorMessage;
    
    input.parentNode.appendChild(errorElement);
    input.addEventListener('input', () => {
        errorElement.remove();
        input.classList.remove('invalid');
    }, { once: true });
}

// Loading States
function showLoading(element) {
    element.classList.add('loading');
    element.disabled = true;
    const originalText = element.textContent;
    element.textContent = 'Loading...';
    return () => {
        element.classList.remove('loading');
        element.disabled = false;
        element.textContent = originalText;
    };
}

// Image Lazy Loading
document.querySelectorAll('img[data-src]').forEach(img => {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                img.src = img.dataset.src;
                observer.unobserve(img);
            }
        });
    });
    observer.observe(img);
});

// Initialize UI
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    prefersDarkScheme.addListener(initTheme);
}); 