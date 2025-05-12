// contact.js
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('form-status');
    const submitBtn = document.getElementById('submit-contact-btn');

    if (contactForm && formStatus && submitBtn) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent default HTML form submission

            if (!contactForm.checkValidity()) {
                contactForm.reportValidity(); // Show browser's built-in validation messages
                formStatus.textContent = 'Please fill out all required fields correctly.';
                formStatus.style.color = 'red';
                return;
            }

            const formData = new FormData(contactForm);
            const originalButtonText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            formStatus.textContent = ''; // Clear previous status

            fetch(contactForm.action, { // Uses the action URL from your form tag
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json' // Important for Formspree AJAX
                }
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    return response.json().then(data => {
                        throw new Error(data.error || 'Oops! There was a problem submitting your form.');
                    });
                }
            })
            .then(data => {
                formStatus.textContent = "Thanks for your message! I'll get back to you soon.";
                formStatus.style.color = '#1A4D2E'; // Your success color
                contactForm.reset();
            })
            .catch(error => {
                formStatus.textContent = error.message || 'Oops! There was a problem submitting your form. Please try again.';
                formStatus.style.color = 'red';
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = originalButtonText;
                setTimeout(() => {
                    formStatus.textContent = '';
                }, 7000);
            });
        });
    }
});