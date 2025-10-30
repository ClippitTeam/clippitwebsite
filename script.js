// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking a link
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            if (mobileMenuToggle) {
                mobileMenuToggle.classList.remove('active');
            }
        });
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
    // Contact Form Handling
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // Simple validation
            const name = this.querySelector('input[type="text"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const service = this.querySelector('select').value;
            const message = this.querySelector('textarea').value;
            
            if (!name || !email || !service || !message) {
                alert('Please fill in all required fields.');
                return;
            }
            
            // Show success message
            showNotification('Thank you! We\'ll get back to you soon.', 'success');
            
            // Reset form
            this.reset();
            
            // In a real application, you would send this data to a server
            console.log('Form submitted:', { name, email, service, message });
        });
    }
    
    // Scroll animations
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
    
    // Observe service cards, package cards, and process steps
    const animatedElements = document.querySelectorAll('.service-card, .package-card, .process-step');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Navbar background on scroll
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.style.backgroundColor = 'rgba(31, 41, 55, 0.98)';
                navbar.style.boxShadow = '0 4px 20px rgba(64, 224, 208, 0.1)';
            } else {
                navbar.style.backgroundColor = 'rgba(31, 41, 55, 0.95)';
                navbar.style.boxShadow = 'none';
            }
        });
    }
    
    // Active navigation highlighting
    const sections = document.querySelectorAll('section[id]');
    const navLinks2 = document.querySelectorAll('.nav-menu a');
    
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks2.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
});

// Notification function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Color schemes for different notification types
    const colors = {
        success: 'linear-gradient(135deg, #10B981, #059669)',
        error: 'linear-gradient(135deg, #EF4444, #DC2626)',
        warning: 'linear-gradient(135deg, #F59E0B, #D97706)',
        info: 'linear-gradient(135deg, #40E0D0, #36B8A8)'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: #fff;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-weight: 600;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ==========================================
// LOGIN SYSTEM
// ==========================================

let currentLoginType = '';

function showLoginForm(type) {
    currentLoginType = type;
    const loginOptions = document.querySelector('.login-options');
    const loginFormContainer = document.getElementById('login-form-container');
    const loginFormIcon = document.getElementById('login-form-icon');
    const loginFormTitle = document.getElementById('login-form-title');
    const loginFooter = document.querySelector('.login-footer');
    
    // Hide options and footer, show form
    if (loginOptions) loginOptions.style.display = 'none';
    if (loginFooter) loginFooter.style.display = 'none';
    if (loginFormContainer) loginFormContainer.style.display = 'block';
    
    // Update form based on type
    const icons = { customer: '👤', investor: '💼', admin: '⚙️' };
    const titles = { customer: 'Customer Login', investor: 'Investor Login', admin: 'Admin Login' };
    
    if (loginFormIcon) loginFormIcon.textContent = icons[type];
    if (loginFormTitle) loginFormTitle.textContent = titles[type];
    
    // Clear form
    const form = document.getElementById('login-form');
    if (form) form.reset();
}

function backToSelection() {
    const loginOptions = document.querySelector('.login-options');
    const loginFormContainer = document.getElementById('login-form-container');
    const loginFooter = document.querySelector('.login-footer');
    
    // Show options and footer, hide form
    if (loginOptions) loginOptions.style.display = 'grid';
    if (loginFooter) loginFooter.style.display = 'block';
    if (loginFormContainer) loginFormContainer.style.display = 'none';
    
    currentLoginType = '';
}

function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    // Validate credentials based on login type
    let isValid = false;
    let errorMessage = 'Invalid username or password';
    
    if (currentLoginType === 'admin') {
        // Admin requires specific credentials
        if (username === 'admin@clippit.today' && password === '!Clippit1986') {
            isValid = true;
        } else {
            errorMessage = 'Invalid admin credentials';
        }
    } else if (currentLoginType === 'customer') {
        // Customer demo accounts (for demonstration purposes)
        // In production, this would validate against a database
        if (username && password && password.length >= 6) {
            isValid = true;
        } else {
            errorMessage = 'Invalid credentials. Password must be at least 6 characters.';
        }
    } else if (currentLoginType === 'investor') {
        // Investor demo accounts (for demonstration purposes)
        // In production, this would validate against a database
        if (username && password && password.length >= 6) {
            isValid = true;
        } else {
            errorMessage = 'Invalid credentials. Password must be at least 6 characters.';
        }
    }
    
    if (!isValid) {
        showNotification(errorMessage, 'error');
        return;
    }
    
    showNotification('Authenticating...', 'info');
    
    setTimeout(() => {
        // Store session
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('loginType', currentLoginType);
        sessionStorage.setItem('username', username);
        
        // Redirect to appropriate dashboard
        const dashboards = {
            customer: 'customer-dashboard.html',
            investor: 'investor-dashboard.html',
            admin: 'admin-dashboard.html'
        };
        
        showNotification('Login successful! Redirecting...', 'success');
        
        setTimeout(() => {
            window.location.href = dashboards[currentLoginType];
        }, 1000);
    }, 1000);
}
