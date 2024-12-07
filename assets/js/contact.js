// Callback global para Turnstile
window.onloadTurnstileCallback = function () {
    turnstile.render('#turnstile-container', {
        sitekey: '0x4AAAAAAA1K8g5nQd30WCAD',
        callback: function(token) {
            document.getElementById('cf-turnstile-response').value = token;
        }
    });
};

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }
});

async function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
        return false;
    }

    const turnstileToken = document.getElementById('cf-turnstile-response').value;
    if (!turnstileToken) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, complete la verificación de seguridad',
            confirmButtonColor: '#3B82F6'
        });
        return false;
    }

    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    try {
        const formData = new FormData(e.target);
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (response.status === 200) {
            Swal.fire({
                icon: 'success',
                title: '¡Mensaje Enviado!',
                text: 'Gracias por contactarnos. Nos pondremos en contacto contigo pronto.',
                confirmButtonColor: '#3B82F6'
            });

            e.target.reset();
            turnstile.reset();
            hideAllErrors();
        } else {
            throw new Error(result.message || 'Error al enviar el formulario');
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al enviar el mensaje. Por favor, intenta nuevamente.',
            confirmButtonColor: '#3B82F6'
        });
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
}

function validateForm() {
    let isValid = true;
    const fields = {
        name: {
            validate: value => value.trim().length >= 2,
            message: 'Por favor, ingrese su nombre completo'
        },
        email: {
            validate: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            message: 'Por favor, ingrese un correo electrónico válido'
        },
        phone: {
            validate: value => /^[\d\s\-\+\(\)]{8,}$/.test(value),
            message: 'Por favor, ingrese un número de teléfono válido'
        },
        service: {
            validate: value => value.trim().length > 0,
            message: 'Por favor, seleccione un servicio'
        },
        message: {
            validate: value => value.trim().length >= 10,
            message: 'Por favor, ingrese un mensaje de al menos 10 caracteres'
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

function hideAllErrors() {
    document.querySelectorAll('[id$="-error"]').forEach(element => {
        element.classList.add('hidden');
    });
    document.querySelectorAll('input, select, textarea').forEach(element => {
        element.classList.remove('border-red-500');
    });
}