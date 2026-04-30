
 
//    JAVASCRIPT — mobile nav + scroll reveal
  /* ── Mobile navigation toggle ── */
    const toggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    toggle.addEventListener('click', () => {
      const isOpen = toggle.classList.toggle('open');
      navLinks.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen);
    });

    /* Close mobile nav when a link is clicked */
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('open');
        navLinks.classList.remove('open');
        toggle.setAttribute('aria-expanded', false);
      });
    });

    /* ── Scroll reveal (IntersectionObserver) ──
       Adds .visible class when elements enter viewport.
       Uses .reveal for single elements and .reveal-stagger
       for groups — CSS handles the staggered delay.         */
    const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target); // animate once
            }
          });
        },
        { threshold: 0.12 }
      );
      revealEls.forEach(el => observer.observe(el));
    } else {
      /* Fallback: show all immediately if IO not supported */
      revealEls.forEach(el => el.classList.add('visible'));
    }
  
    /* ── Elevate nav on scroll for subtle depth cue ── */
    const nav = document.querySelector('.site-nav');
    window.addEventListener('scroll', () => {
      nav.style.borderBottomColor = window.scrollY > 20
        ? 'var(--rule)'
        : 'var(--rule-light)';
    }, { passive: true });



    /* ── Sidebar scroll-spy ──
       Highlights the sidebar nav link matching the
       section currently most visible in the viewport. */
    const sideNavItems = document.querySelectorAll('.cv-sidebar__nav-item');
    const cvSections   = document.querySelectorAll('.cv-section');

    const activateLink = (id) => {
      sideNavItems.forEach(item => {
        item.classList.toggle('active', item.getAttribute('href') === `#${id}`);
      });
    };

    if ('IntersectionObserver' in window) {
      const spyObserver = new IntersectionObserver(
        entries => {
          /* Find the entry that is most visible */
          const visible = entries
            .filter(e => e.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          if (visible.length) activateLink(visible[0].target.id);
        },
        { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
      );
      cvSections.forEach(s => spyObserver.observe(s));
    }