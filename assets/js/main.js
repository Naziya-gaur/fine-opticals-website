document.addEventListener('DOMContentLoaded', () => {
  console.log('main.js loaded');

  // ================= NAVBAR & MOBILE MENU =================
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
    });
  }

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (mobileMenu) mobileMenu.classList.remove('active');
    });
  });

  // ================= HERO CAROUSEL =================
  const slides = document.querySelectorAll('.hero-bg-carousel .slide');
  if (slides.length > 0) {
    let currentSlide = 0;
    const slideInterval = 5000;

    setInterval(() => {
      slides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add('active');
    }, slideInterval);
  }

  // ================= TOAST HELPER =================
  function showToast(message, type = 'success') {
    const toastEl = document.getElementById('formToast');
    const toastMsg = document.getElementById('toastMessage');

    if (!toastEl || !toastMsg) return;

    toastEl.className = `toast align-items-center text-bg-${type} border-0`;
    toastMsg.innerText = message;

    const toast = new bootstrap.Toast(toastEl, { delay: 5000 });
    toast.show();
  }

  // ================= CONTACT FORM =================
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

      // Fetch IP location with a 1.5-second timeout (non-blocking)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);

        const geoRes = await fetch('https://ipapi.co/json/', { signal: controller.signal });
        clearTimeout(timeoutId);

        if (geoRes.ok) {
          const geo = await geoRes.json();
          Object.assign(data, {
            city: geo.city || '',
            region: geo.region || '',
            country: geo.country_name || '',
            latitude: geo.latitude || null,
            longitude: geo.longitude || null
          });
        }
      } catch (geoErr) {
        console.warn('Geolocation lookup skipped or timed out:', geoErr.message);
      }

      console.log('Submitting contact payload:', data);

      try {
        const res = await fetch('https://contact-api-jnqk.onrender.com/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        console.log('Response status:', res.status, res.statusText);

        let resultBody;
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          resultBody = await res.json();
        } else {
          resultBody = await res.text();
        }

        if (!res.ok) {
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
  }
});