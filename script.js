/* ================================================================
   ALEX CARTER — PORTFOLIO JAVASCRIPT
   ================================================================
   Sections:
   1. Custom Cursor
   2. Navbar scroll effect
   3. Mobile hamburger menu
   4. Scroll reveal animations
   5. Card tilt effect (cursor interaction)
   6. Smooth scroll for nav links
   7. Contact form (placeholder handler)
   ================================================================ */

(function () {
  'use strict';

  /* ============================================================
     1. CUSTOM CURSOR
  ============================================================ */
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');

  // Only enable on non-touch (pointer: fine) devices
  const hasPointer = true;

  if (hasPointer && dot && ring) {
    let ringX = 0, ringY = 0;
    let mouseX = 0, mouseY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // Dot follows immediately
      dot.style.left  = mouseX + 'px';
      dot.style.top   = mouseY + 'px';
    });

    // Ring follows with a slight lag for buttery feel
    function animateRing() {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      ring.style.left = ringX + 'px';
      ring.style.top  = ringY + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    // Expand ring on interactive elements
    const interactables = 'a, button, [data-tilt], input, textarea, .social-link, .card-icon-link';
    document.querySelectorAll(interactables).forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
      dot.style.opacity  = '0';
      ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      dot.style.opacity  = '1';
      ring.style.opacity = '1';
    });
  }

  /* ============================================================
     2. NAVBAR: Transparent → blurred on scroll
  ============================================================ */
  const navbar = document.getElementById('navbar');

  function handleNavScroll() {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll(); // Run once on load

  /* ============================================================
     3. MOBILE HAMBURGER MENU
  ============================================================ */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
    // Prevent body scroll when menu is open
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  // Close menu when a nav link is tapped
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* ============================================================
     4. SCROLL REVEAL ANIMATIONS
     Uses IntersectionObserver for performance
  ============================================================ */
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target); // Animate once
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback: show all immediately
    revealElements.forEach(el => el.classList.add('visible'));
  }

  /* ============================================================
     5. CARD TILT EFFECT (cursor interaction)
     Subtle 3D tilt on cards following mouse position
  ============================================================ */
  const tiltCards = document.querySelectorAll('[data-tilt]');

  tiltCards.forEach(card => {
    let isHovering = false;
    let rafId = null;

    card.addEventListener('mouseenter', () => { isHovering = true; });

    card.addEventListener('mousemove', (e) => {
      if (!isHovering) return;
      if (rafId) cancelAnimationFrame(rafId);

      rafId = requestAnimationFrame(() => {
        const rect   = card.getBoundingClientRect();
        const cx     = rect.left + rect.width  / 2;
        const cy     = rect.top  + rect.height / 2;
        const dx     = e.clientX - cx;
        const dy     = e.clientY - cy;
        // ✏️ EDITABLE: Adjust 6 / 8 to control tilt intensity
        const rotateX = -(dy / (rect.height / 2)) * 5;
        const rotateY =  (dx / (rect.width  / 2)) * 5;
        card.style.transform = `translateY(-6px) perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });
    });

    card.addEventListener('mouseleave', () => {
      isHovering = false;
      if (rafId) cancelAnimationFrame(rafId);
      card.style.transform = '';
      card.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1), border-color 0.3s, box-shadow 0.3s';
      setTimeout(() => { card.style.transition = ''; }, 500);
    });
  });

  /* ============================================================
     6. SMOOTH SCROLL FOR NAV LINKS & ANCHOR BUTTONS
     (CSS scroll-behavior handles basic, JS adds offset for navbar)
  ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const navHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-h'),
        10
      ) || 72;

      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ============================================================
   7. CONTACT FORM — EmailJS Integration
============================================================ */
emailjs.init("tX-yyShHEnDhSN3cy");

const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = contactForm.querySelector('button[type="submit"]');
    const originalHTML = btn.innerHTML;

    // Form values
    const name = contactForm.name.value.trim();
    const email = contactForm.email.value.trim();
    const message = contactForm.message.value.trim();

    // Validation
    if (!name || !email || !message) {
      showFormStatus(contactForm, 'Please fill in all fields.', 'error');
      return;
    }

    if (!isValidEmail(email)) {
      showFormStatus(contactForm, 'Please enter a valid email address.', 'error');
      return;
    }

    // Loading state
    btn.disabled = true;
    btn.innerHTML = '<span>Sending...</span>';

    try {

      await emailjs.send(
        "service_gbyd8ka",
        "template_nj0ungg",
        {
          from_name: name,
          from_email: email,
          message: message,
        }
      );

      // Success
      showFormStatus(contactForm, '✓ Message sent successfully!', 'success');

      contactForm.reset();

    } catch (error) {

      console.error(error);

      showFormStatus(
        contactForm,
        'Failed to send message. Please try again.',
        'error'
      );

    } finally {

      btn.disabled = false;
      btn.innerHTML = originalHTML;

    }
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFormStatus(form, message, type) {

  const existing = form.querySelector('.form-status');

  if (existing) existing.remove();

  const status = document.createElement('p');

  status.className = 'form-status';

  status.textContent = message;

  status.style.cssText = `
    font-size: 0.85rem;
    margin-top: 4px;
    padding: 10px 14px;
    border-radius: 6px;
    border: 1px solid ${
      type === 'success'
        ? 'rgba(34,197,94,0.25)'
        : 'rgba(239,68,68,0.25)'
    };
    background: ${
      type === 'success'
        ? 'rgba(34,197,94,0.08)'
        : 'rgba(239,68,68,0.08)'
    };
    color: ${
      type === 'success'
        ? '#4ade80'
        : '#f87171'
    };
  `;

  form.appendChild(status);

  setTimeout(() => status.remove(), 5000);
}
  /* ============================================================
     8. ACTIVE NAV LINK on scroll (section highlighting)
  ============================================================ */
  const sections   = document.querySelectorAll('section[id]');
  const allNavLinks = document.querySelectorAll('.nav-link');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          allNavLinks.forEach(link => {
            link.style.color = '';
            if (link.getAttribute('href') === '#' + entry.target.id) {
              link.style.color = '#f8fafc';
            }
          });
        }
      });
    },
    { threshold: 0.45 }
  );

  sections.forEach(s => sectionObserver.observe(s));

})();
