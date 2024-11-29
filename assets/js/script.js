document.addEventListener('DOMContentLoaded', function() {
    // Menú móvil
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    menuBtn?.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
    });

    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', (event) => {
        if (!menuBtn?.contains(event.target) && !mobileMenu?.contains(event.target)) {
            mobileMenu?.classList.remove('active');
        }
    });

    // Cerrar menú al cambiar tamaño de ventana
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            mobileMenu?.classList.remove('active');
        }
    });

    // Typed Text Animation
    const textElement = document.getElementById('typed-text');
    const texts = [
        'Limpieza',
        'Pulimiento',
        'Instalaciones',
        'Mantenimiento',
        'Reparaciones'
    ];
    let currentIndex = 0;

    async function typeAndErase() {
        const currentText = texts[currentIndex];
        
        // Escribir la palabra
        for(let i = 0; i <= currentText.length; i++) {
            if (textElement) {
                textElement.textContent = currentText.substring(0, i);
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        await new Promise(resolve => setTimeout(resolve, 2000));

        // Borrar la palabra
        for(let i = currentText.length; i >= 0; i--) {
            if (textElement) {
                textElement.textContent = currentText.substring(0, i);
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        }

        currentIndex = (currentIndex + 1) % texts.length;
        await new Promise(resolve => setTimeout(resolve, 500));
        typeAndErase();
    }

    if (textElement) {
        typeAndErase();
    }

    // Inicialización del Swiper
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
    
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});
