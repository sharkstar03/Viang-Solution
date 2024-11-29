document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Recoger los datos del formulario
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            service: formData.get('service'),
            message: formData.get('message')
        };

        try {
            // Aquí iría la llamada a tu backend
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                // Mostrar mensaje de éxito
                alert('Message sent successfully! We will contact you soon.');
                form.reset();
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            alert('There was an error sending your message. Please try again later.');
            console.error('Error:', error);
        }
    });
});

function validateForm(event) {
    event.preventDefault();
    
    const form = document.getElementById('contactForm');
    const fields = ['name', 'email', 'service', 'message'];
    let isValid = true;

    // Limpiar mensajes de error previos
    fields.forEach(field => {
        document.getElementById(`${field}-error`).classList.add('hidden');
    });

    // Validar cada campo
    fields.forEach(field => {
        const element = document.getElementById(field);
        if (!element.value) {
            document.getElementById(`${field}-error`).classList.remove('hidden');
            isValid = false;
        }
        
        // Validación específica para email
        if (field === 'email' && element.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(element.value)) {
                document.getElementById('email-error').classList.remove('hidden');
                isValid = false;
            }
        }
    });

    if (isValid) {
        // Aquí puedes enviar el formulario
        form.submit();
    }

    return false;
}

// Opcional: Validación en tiempo real
document.querySelectorAll('#contactForm input, #contactForm textarea, #contactForm select').forEach(element => {
    element.addEventListener('blur', function() {
        if (!this.value && this.required) {
            document.getElementById(`${this.id}-error`).classList.remove('hidden');
        } else {
            document.getElementById(`${this.id}-error`).classList.add('hidden');
        }
    });
});