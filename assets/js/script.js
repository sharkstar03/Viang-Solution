/**
 * @fileoverview Core JavaScript functionality for service-based website
 * @version 1.1.1
 * @author Quantium Crew
 * @description This file contains all interactive functionality including animations,
 * form handling, security measures, and UI components.
 */

/**
 * Global configuration object containing all adjustable parameters for the application
 * @constant {Object}
 */
const CONFIG = {
    /** @property {Object} counter - Configuration for number counter animations */
    counter: {
        speed: 300, // Animation duration in milliseconds
    },
    
    /** @property {Object} textAnimation - Settings for the typing animation system */
    textAnimation: {
        /** @property {Array<string>} texts - Array of texts to display in rotation */
        texts: [
            'Pulimientos y Limpiezas de Pisos',
            'Limpieza De Muebles y Alfombras',
            'Multi Servicios',
            'Instalaciones De Todo Tipo',
            'Pintura',
            'Limpieza Empresarial'
        ],
        typeSpeed: 100,    // Speed of typing animation in milliseconds
        eraseSpeed: 50,    // Speed of erasing animation in milliseconds
        pauseDuration: 2000 // Duration to pause between animations
    },

    /** @property {Object} swiperConfig - Configuration for Swiper carousel */
    swiperConfig: {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
        breakpoints: {
            480: {
                slidesPerView: 2,
                spaceBetween: 20
            },
            768: {
                slidesPerView: 3,
                spaceBetween: 30
            },
            1024: {
                slidesPerView: 4,
                spaceBetween: 40
            }
        }
    },

    /** @property {Object} splideConfig - Configuration for Splide carousel */
    splideConfig: {
        type: 'loop',
        perPage: 4,
        perMove: 1,
        autoplay: true,
        interval: 2000,
        pagination: false,
        arrows: true,
        gap: '2rem',
        speed: 1000, /* Adjust speed for smoother transition */
        pauseOnHover: false, /* Ensure continuous movement */
        breakpoints: {
            768: { perPage: 2 },
            480: { perPage: 1 }
        }
    },

    /** @property {Object} turnstile - Cloudflare Turnstile configuration */
    turnstile: {
        siteKey: '0x4AAAAAAARKDXj-fA28ww1W'
    }
};

/**
 * Main initialization function that runs when DOM is fully loaded
 * Sets up all core functionality and event listeners
 * @function
 * @listens DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeMobileMenu();
    initializeTextAnimation();
    initializeCarousels();
    initializeCounters();
    initializeFormValidation();
    updateCopyrightYear();
});

/**
 * Initializes the mobile menu functionality
 * Handles menu toggling, click outside closing, and responsive behavior
 * @function
 */
function initializeMobileMenu() {
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    // Toggle menu on button click
    menuBtn?.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        mobileMenu?.classList.toggle('hidden');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
        if (!menuBtn?.contains(event.target) && !mobileMenu?.contains(event.target)) {
            mobileMenu?.classList.remove('active');
            mobileMenu?.classList.add('hidden');
        }
    });

    // Handle responsive behavior
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            mobileMenu?.classList.remove('active');
            mobileMenu?.classList.add('hidden');
        }
    });
}

/**
 * Initializes the text animation system
 * Creates a typing effect for displaying service descriptions
 * @async
 * @function
 */
function initializeTextAnimation() {
    const textElement = document.getElementById('typed-text');
    let currentIndex = 0;

    /**
     * Handles the typing and erasing animation sequence
     * @async
     * @function
     */
    async function typeAndErase() {
        const currentText = CONFIG.textAnimation.texts[currentIndex];
        
        // Writing animation
        for(let i = 0; i <= currentText.length; i++) {
            if (textElement) {
                textElement.textContent = currentText.substring(0, i);
                await new Promise(resolve => setTimeout(resolve, CONFIG.textAnimation.typeSpeed));
            }
        }

        await new Promise(resolve => setTimeout(resolve, CONFIG.textAnimation.pauseDuration));

        // Erasing animation
        for(let i = currentText.length; i >= 0; i--) {
            if (textElement) {
                textElement.textContent = currentText.substring(0, i);
                await new Promise(resolve => setTimeout(resolve, CONFIG.textAnimation.eraseSpeed));
            }
        }

        currentIndex = (currentIndex + 1) % CONFIG.textAnimation.texts.length;
        await new Promise(resolve => setTimeout(resolve, 500));
        typeAndErase();
    }

    if (textElement) {
        typeAndErase();
    }
}

