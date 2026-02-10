/* ========================================
   Main Application JavaScript
   SecondBrain - AI-Powered Knowledge System
   ======================================== */

// Global State
const AppState = {
    currentPage: 'landing',
    theme: localStorage.getItem('theme') || 'light',
    sidebarOpen: false,
    user: JSON.parse(localStorage.getItem('user')) || {
        name: 'Alex Johnson',
        email: 'alex@example.com',
        initials: 'AJ',
        photoUrl: null
    }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavigation();
    initMobileMenu();
    initThemeToggle();
    initNavbarScroll();
    initKeyboardShortcuts();
    initHeroParallax();
});

// Hero Parallax Effect
function initHeroParallax() {
    const hero = document.querySelector('.hero');
    const wrapper = document.querySelector('.hero-visual-wrapper');
    if (!hero || !wrapper) return;

    hero.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;

        // Calculate move offsets
        const moveX = (clientX - innerWidth / 2) / 50;
        const moveY = (clientY - innerHeight / 2) / 50;

        wrapper.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });

    hero.addEventListener('mouseleave', () => {
        wrapper.style.transform = 'translate(0, 0)';
    });
}

// Theme Management
function initTheme() {
    document.documentElement.setAttribute('data-theme', AppState.theme);
}

function toggleTheme() {
    AppState.theme = AppState.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', AppState.theme);
    localStorage.setItem('theme', AppState.theme);
}

function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

// Page Navigation
function showPage(pageName, pushState = true) {
    const targetPage = document.getElementById(`${pageName}-page`);

    // Safety check: Don't do anything if the page doesn't exist
    if (!targetPage) {
        // If it's just an anchor on the same page, return and let default browser behavior handle it
        if (['features', 'how-it-works', 'demo', 'cta'].includes(pageName)) return;
        return;
    }

    // If we're already on this page, just ensure it's visible and return
    if (AppState.currentPage === pageName && targetPage.classList.contains('active')) {
        return;
    }

    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // Show target page
    targetPage.classList.add('active');
    AppState.currentPage = pageName;

    // Initialize page-specific content
    if (pageName === 'dashboard') {
        initDashboard();
    }

    // Update URL
    if (pushState) {
        const url = pageName === 'landing' ? window.location.pathname : `${window.location.pathname}#${pageName}`;
        history.pushState({ page: pageName }, '', url);
    }

    // Always close mobile menu on page change
    closeMobileMenu();

    // Scroll to top only if it's a real page change to a NEW page
    if (pageName !== 'landing' || AppState.currentPage !== 'landing') {
        window.scrollTo(0, 0);
    }
}

function initNavigation() {
    // Handle initial state
    const hash = window.location.hash.slice(1);
    if (hash && document.getElementById(`${hash}-page`)) {
        showPage(hash, false);
    } else {
        showPage('landing', false);
    }

    // Listen for back/forward navigation
    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.page) {
            showPage(e.state.page, false);
        } else {
            // Check if hash matches a real page
            const hash = window.location.hash.slice(1);
            if (hash === 'dashboard') {
                showPage('dashboard', false);
            } else if (!hash || hash === '' || ['features', 'how-it-works', 'demo', 'cta'].includes(hash)) {
                // If it's the root or an anchor, just ensure the landing page is shown
                // but DON'T call showPage again if we're already there to avoid scroll reset
                if (AppState.currentPage !== 'landing') {
                    showPage('landing', false);
                }
            }
        }
    });

    // Listen for hash changes (fallback/anchors)
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.slice(1);
        if (!hash) return; // Ignore clear hash

        if (document.getElementById(`${hash}-page`)) {
            if (hash !== AppState.currentPage) {
                showPage(hash, false);
            }
        } else if (document.getElementById(hash)) {
            // It's a section anchor on the current page
            // If we're on dashboard but hash is for landing section, go to landing first
            if (AppState.currentPage !== 'landing' && ['features', 'how-it-works', 'demo', 'cta'].includes(hash)) {
                showPage('landing', false);
            }
        }
    });
}

// Mobile Menu
function toggleMobileMenu() {
    // Only run if mobile menu button is visible (mobile view)
    const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
    if (!mobileMenuBtn || getComputedStyle(mobileMenuBtn).display === 'none') {
        return;
    }

    const navLinks = document.querySelector('.nav-links');
    const navOverlay = document.getElementById('nav-overlay');
    const nav = document.querySelector('.nav');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.classList.toggle('active');
        navLinks.classList.toggle('mobile-open');
        navOverlay?.classList.toggle('active');
        nav?.classList.toggle('mobile-active');

        // Prevent body scroll when menu is open
        document.body.style.overflow = navLinks.classList.contains('mobile-open') ? 'hidden' : '';
    }
}

function closeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navOverlay = document.getElementById('nav-overlay');
    const nav = document.querySelector('.nav');

    if (navLinks?.classList.contains('mobile-open')) {
        mobileMenuBtn?.classList.remove('active');
        navLinks.classList.remove('mobile-open');
        navOverlay?.classList.remove('active');
        nav?.classList.remove('mobile-active');
        document.body.style.overflow = '';
    }
}

// Navbar Scroll Effect
function initNavbarScroll() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    const handleScroll = () => {
        if (window.scrollY > 15) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    };

    // Check initial state
    handleScroll();

    window.addEventListener('scroll', handleScroll);
}

function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
}

// Export for global access
window.toggleMobileMenu = toggleMobileMenu;

// Keyboard Shortcuts
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Cmd/Ctrl + K - Quick Search
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            focusSearch();
        }

        // Escape - Close modals
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

function focusSearch() {
    const searchInput = document.querySelector('.search-bar .input, .search-input-large .input');
    if (searchInput) {
        searchInput.focus();
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal-overlay.active').forEach(modal => {
        modal.classList.remove('active');
    });
}

// Demo Functions
function showDemo() {
    // Smooth scroll to features or show demo modal
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Utility Functions
function formatDate(date) {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
}

function formatRelativeTime(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return formatDate(date);
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
}

function generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9);
}

// Toast Notifications
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} fade-in-up`;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.parentElement.remove()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
    `;

    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Export for global access
window.showPage = showPage;
window.toggleTheme = toggleTheme;
window.showDemo = showDemo;
window.showToast = showToast;
window.closeAllModals = closeAllModals;
window.closeMobileMenu = closeMobileMenu;
