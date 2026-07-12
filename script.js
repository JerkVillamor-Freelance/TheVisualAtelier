(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.primary-navigation');
  const navLinks = [...document.querySelectorAll('[data-nav-link]')];

  const closeMenu = () => {
    if (!menuButton || !navigation) return;
    menuButton.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
  };

  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    navigation.classList.toggle('is-open', !open);
  });

  navLinks.forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  // Active primary navigation state.
  const navSections = [...document.querySelectorAll('[data-nav-section]')];
  const sectionToLink = new Map(navLinks.map((link) => [link.getAttribute('href')?.slice(1), link]));
  const updateActive = (id) => {
    navLinks.forEach((link) => link.removeAttribute('aria-current'));
    sectionToLink.get(id)?.setAttribute('aria-current', 'location');
  };

  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id) updateActive(visible.target.id);
    }, { rootMargin: '-20% 0px -62% 0px', threshold: [0.02, 0.15, 0.35] });
    navSections.forEach((section) => navObserver.observe(section));
  }

  // Reveal animation is enhancement only.
  const revealItems = [...document.querySelectorAll('.reveal')];
  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  // Before/after comparisons.
  document.querySelectorAll('[data-compare]').forEach((compare) => {
    const range = compare.querySelector('.compare-range');
    if (!(range instanceof HTMLInputElement)) return;
    const update = () => {
      const value = Number(range.value);
      compare.style.setProperty('--compare-position', `${value}%`);
      const description = value === 0
        ? 'Before image fully visible'
        : value === 100
          ? 'After image fully visible'
          : `${value} percent of the after image revealed`;
      range.setAttribute('aria-valuetext', description);
    };
    range.addEventListener('input', update);
    range.addEventListener('keydown', (event) => {
      if (event.key === 'Home') { range.value = '0'; update(); }
      if (event.key === 'End') { range.value = '100'; update(); }
    });
    update();
  });

  // Accessible lightbox.
  const dialog = document.querySelector('[data-lightbox-dialog]');
  if (!(dialog instanceof HTMLDialogElement)) return;
  const dialogImage = dialog.querySelector('.lightbox-image');
  const dialogCaption = dialog.querySelector('.lightbox-caption');
  const counter = dialog.querySelector('.lightbox-counter');
  const closeButton = dialog.querySelector('.lightbox-close');
  const prevButton = dialog.querySelector('.lightbox-prev');
  const nextButton = dialog.querySelector('.lightbox-next');
  const triggers = [...document.querySelectorAll('[data-lightbox]')];
  let activeTrigger = null;
  let activeGroup = [];
  let activeIndex = 0;

  const groupFor = (trigger) => {
    const group = trigger.dataset.group || '__single';
    return triggers.filter((item) => (item.dataset.group || '__single') === group);
  };

  const renderLightbox = () => {
    const trigger = activeGroup[activeIndex];
    if (!trigger || !(dialogImage instanceof HTMLImageElement)) return;
    const src = trigger.dataset.src || '';
    const caption = trigger.dataset.caption || '';
    dialogImage.src = src;
    dialogImage.alt = caption;
    if (dialogCaption) dialogCaption.textContent = caption;
    if (counter) counter.textContent = activeGroup.length > 1 ? `${activeIndex + 1} / ${activeGroup.length}` : 'Image detail';
    const showNavigation = activeGroup.length > 1;
    if (prevButton) prevButton.hidden = !showNavigation;
    if (nextButton) nextButton.hidden = !showNavigation;
    const scrollArea = dialog.querySelector('.lightbox-scroll');
    if (scrollArea) scrollArea.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const openLightbox = (trigger) => {
    activeTrigger = trigger;
    activeGroup = groupFor(trigger);
    activeIndex = Math.max(0, activeGroup.indexOf(trigger));
    renderLightbox();
    document.body.classList.add('modal-open');
    dialog.showModal();
    closeButton?.focus();
  };

  const closeLightbox = () => {
    if (dialog.open) dialog.close();
  };

  const step = (direction) => {
    if (activeGroup.length < 2) return;
    activeIndex = (activeIndex + direction + activeGroup.length) % activeGroup.length;
    renderLightbox();
  };

  triggers.forEach((trigger) => trigger.addEventListener('click', () => openLightbox(trigger)));
  closeButton?.addEventListener('click', closeLightbox);
  prevButton?.addEventListener('click', () => step(-1));
  nextButton?.addEventListener('click', () => step(1));

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeLightbox();
  });
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeLightbox();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    if (dialogImage instanceof HTMLImageElement) {
      dialogImage.removeAttribute('src');
      dialogImage.alt = '';
    }
    activeTrigger?.focus();
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); step(1); }
  });

  // Ensure anchor targets are not obscured by the sticky header in older browsers.
  document.addEventListener('click', (event) => {
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor) return;
    const id = anchor.getAttribute('href')?.slice(1);
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    event.preventDefault();
    const headerHeight = header?.getBoundingClientRect().height || 0;
    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
    window.scrollTo({ top, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    history.replaceState(null, '', `#${id}`);
  });
})();