/**
 * Initializes all carousel components
 * Sets up Splide carousel with configured options
 * @function
 */
function initializeCarousels() {
    new Splide('.splide', CONFIG.splideConfig).mount();
}

/**
 * Initializes counter animations
 * Uses Intersection Observer for triggering animations when visible
 * @function
 */
function initializeCounters() {
    const counters = document.querySelectorAll('.counter');
    
    /**
     * Handles the counting animation for a single counter element
     * @param {HTMLElement} element - The counter element to animate
     */
    const startCounting = (element) => {
        const target = parseInt(element.getAttribute('data-target'));
        const count = +element.innerText;
        const increment = target / CONFIG.counter.speed;

        if (count < target) {
            element.innerText = Math.ceil(count + increment);
            setTimeout(() => startCounting(element), 1);
        } else {
            element.innerText = target;
        }
    }

    // Set up intersection observer for triggering animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startCounting(entry.target);
                observer.unobserve(entry.target);
            }
        });
    });

    counters.forEach(counter => observer.observe(counter));
}

/**
 * Initializes form validation system with Cloudflare Turnstile
 * Handles form submission and validation
 * @function
 */
function initializeFormValidation() {
    // Si ya existe el formulario con ID 'contactForm', este JS no hace nada
    if (document.getElementById('contactForm')) {
        console.log('Form already handled by contact.js');
        return;
    }

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', validateForm);

        // Initialize Turnstile
        turnstile.ready(() => {
            turnstile.render('#turnstile-container', {
                sitekey: CONFIG.turnstile.siteKey,
                callback: function(token) {
                    document.getElementById('cf-turnstile-response').value = token;
                },
            });
        });
    }
}


/**
 * Validates and handles form submission
 * @param {Event} event - The form submission event
 * @returns {boolean} False to prevent default form submission
 */
function validateForm(event) {
    event.preventDefault();

    const token = document.getElementById('cf-turnstile-response').value;
    if (!token) {
        alert('Por favor, completa la verificación de seguridad');
        return false;
    }

    const form = event.target;
    const formData = new FormData(form);

    // Handle form submission state
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;

    // Submit form data to server
    fetch('/api/contact.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('¡Mensaje enviado con éxito!');
            form.reset();
            turnstile.reset();
        } else {
            alert(data.message || 'Error al enviar el mensaje');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al enviar el mensaje. Por favor, intenta nuevamente.');
    })
    .finally(() => {
        if (submitButton) submitButton.disabled = false;
    });

    return false;
}

/**
 * Updates the copyright year in the footer
 * @function
 */
function updateCopyrightYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// Initialize smooth scroll behavior for menu links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

/**
 * Loader class for handling page preloader functionality
 * @class
 */
class Loader {
    /**
     * Creates a new Loader instance
     * @constructor
     */
    constructor() {
        this.loader = document.getElementById('loader');
        this.setupLoader();
    }

    /**
     * Sets up the loader event listeners
     * @private
     */
    setupLoader() {
        if (!this.loader) return;
        
        const handleLoad = () => {
            this.hideLoader();
            window.removeEventListener('load', handleLoad);
        };

        window.addEventListener('load', handleLoad);
    }

    /**
     * Hides the loader with a fade-out animation
     * @private
     */
    hideLoader() {
        if (!this.loader) return;
        
        this.loader.classList.add('fade-out');
        
        this.loader.addEventListener('transitionend', () => {
            this.loader.style.display = 'none';
            this.loader.remove(); // Clean up DOM
        }, { once: true });
    }
}

// Initialize loader
const pageLoader = new Loader();