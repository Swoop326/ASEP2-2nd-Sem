document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('foundItemForm');
  const dateInput = document.getElementById('dateFound');
  const submitBtn = form.querySelector('.submit-btn');
  const countryCodeSelect = form.querySelector('#countryCode');
  const contactInput = form.querySelector('#contact');

  // Restrict future dates
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('max', today);
  }

  // Handle form submission
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';

      const formData = new FormData(form);

      // Combine country code and contact number
      const countryCode = countryCodeSelect.value;
      const contact = contactInput.value;
      formData.set('contact', `${countryCode}${contact}`); // Ensure country code is included

      try {
        const response = await fetch('http://localhost:5500/api/submit-found-item', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          alert(result.message || 'Item submitted successfully!');
          form.reset();
          countryCodeSelect.value = '+91'; // Reset country code to default
        } else {
          alert(result.message || 'Submission failed. Try again.');
        }
      } catch (error) {
        alert('An error occurred. Please try again later.');
        console.error('Submission error:', error);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Report';
      }
    });
  }
});
