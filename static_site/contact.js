// contact.js

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('form-status');

    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent the default form submission

            // Basic client-side validation (browser built-in 'required' handles most)
            if (!contactForm.checkValidity()) {
                formStatus.textContent = 'Please fill out all required fields.';
                formStatus.style.color = 'red';
                return; // Stop if form is not valid
            }

            // --- Placeholder for actual form submission ---
            // In a real application, you would send this data to a backend server
            // using fetch() or XMLHttpRequest.
            // For this static site, we'll just simulate success.

            // You could collect data like this if needed:
            // const formData = new FormData(contactForm);
            // const name = formData.get('name');
            // const email = formData.get('email');
            // const subject = formData.get('subject');
            // const message = formData.get('message');
            // console.log('Form Submitted:', { name, email, subject, message });


            // Simulate successful submission
            formStatus.textContent = 'Thank you for your message! I will get back to you soon.';
            formStatus.style.color = '#1A4D2E'; // Greenish color from your palette

            // Clear the form fields
            contactForm.reset();

            // Optional: Disable the button briefly to prevent multiple clicks
            const submitBtn = document.getElementById('submit-contact-btn');
            if(submitBtn) {
                submitBtn.disabled = true;
                setTimeout(() => {
                    submitBtn.disabled = false;
                    // Clear status message after a delay
                     formStatus.textContent = '';
                }, 5000); // Clear status message after 5 seconds
            } else {
                 // Clear status message after a delay if button not found
                 setTimeout(() => {
                    formStatus.textContent = '';
                }, 5000);
            }
        });
    }
});