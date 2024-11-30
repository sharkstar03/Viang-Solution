document.addEventListener('DOMContentLoaded', function() {
    initializeFormValidation();
});

function initializeFormValidation() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        // Renderizar el widget de Turnstile
        turnstile.ready(() => {
            turnstile.render('#turnstile-container', {
                sitekey: '0x4AAAAAAA1K8g5nQd30WCAD',
                callback: function(token) {
                    document.getElementById('cf-turnstile-response').value = token;
                },
            });
        });

        contactForm.addEventListener('submit', handleFormSubmit);
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();

    // Validar los campos
    if (!validateFields()) {
        return false;
    }

    // Verificar el token de Turnstile
    const turnstileToken = document.getElementById('cf-turnstile-response').value;
    if (!turnstileToken) {
        alert('Por favor, complete la verificación de seguridad');
        return false;
    }

    // Obtener los datos del formulario
    const formData = new FormData(event.target);

    // Deshabilitar el botón de envío
    const submitButton = event.target.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';
    }

    try {
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            alert('¡Mensaje enviado con éxito!');
            event.target.reset();
            turnstile.reset();
            hideAllErrors();
        } else {
            alert(data.message || 'Error al enviar el mensaje');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al enviar el mensaje. Por favor, intenta nuevamente.');
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Enviar Mensaje';
        }
    }

    return false;
}

function validateFields() {
    let isValid = true;
    const requiredFields = ['name', 'email', 'phone', 'service', 'message'];
    
    hideAllErrors();

    requiredFields.forEach(field => {
        const element = document.getElementById(field);
        const errorElement = document.getElementById(`${field}-error`);
        
        if (!element.value.trim()) {
            showError(errorElement);
            isValid = false;
        } else if (field === 'email' && !validateEmail(element.value)) {
            showError(errorElement);
            isValid = false;
        } else if (field === 'phone' && !validatePhone(element.value)) {
            showError(errorElement);
            isValid = false;
        }
    });

    return isValid;
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    return /^[\d\s\-\+\(\)]{8,}$/.test(phone);
}

function showError(element) {
    if (element) {
        element.classList.remove('hidden');
    }
}

function hideAllErrors() {
    const errorElements = document.querySelectorAll('[id$="-error"]');
    errorElements.forEach(element => {
        element.classList.add('hidden');
    });
}