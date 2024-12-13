/**
 * @fileoverview Advanced Form Handler with Turnstile Integration
 * @version 1.1.1
 * @author Quantium Crew
 * @description Handles form submission with validation, security verification,
 * and API integration for contact form processing.
 * 
 * Dependencies:
 * - Cloudflare Turnstile
 * - SweetAlert2
 * - Web3Forms API
 */

/**
 * Callback function for Cloudflare Turnstile initialization
 * Renders the security verification widget
 * @global
 * @callback onloadTurnstileCallback
 */
window.onloadTurnstileCallback = function () {
    turnstile.render('#turnstile-container', {
        sitekey: '0x4AAAAAAA1K8g5nQd30WCAD',
        callback: function(token) {
            document.getElementById('cf-turnstile-response').value = token;
        }
    });
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
 * 
 * Validation Rules:
 * - name: minimum 2 characters
 * - email: valid email format
 * - phone: minimum 8 digits, allows spaces, dashes, plus, parentheses
 * - service: non-empty selection
 * - message: minimum 10 characters
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
 * Processes form data and handles API interaction
 * @async
 * @function handleSubmit
 * @param {Event} e - Submit event object
 * @returns {boolean} Submission success status
 * 
 * Process Flow:
 * 1. Validates form data
 * 2. Verifies Turnstile token
 * 3. Submits to Web3Forms API
 * 4. Handles response and user feedback
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
        // API submission
        const formData = new FormData(e.target);
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
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
 * Sets up form submission handler
 * @listens DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }
});

/**
 * @typedef {Object} ValidationRule
 * @property {function} validate - Validation function that returns boolean
 * @property {string} message - Error message to display
 */

/**
 * @typedef {Object} FormField
 * @property {HTMLElement} field - Form field element
 * @property {HTMLElement} errorElement - Error message element
 */