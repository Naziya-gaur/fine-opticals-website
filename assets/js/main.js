
document.addEventListener('DOMContentLoaded', () => {
  console.log('main.js loaded');

  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  const alertBox = document.getElementById('formAlert');

  function showToast(message, type = 'success') {
    const toastEl = document.getElementById('formToast');
    const toastMsg = document.getElementById('toastMessage');

    toastEl.className = `toast align-items-center text-bg-${type} border-0`;
    toastMsg.innerText = message;

    const toast = new bootstrap.Toast(toastEl, {
      delay: 5000
    });

    toast.show();
  }

  const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];

  // Toggle menu
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
    });
  }

  // Close menu when any link is clicked
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (mobileMenu) mobileMenu.classList.remove('active');
    });
  });

  const formEl = document.querySelector('.contact-form');
  if (formEl) {
    formEl.addEventListener('submit', async (e) => {
      e.preventDefault();

      const form = e.target;
      const btn = form.querySelector('.btn-submit');
      if (btn) {
        btn.disabled = true;
        btn.innerText = 'Submitting...';
      }

      const data = {
        first_name: form[0].value.trim(),
        last_name: form[1].value.trim(),
        email: form[2].value.trim(),
        phone: form[3].value.trim(),
        message: form[4].value.trim()
      };

      try {
        const geo = await fetch('https://ipapi.co/json/').then(r => r.json());

        Object.assign(data, {
          city: geo.city,
          region: geo.region,
          country: geo.country,
          latitude: geo.latitude,
          longitude: geo.longitude
        });

        console.log('Submitting contact payload:', data);

        const res = await fetch('https://contact-api-jnqk.onrender.com/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        console.log('Response status:', res.status, res.statusText);

        // Safely read response body (handle non-JSON responses)
        let resultBody;
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          resultBody = await res.json();
        } else {
          resultBody = await res.text();
        }

        console.log('Response body:', resultBody);

        if (!res.ok) {
          // Prefer server-provided message when available
          const serverMsg = resultBody && resultBody.message ? resultBody.message : resultBody;
          throw new Error(`Server ${res.status}: ${serverMsg || 'Unknown error'}`);
        }

        showToast('Inquiry submitted successfully!', 'success');
        form.reset();

      } catch (err) {
        showToast(err.message || 'Server error. Please try again.', 'danger');
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerText = 'Submit Inquiry';
        }
      }
    });
  } else {
    console.log('No .contact-form on this page');
  }

});

