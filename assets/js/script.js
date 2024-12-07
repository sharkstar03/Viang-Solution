/*
==============================================
JAVASCRIPT TABLE OF CONTENTS
==============================================

1. Configuraciones Globales
2. Main Initialization
3. Mobile Menu Functionality
4. Text Animation System
5. Carousel Systems
6. Counter Animation
7. Form Validation System with Cloudflare Turnstile
8. Utility Functions

==============================================
*/

// 1. Configuraciones Globales
const CONFIG = {
    counter: {
        speed: 300,
    },
    textAnimation: {
        texts: [
            'Pulimientos y Limpiezas de Pisos',
            'Limpieza De Muebles y Alfombras',
            'Multi Servicios',
            'Instalaciones De Todo Tipo',
            'Pintura',
            'Limpieza Comercial'
        ],
        typeSpeed: 100,
        eraseSpeed: 50,
        pauseDuration: 2000
    },
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
    splideConfig: {
        type: 'loop',
        perPage: 4,
        perMove: 1,
        autoplay: true,
        interval: 2000,
        pagination: false,
        arrows: true,
        gap: '2rem',
        breakpoints: {
            768: {
                perPage: 2,
            },
            480: {
                perPage: 1,
            },
        }
    },
    turnstile: {
        siteKey: '0x4AAAAAAARKDXj-fA28ww1W', // Reemplazar con tu clave real
    }
};

// 2. Main Initialization
document.addEventListener('DOMContentLoaded', function() {
    // Funciones principales
    initializeMobileMenu();
    initializeTextAnimation();
    initializeCarousels();
    initializeCounters();
    initializeFormValidation();
    updateCopyrightYear();

    // Medidas de seguridad
    applySecurityMeasures();
});

// 3. Mobile Menu Functionality
function initializeMobileMenu() {
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    menuBtn?.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        mobileMenu?.classList.toggle('hidden');
    });

    document.addEventListener('click', (event) => {
        if (!menuBtn?.contains(event.target) && !mobileMenu?.contains(event.target)) {
            mobileMenu?.classList.remove('active');
            mobileMenu?.classList.add('hidden');
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            mobileMenu?.classList.remove('active');
            mobileMenu?.classList.add('hidden');
        }
    });
}

// 4. Text Animation System
function initializeTextAnimation() {
    const textElement = document.getElementById('typed-text');
    let currentIndex = 0;

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

// 5. Carousel Systems
function initializeCarousels() {
    // Swiper initialization
    new Swiper(".clientSwiper", CONFIG.swiperConfig);
    
    // Splide initialization
    new Splide('.splide', CONFIG.splideConfig).mount();
}

// 6. Counter Animation
function initializeCounters() {
    const counters = document.querySelectorAll('.counter');
    
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

// 7. Form Validation System with Cloudflare Turnstile
function initializeFormValidation() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', validateForm);
        
        // Renderizar el widget de Turnstile
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

function validateForm(event) {
    event.preventDefault();

    const token = document.getElementById('cf-turnstile-response').value;
    if (!token) {
        alert('Por favor, completa la verificación de seguridad');
        return false;
    }

    const form = event.target;
    const formData = new FormData(form);

    // Deshabilitar el botón de envío
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;

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
        // Rehabilitar el botón de envío
        if (submitButton) submitButton.disabled = false;
    });

    return false;
}

// 8. Utility Functions
function updateCopyrightYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// Scroll suave para los enlaces del menú
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Manejo del preloader
class Loader {
    constructor() {
        this.loader = document.getElementById('loader');
        this.setupLoader();
    }

    setupLoader() {
        if (!this.loader) return;
        
        const handleLoad = () => {
            this.hideLoader();
            window.removeEventListener('load', handleLoad);
        };

        window.addEventListener('load', handleLoad);
    }

    hideLoader() {
        if (!this.loader) return;
        
        this.loader.classList.add('fade-out');
        
        this.loader.addEventListener('transitionend', () => {
            this.loader.style.display = 'none';
            this.loader.remove(); // Limpia el DOM
        }, { once: true });
    }
}

// Inicializar
const pageLoader = new Loader();