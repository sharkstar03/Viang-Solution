/*
==============================================
JAVASCRIPT TABLE OF CONTENTS
==============================================

1. Main Initialization
2. Mobile Menu Functionality
    2.1 Toggle Menu
    2.2 Click Outside Handler
    2.3 Window Resize Handler
3. Text Animation System
    3.1 Typed Text Configuration
    3.2 Animation Functions
4. Carousel Systems
    4.1 Swiper Initialization
    4.2 Splide Carousel
5. Counter Animation
    5.1 Counter Configuration
    5.2 Intersection Observer
6. Utility Functions
    6.1 Year Update

==============================================
*/

// 1. Main Initialization
// Wait for DOM to be fully loaded before executing scripts
document.addEventListener('DOMContentLoaded', function() {
    
    // 2. Mobile Menu Functionality
    // 2.1 Toggle Menu - Initialize mobile menu elements
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    // Add click event to toggle menu visibility
    menuBtn?.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
    });

    // 2.2 Click Outside Handler - Close menu when clicking outside
    document.addEventListener('click', (event) => {
        if (!menuBtn?.contains(event.target) && !mobileMenu?.contains(event.target)) {
            mobileMenu?.classList.remove('active');
        }
    });

    // 2.3 Window Resize Handler - Close mobile menu on window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            mobileMenu?.classList.remove('active');
        }
    });

    // 3. Text Animation System
    // 3.1 Typed Text Configuration
    const textElement = document.getElementById('typed-text');
    const texts = [
        'Limpieza Pos Inundaciones',
        'Pulimiento de todo Tipo de Pisos',
        'Instalaciones',
        'Mantenimiento',
        'Reparaciones',
        'Pintura'
    ];
    let currentIndex = 0;

    // 3.2 Animation Functions
    /**
     * Handles the typing and erasing animation for text
     * Cycles through the texts array indefinitely
     */
    async function typeAndErase() {
        const currentText = texts[currentIndex];
        
        // Writing animation
        for(let i = 0; i <= currentText.length; i++) {
            if (textElement) {
                textElement.textContent = currentText.substring(0, i);
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        // Pause at the end of writing
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Erasing animation
        for(let i = currentText.length; i >= 0; i--) {
            if (textElement) {
                textElement.textContent = currentText.substring(0, i);
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        }

        // Prepare for next text
        currentIndex = (currentIndex + 1) % texts.length;
        await new Promise(resolve => setTimeout(resolve, 500));
        typeAndErase();
    }

    // Initialize typing animation if element exists
    if (textElement) {
        typeAndErase();
    }

    // 4. Carousel Systems
    // 4.1 Swiper Initialization
    /**
     * Initialize Swiper carousel with responsive breakpoints
     * and autoplay functionality
     */
    var swiper = new Swiper(".clientSwiper", {
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
    });
    
    // 6.1 Year Update - Update copyright year
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});

// 4.2 Splide Carousel
/**
 * Initialize Splide carousel with custom configuration
 * Includes responsive breakpoints and autoplay
 */
document.addEventListener('DOMContentLoaded', function() {
    new Splide('.splide', {
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
    }).mount();
});

// 5. Counter Animation
// 5.1 Counter Configuration
const counters = document.querySelectorAll('.counter');
const speed = 200; // Animation speed for counters

/**
 * Animates a counter from 0 to its target value
 * @param {HTMLElement} element - The counter element to animate
 */
const startCounting = (element) => {
    const target = parseInt(element.getAttribute('data-target'));
    const count = +element.innerText;
    const increment = target / speed;

    if (count < target) {
        element.innerText = Math.ceil(count + increment);
        setTimeout(() => startCounting(element), 1);
    } else {
        element.innerText = target;
    }
}

// 5.2 Intersection Observer
/**
 * Creates an observer to start counter animation when
 * elements come into view
 */
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counter = entry.target;
            startCounting(counter);
            observer.unobserve(counter);
        }
    });
});

// Initialize observers for all counter elements
counters.forEach(counter => observer.observe(counter));