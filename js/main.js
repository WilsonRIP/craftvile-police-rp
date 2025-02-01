// Performance optimization: Use strict mode
'use strict';

// Theme Management
const themeToggle = document.getElementById('themeToggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Set initial theme
function setInitialTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (prefersDarkScheme.matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

setInitialTheme();

// Theme toggle functionality
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Set initial theme based on system preference
    document.documentElement.dataset.theme = prefersDarkScheme.matches ? 'dark' : 'light';
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.dataset.theme;
        document.documentElement.dataset.theme = currentTheme === 'dark' ? 'light' : 'dark';
    });
    
    // Mobile navigation toggle
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.querySelector('.nav-links');
    
    navToggle?.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('active');
    }
});

// Performance optimization: Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Intersection Observer for animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.feature-card, .update-card, .stat-card').forEach(card => {
    observer.observe(card);
});

// Staff Application Form Handling
const staffApplication = document.getElementById('staffApplication');
if (staffApplication) {
    staffApplication.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (validateForm(staffApplication)) {
            const formData = new FormData(staffApplication);
            const application = Object.fromEntries(formData.entries());
            
            // Store application in localStorage for demo purposes
            // In production, this would be sent to a server
            const applications = JSON.parse(localStorage.getItem('applications') || '[]');
            application.id = Date.now();
            application.status = 'pending';
            application.date = new Date().toISOString();
            applications.push(application);
            localStorage.setItem('applications', JSON.stringify(applications));
            
            staffApplication.reset();
            alert('Application submitted successfully!');
            updateApplicationsList();
        }
    });
}

// Form validation
function validateForm(form) {
    const inputs = form.querySelectorAll('input, textarea, select');
    let isValid = true;

    inputs.forEach(input => {
        if (input.hasAttribute('required') && !input.value.trim()) {
            isValid = false;
            showError(input, 'This field is required');
        } else {
            clearError(input);
        }

        if (input.type === 'email' && input.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                isValid = false;
                showError(input, 'Please enter a valid email address');
            }
        }
    });

    return isValid;
}

function showError(input, message) {
    const errorDiv = input.nextElementSibling?.classList.contains('error-message') 
        ? input.nextElementSibling 
        : document.createElement('div');
    
    if (!input.nextElementSibling?.classList.contains('error-message')) {
        errorDiv.classList.add('error-message');
        input.parentNode.insertBefore(errorDiv, input.nextSibling);
    }
    
    errorDiv.textContent = message;
    input.classList.add('error');
}

function clearError(input) {
    const errorDiv = input.nextElementSibling;
    if (errorDiv?.classList.contains('error-message')) {
        errorDiv.remove();
    }
    input.classList.remove('error');
}

// Updates Page Functionality
const updateFilters = document.querySelectorAll('.filter-btn');
if (updateFilters.length > 0) {
    updateFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            const category = filter.dataset.filter;
            
            // Update active filter
            updateFilters.forEach(btn => btn.classList.remove('active'));
            filter.classList.add('active');
            
            // Filter updates
            const updates = document.querySelectorAll('.update-card');
            updates.forEach(update => {
                if (category === 'all' || update.dataset.category === category) {
                    update.style.display = 'block';
                } else {
                    update.style.display = 'none';
                }
            });
        });
    });
}

// Staff Dashboard Functionality
function updateApplicationsList() {
    const applicationsGrid = document.getElementById('applicationsGrid');
    if (!applicationsGrid) return;

    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';
    const searchTerm = document.getElementById('searchApplications')?.value.toLowerCase() || '';

    const filteredApplications = applications.filter(app => {
        const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
        const matchesSearch = Object.values(app).some(value => 
            value.toString().toLowerCase().includes(searchTerm)
        );
        return matchesStatus && matchesSearch;
    });

    applicationsGrid.innerHTML = filteredApplications.map(app => `
        <div class="application-card" data-id="${app.id}">
            <div class="application-header">
                <h4>${app.position}</h4>
                <span class="status-badge ${app.status}">${app.status}</span>
            </div>
            <div class="application-details">
                <p><strong>Steam ID:</strong> ${app.steamId}</p>
                <p><strong>Discord:</strong> ${app.discordTag}</p>
                <p><strong>Date:</strong> ${new Date(app.date).toLocaleDateString()}</p>
            </div>
            ${app.status === 'pending' ? `
                <div class="application-actions">
                    <button onclick="updateApplicationStatus(${app.id}, 'approved')" class="approve-btn">Approve</button>
                    <button onclick="updateApplicationStatus(${app.id}, 'denied')" class="deny-btn">Deny</button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Initialize dashboard if it exists
const staffDashboard = document.getElementById('staffDashboard');
if (staffDashboard) {
    updateApplicationsList();
    
    // Add event listeners for filters
    document.getElementById('statusFilter')?.addEventListener('change', updateApplicationsList);
    document.getElementById('searchApplications')?.addEventListener('input', 
        debounce(updateApplicationsList, 300)
    );
}

// Application status update function
window.updateApplicationStatus = function(id, status) {
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    const index = applications.findIndex(app => app.id === id);
    
    if (index !== -1) {
        applications[index].status = status;
        localStorage.setItem('applications', JSON.stringify(applications));
        updateApplicationsList();
    }
};

// Performance optimization: Add smooth scrolling for anchor links
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

// FAQ Accordion functionality
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Close all other items
        faqItems.forEach(otherItem => {
            if (otherItem !== item) {
                otherItem.classList.remove('active');
            }
        });
        
        // Toggle current item
        item.classList.toggle('active');
        
        // Accessibility
        const answer = item.querySelector('.faq-answer');
        answer.setAttribute('aria-expanded', !isActive);
    });
});

// Add keyboard navigation for FAQ items
faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            question.click();
        }
    });
    
    // Add proper accessibility attributes
    question.setAttribute('role', 'button');
    question.setAttribute('tabindex', '0');
    const answer = item.querySelector('.faq-answer');
    answer.setAttribute('aria-expanded', 'false');
}); 