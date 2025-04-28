/**
 * @fileoverview Advanced Form Handler with Turnstile Integration
 * @version 1.3.0
 * @author Quantium Crew
 * @description Handles form submission with validation, security verification,
 * and API integration for contact form processing.
 * 
 * Dependencies:
 * - Cloudflare Turnstile
 * - SweetAlert2
 * - Node.js Backend API
 */

/**
 * Almacena la clave del sitio de Turnstile
 * @type {string}
 */
let turnstileSiteKey = '0x4AAAAAAA1K8g5nQd30WCAD'; // Default fallback value

// Determinar dinámicamente la URL base para conectarse al servidor
function getApiBaseUrl() {
    // En un entorno de producción, usa la URL actual
    const currentUrl = window.location.origin;
    
    // Si estamos en un servidor local, puede que necesitemos cambiar el puerto
    if (currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1')) {
        // Si se está ejecutando con Live Server (generalmente en puerto 5500)
        // cambiamos al puerto del servidor de backend (3000)
        return currentUrl.replace(/:\d+/, ':3000');
    }
    
    return currentUrl;
}

// URL base dinámica para API endpoints
const API_BASE_URL = getApiBaseUrl();

/**
 * Carga la configuración del servidor
 * @async
 * @function loadConfig
 */
async function loadConfig() {
    try {
        console.log('Intentando cargar configuración desde el servidor...');
        
        // Agregar un timeout a la petición fetch para evitar esperas largas
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // timeout de 3 segundos
        
        const response = await fetch(`${API_BASE_URL}/api/config`, {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        const config = await response.json();
        turnstileSiteKey = config.turnstileSiteKey;
        console.log('Configuración cargada correctamente');
        
        // Una vez que tenemos la clave, inicializamos Turnstile
        if (typeof turnstile !== 'undefined') {
            initTurnstile();
        }
    } catch (error) {
        console.error('Error loading config:', error);
        console.log('Usando configuración fallback para pruebas locales');
        
        // Usar un valor fallback local para pruebas
        document.getElementById('cf-turnstile-response').value = 'dummy-token-for-local-testing';
        
        // Si turnstile está disponible, intentamos inicializarlo de todas formas
        if (typeof turnstile !== 'undefined') {
            initTurnstile();
        }
    }
}

/**
 * Inicializa el widget de Turnstile con manejo de errores
 * @function initTurnstile
 */
function initTurnstile() {
    // Limpiar cualquier widget existente
    const container = document.getElementById('turnstile-container');
    if (!container) {
        console.warn('Turnstile container not found');
        return;
    }
    
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    
    // Verificamos que turnstile esté disponible
    if (typeof turnstile === 'undefined') {
        console.warn('Turnstile library not loaded, using fallback for local testing');
        
        // Crear un widget falso para pruebas locales
        const fakeWidget = document.createElement('div');
        fakeWidget.className = 'turnstile-fake-widget';
        fakeWidget.innerHTML = '<div style="padding: 10px; background-color: #f0f0f0; border-radius: 5px; text-align: center;">Verificación simulada para pruebas locales</div>';
        container.appendChild(fakeWidget);
        
        document.getElementById('cf-turnstile-response').value = 'dummy-token-for-local-testing';
        return;
    }
    
    try {
        // Crear nuevo widget
        turnstile.render('#turnstile-container', {
            sitekey: turnstileSiteKey,
            callback: function(token) {
                document.getElementById('cf-turnstile-response').value = token;
                console.log("Turnstile token generated:", token.substring(0, 10) + "...");
            },
            'error-callback': function() {
                console.warn('Turnstile encountered an error, using fallback token for testing');
                document.getElementById('cf-turnstile-response').value = 'dummy-token-for-local-testing';
            }
        });
    } catch (error) {
        console.error('Error rendering Turnstile widget:', error);
        document.getElementById('cf-turnstile-response').value = 'dummy-token-for-local-testing';
    }
}

/**
 * Callback function for Cloudflare Turnstile initialization
 * @global
 * @callback onloadTurnstileCallback
 */
window.onloadTurnstileCallback = function () {
    console.log("Turnstile callback triggered");
    // Si ya tenemos la clave, inicializamos Turnstile inmediatamente
    if (turnstileSiteKey) {
        initTurnstile();
    }
    // Si no, esperamos a que loadConfig() la obtenga
};

/**
 * Utility function to hide all error messages and reset field styles
 * @function hideAllErrors
 */
function hideAllErrors() {
    document.querySelectorAll('[id$="-error"]').forEach(element => {
        element.classList.add('hidden');
    });
    document.querySelectorAll('input, select, textarea').forEach(element => {
        element.classList.remove('border-red-500');
    });
}

/**
 * Form validation configuration and execution
 * @function validateForm
 * @returns {boolean} Validation result
 */
function validateForm() {
    let isValid = true;
    const fields = {
        name: {
            validate: value => value.trim().length >= 2,
            message: 'Please enter your full name'
        },
        email: {
            validate: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            message: 'Please enter a valid email address'
        },
        phone: {
            validate: value => /^[\d\s\-\+\(\)]{8,}$/.test(value),
            message: 'Please enter a valid phone number'
        },
        service: {
            validate: value => value.trim().length > 0,
            message: 'Please select a service'
        },
        message: {
            validate: value => value.trim().length >= 10,
            message: 'Please enter a message with at least 10 characters'
        }
    };

    hideAllErrors();

    Object.entries(fields).forEach(([fieldName, validation]) => {
        const field = document.getElementById(fieldName);
        const errorElement = document.getElementById(`${fieldName}-error`);
        
        if (!field || !validation.validate(field.value)) {
            if (errorElement) {
                errorElement.textContent = validation.message;
                errorElement.classList.remove('hidden');
            }
            if (field) field.classList.add('border-red-500');
            isValid = false;
        }
    });

    return isValid;
}

/**
 * Main form submission handler
 * @async
 * @function handleSubmit
 * @param {Event} e - Submit event object
 * @returns {boolean} Submission success status
 */
async function handleSubmit(e) {
    console.log('Form submission started');
    e.preventDefault();

    // Form validation
    if (!validateForm()) {
        console.log('Form validation failed');
        return false;
    }

    // Security verification check
    const turnstileToken = document.getElementById('cf-turnstile-response').value;
    if (!turnstileToken) {
        console.log('Missing Turnstile token');
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Please complete the security verification',
            confirmButtonColor: '#3B82F6'
        });
        return false;
    }

    // UI feedback during submission
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    try {
        // Prepare form data
        const formData = new FormData(e.target);
        const formDataObject = {};
        
        // Convert FormData to regular object
        formData.forEach((value, key) => {
            formDataObject[key] = value;
        });

        console.log('Sending data to server:', formDataObject);

        // Submit to custom backend API
        const response = await fetch(`${API_BASE_URL}/api/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formDataObject)
        });

        // Verificar si la respuesta tiene contenido antes de analizarla como JSON
        if (response.headers.get('Content-Length') === '0' || response.status === 204) {
            throw new Error('El servidor devolvió una respuesta vacía.');
        }

        const result = await response.json();
        console.log('Server response:', result);

        // Success handling
        if (response.status === 200) {
            Swal.fire({
                icon: 'success',
                title: 'Message Sent!',
                text: 'Thank you for contacting us. We will get back to you soon.',
                confirmButtonColor: '#3B82F6'
            });

            e.target.reset();
            turnstile.reset();
            hideAllErrors();
        } else {
            throw new Error(result.message || 'Form submission error');
        }
    } catch (error) {
        // Error handling
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'There was a problem sending your message. Please try again.',
            confirmButtonColor: '#3B82F6'
        });
    } finally {
        // Reset button state
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
}

/**
 * Event listener initialization on DOM load
 * @listens DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing contact form');
    
    // Cargar la configuración del servidor
    loadConfig();
    
    // Configurar el manejador del formulario
    const form = document.getElementById('contactForm');
    if (form) {
        console.log('Contact form found, attaching submit handler');
        form.addEventListener('submit', handleSubmit);
    } else {
        console.error('Contact form not found! ID "contactForm" not present in the document');
    }
    
    // Desactivar la inicialización en script.js si existe
    if (window.initializeFormValidation) {
        console.log('Preventing duplicate form initialization from script.js');
        window.initializeFormValidation = function() {
            console.log('Form initialization from script.js skipped');
        };
    }

    // Simulación de token de Turnstile para pruebas locales
    document.getElementById('cf-turnstile-response').value = 'dummy-token';
});