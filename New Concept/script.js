   /* ── Scroll reveal ── */
    (function () {
      const revealEls = document.querySelectorAll('.reveal');
      if (!('IntersectionObserver' in window)) {
        revealEls.forEach(el => el.classList.add('visible'));
        return;
      }
      const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      revealEls.forEach(el => io.observe(el));
    }());

    /* ── Nav border depth on scroll ── */
    (function () {
      const nav = document.querySelector('.site-nav');
      window.addEventListener('scroll', () => {
        nav.style.borderBottomColor = window.scrollY > 20 ? 'var(--rule)' : 'var(--rule-light)';
      }, { passive: true });
    }());

    /* ── Sticky nav: highlight active section on scroll ── */
    (function () {
      const links = document.querySelectorAll('.nav-link');
      const sections = document.querySelectorAll('.portfolio-section[id]');

      // Map section id → nav link
      const linkMap = {};
      links.forEach(link => {
        const id = link.getAttribute('href').replace('#', '');
        linkMap[id] = link;
      });

      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            links.forEach(l => l.classList.remove('is-active'));
            const active = linkMap[entry.target.id];
            if (active) active.classList.add('is-active');
          }
        });
      }, {
        rootMargin: '-48px 0px -60% 0px', // fire when section hits top of viewport (offset by nav height)
        threshold: 0
      });

      sections.forEach(s => observer.observe(s));
    }());


    /* ── Role lens toggle ── */
    (function () {
      const buttons = document.querySelectorAll('.lens-btn');
      const blocks  = document.querySelectorAll('.lens-block');

      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          const lens = btn.dataset.lens;

          // Update button state
          buttons.forEach(b => {
            b.classList.remove('is-active');
            b.setAttribute('aria-pressed', 'false');
          });
          btn.classList.add('is-active');
          btn.setAttribute('aria-pressed', 'true');

          // Show matching block
          blocks.forEach(block => {
            if (block.id === 'lens-' + lens) {
              block.classList.add('is-visible');
            } else {
              block.classList.remove('is-visible');
            }
          });
        });
      });
    }());


    /* ── Progressive disclosure toggles (models + cases) ── */
    (function () {
      const toggles = document.querySelectorAll('.expand-toggle');

      toggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
          const expanded = toggle.getAttribute('aria-expanded') === 'true';
          const panelId  = toggle.getAttribute('aria-controls');
          const panel    = document.getElementById(panelId);

          toggle.setAttribute('aria-expanded', String(!expanded));
          panel.classList.toggle('is-open', !expanded);

          // Update label
          const baseLabel = toggle.textContent.trim();
          if (!expanded) {
            toggle.textContent = baseLabel.replace('↓', '↑');
          } else {
            toggle.textContent = baseLabel.replace('↑', '↓');
          }
        });
      });
    }());


    /* ── Contact form: minimal client-side validation + UX ── */
    (function () {
      const form    = document.getElementById('portfolio-contact-form');
      const success = document.getElementById('form-success');

      if (!form) return;

      form.addEventListener('submit', function (e) {
        e.preventDefault();

        const requiredFields = form.querySelectorAll('[required]');
        let valid = true;

        requiredFields.forEach(field => {
          field.style.borderColor = ''; // reset
          if (!field.value.trim()) {
            valid = false;
            field.style.borderColor = '#C94040';
            field.focus();
          }
        });

        if (!valid) return;

        // On real deployment: replace with fetch() to your form handler
        // e.g. Netlify forms, Formspree, or your own endpoint.
        // For now, show success state.
        form.querySelectorAll('input, textarea, select, button').forEach(el => {
          el.setAttribute('disabled', 'disabled');
        });
        success.classList.add('is-visible');
        success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }());