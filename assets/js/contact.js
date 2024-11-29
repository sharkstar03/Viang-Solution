/*
==============================================
FORM VALIDATION AND SUBMISSION TABLE OF CONTENTS
==============================================

1. Form Initialization
2. Form Submission Handler
3. Form Validation
    3.1 Main Validation Function
    3.2 Real-time Validation
4. Utility Functions
5. Error Handling

==============================================
*/

// 1. Form Initialization
/**
 * Initialize form handlers when DOM is fully loaded
 * Sets up submission and validation listeners
 */
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    
    // 2. Form Submission Handler
    /**
     * Handle form submission
     * Prevents default form action, validates and sends data
     * @param {Event} e - Form submission event
     */
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Collect form data
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            service: formData.get('service'),
            message: formData.get('message')
        };
        
        try {
            // Send data to backend
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
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

// 3.1 Main Validation Function
/**
 * Validates all form fields before submission
 * @param {Event} event - Form submission event
 * @returns {boolean} - Whether the form is valid
 */
function validateForm(event) {
    event.preventDefault();
    
    const form = document.getElementById('contactForm');
    const fields = ['name', 'email', 'service', 'message'];
    let isValid = true;
    
    // Clear previous error messages
    fields.forEach(field => {
        document.getElementById(`${field}-error`).classList.add('hidden');
    });
    
    // Validate each field
    fields.forEach(field => {
        const element = document.getElementById(field);
        
        // Check for empty required fields
        if (!element.value) {
            document.getElementById(`${field}-error`).classList.remove('hidden');
            isValid = false;
        }
        
        // Special email validation
        if (field === 'email' && element.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(element.value)) {
                document.getElementById('email-error').classList.remove('hidden');
                isValid = false;
            }
        }
    });
    
    // Submit if valid
    if (isValid) {
        form.submit();
    }
    
    return false;
}

// 3.2 Real-time Validation
/**
 * Set up real-time validation on form fields
 * Validates fields when they lose focus
 */
document.querySelectorAll('#contactForm input, #contactForm textarea, #contactForm select')
    .forEach(element => {
        element.addEventListener('blur', function() {
            // Show/hide error messages on blur
            if (!this.value && this.required) {
                document.getElementById(`${this.id}-error`).classList.remove('hidden');
            } else {
                document.getElementById(`${this.id}-error`).classList.add('hidden');
            }
        });
    });