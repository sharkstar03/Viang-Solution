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
let turnstileSiteKey = '';

/**
 * Carga la configuración del servidor
 * @async
 * @function loadConfig
 */
async function loadConfig() {
    try {
        const response = await fetch('/api/config');
        const config = await response.json();
        turnstileSiteKey = config.turnstileSiteKey;
        
        // Una vez que tenemos la clave, inicializamos Turnstile
        if (typeof turnstile !== 'undefined') {
            initTurnstile();
        }
    } catch (error) {
        console.error('Error loading config:', error);
        // Fallback to hardcoded key if server config fails
        turnstileSiteKey = '0x4AAAAAAA1K8g5nQd30WCAD';
        if (typeof turnstile !== 'undefined') {
            initTurnstile();
        }
    }
}

/**
 * Inicializa el widget de Turnstile
 * @function initTurnstile
 */
function initTurnstile() {
    turnstile.render('#turnstile-container', {
        sitekey: turnstileSiteKey,
        callback: function(token) {
            document.getElementById('cf-turnstile-response').value = token;
        }
    });
}

/**
 * Callback function for Cloudflare Turnstile initialization
 * @global
 * @callback onloadTurnstileCallback
 */
window.onloadTurnstileCallback = function () {
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
        return false;
    }

    // Security verification check
    const turnstileToken = document.getElementById('cf-turnstile-response').value;
    if (!turnstileToken) {
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

        // Submit to custom backend API
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formDataObject)
        });

        const result = await response.json();

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
    // Cargar la configuración del servidor
    loadConfig();
    
    // Configurar el manejador del formulario
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }
});