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
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form inputs
            const nameInput = this.querySelector('input[type="text"]');
            const emailInput = this.querySelector('input[type="email"]');
            const phoneInput = this.querySelector('input[type="tel"]');
            const serviceInput = this.querySelector('select');
            const messageInput = this.querySelector('textarea');
            const submitButton = this.querySelector('button[type="submit"]');
            
            // Get values
            const name = nameInput?.value?.trim() || '';
            const email = emailInput?.value?.trim() || '';
            const phone = phoneInput?.value?.trim() || '';
            const service = serviceInput?.value || '';
            const message = messageInput?.value?.trim() || '';
            
            // Client-side validation
            if (!name || !email || !service || !message) {
                showNotification('Please fill in all required fields.', 'error');
                return;
            }
            
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }
            
            if (message.length < 10) {
                showNotification('Message must be at least 10 characters long.', 'error');
                return;
            }
            
            // Disable submit button and show loading state
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
            
            try {
                // Get Supabase URL and anon key from config or use default
                const supabaseUrl = window.SUPABASE_URL || 'https://ehaznoklcisgckglkjot.supabase.co';
                const supabaseAnonKey = window.SUPABASE_ANON_KEY || '';

                // Send to secure backend endpoint
                const response = await fetch(`${supabaseUrl}/functions/v1/send-contact-email`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${supabaseAnonKey}`,
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        phone,
                        service,
                        message
                    })
                });
                
                const result = await response.json();
                
                if (response.ok && result.success) {
                    // Show success message
                    showNotification(result.message || 'Thank you! We\'ll get back to you soon.', 'success');
                    
                    // Reset form
                    this.reset();
                } else {
                    // Handle errors
                    const errorMessage = result.error || 'Failed to send message. Please try again.';
                    showNotification(errorMessage, 'error');
                    
                    // Log validation errors if present
                    if (result.errors && Array.isArray(result.errors)) {
                        console.error('Validation errors:', result.errors);
                    }
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                showNotification('An error occurred. Please try again later.', 'error');
            } finally {
                // Re-enable submit button
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
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

async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const submitButton = event.target.querySelector('button[type="submit"]');
    
    // Validate inputs
    if (!username || !password) {
        showNotification('Please enter both email and password.', 'error');
        return;
    }
    
    // Disable submit button during authentication
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Authenticating...';
    }
    
    showNotification('Authenticating...', 'info');
    
    try {
        // Check if supabase is available
        if (typeof supabase === 'undefined') {
            throw new Error('Authentication service not available. Please ensure Supabase is configured.');
        }
        
        // Authenticate with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email: username,
            password: password,
        });
        
        if (error) {
            console.error('Login error:', error);
            showNotification('Invalid email or password. Please try again.', 'error');
            return;
        }
        
        if (!data.user) {
            showNotification('Login failed. Please try again.', 'error');
            return;
        }
        
        // Get user profile to check role
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role, full_name')
            .eq('id', data.user.id)
            .single();
        
        if (profileError || !profile) {
            console.error('Profile error:', profileError);
            showNotification('User profile not found. Please contact support.', 'error');
            // Sign out the user since profile is missing
            await supabase.auth.signOut();
            return;
        }
        
        // Verify user role matches login type
        const userRole = profile.role;
        
        // Map login types to roles
        const roleMapping = {
            'admin': 'admin',
            'customer': 'customer',
            'investor': 'investor'
        };
        
        const expectedRole = roleMapping[currentLoginType];
        
        if (userRole !== expectedRole) {
            showNotification(`This account is not authorized for ${currentLoginType} access.`, 'error');
            await supabase.auth.signOut();
            return;
        }
        
        // Success! Redirect to appropriate dashboard
        const dashboards = {
            customer: 'customer-dashboard.html',
            investor: 'investor-dashboard.html',
            admin: 'admin-dashboard.html'
        };
        
        showNotification('Login successful! Redirecting...', 'success');
        
        setTimeout(() => {
            window.location.href = dashboards[currentLoginType];
        }, 1000);
        
    } catch (error) {
        console.error('Authentication error:', error);
        showNotification('An error occurred during login. Please try again.', 'error');
    } finally {
        // Re-enable submit button
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Sign In';
        }
    }
}
