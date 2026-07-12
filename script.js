(() => {
  'use strict';

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const resetInitialScroll = () => {
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, 0)));
  };
  window.addEventListener('pageshow', resetInitialScroll, { once: true });

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

  // Compact Section 09 gallery browser. All category labels remain visible in the directory;
  // JavaScript reduces the image stream to one clearly selected category at a time.
  const gallery = document.querySelector('[data-gallery-section]');
  const galleryBrowser = document.querySelector('[data-gallery-browser]');
  const gallerySelect = document.querySelector('[data-gallery-select]');
  const galleryCurrent = document.querySelector('[data-gallery-current]');
  const galleryProgress = document.querySelector('[data-gallery-progress]');
  const galleryPrev = document.querySelector('[data-gallery-prev]');
  const galleryNext = document.querySelector('[data-gallery-next]');
  const galleryViewAll = document.querySelector('[data-gallery-view-all]');
  const galleryIndexLinks = [...document.querySelectorAll('.gallery-index a[href^="#gallery-"]')];
  const galleryCategories = galleryIndexLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter((item) => item instanceof HTMLElement);
  const galleryParents = gallery ? [...gallery.querySelectorAll('.gallery-parent')] : [];
  let activeGalleryIndex = 0;
  let galleryShowAll = false;

  const setHeaderHeight = () => {
    const height = header?.getBoundingClientRect().height || 72;
    document.documentElement.style.setProperty('--header-height', `${height}px`);
  };
  setHeaderHeight();
  window.addEventListener('resize', setHeaderHeight, { passive: true });

  const scrollGalleryStageIntoView = () => {
    if (!galleryBrowser) return;
    const headerHeight = header?.getBoundingClientRect().height || 0;
    const targetTop = galleryBrowser.getBoundingClientRect().top + window.scrollY - headerHeight - 10;
    window.scrollTo({ top: targetTop, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  };

  const renderGalleryBrowser = ({ scroll = false } = {}) => {
    if (!gallery || !galleryCategories.length) return;
    gallery.classList.add('gallery-enhanced');
    gallery.classList.toggle('gallery-show-all', galleryShowAll);

    if (galleryShowAll) {
      galleryParents.forEach((parent) => {
        parent.hidden = false;
        parent.classList.remove('is-active');
      });
      galleryCategories.forEach((category) => {
        category.hidden = false;
        category.classList.remove('is-active');
      });
      galleryIndexLinks.forEach((link) => link.removeAttribute('aria-current'));
      if (galleryCurrent) galleryCurrent.textContent = 'All gallery categories';
      if (galleryProgress) galleryProgress.textContent = `${galleryCategories.length} categories`;
      if (galleryPrev instanceof HTMLButtonElement) galleryPrev.disabled = true;
      if (galleryNext instanceof HTMLButtonElement) galleryNext.disabled = true;
      if (galleryViewAll instanceof HTMLButtonElement) {
        galleryViewAll.setAttribute('aria-pressed', 'true');
        galleryViewAll.textContent = 'Show one category';
      }
      if (scroll) scrollGalleryStageIntoView();
      return;
    }

    const category = galleryCategories[activeGalleryIndex];
    const parent = category.closest('.gallery-parent');
    galleryParents.forEach((item) => {
      const active = item === parent;
      item.hidden = !active;
      item.classList.toggle('is-active', active);
    });
    galleryCategories.forEach((item) => {
      const active = item === category;
      item.hidden = !active;
      item.classList.toggle('is-active', active);
    });
    galleryIndexLinks.forEach((link, index) => {
      if (index === activeGalleryIndex) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });

    const link = galleryIndexLinks[activeGalleryIndex];
    const title = category.querySelector('h4')?.textContent?.trim() || link?.textContent?.trim() || 'Gallery category';
    if (galleryCurrent) galleryCurrent.textContent = title;
    if (galleryProgress) galleryProgress.textContent = `${activeGalleryIndex + 1} / ${galleryCategories.length}`;
    if (gallerySelect instanceof HTMLSelectElement) gallerySelect.value = category.id;
    if (galleryPrev instanceof HTMLButtonElement) galleryPrev.disabled = activeGalleryIndex === 0;
    if (galleryNext instanceof HTMLButtonElement) galleryNext.disabled = activeGalleryIndex === galleryCategories.length - 1;
    if (galleryViewAll instanceof HTMLButtonElement) {
      galleryViewAll.setAttribute('aria-pressed', 'false');
      galleryViewAll.textContent = 'Show all';
    }
    if (scroll) scrollGalleryStageIntoView();
  };

  if (gallery && galleryBrowser && galleryCategories.length) {
    if (gallerySelect instanceof HTMLSelectElement) {
      gallerySelect.replaceChildren();
      document.querySelectorAll('.gallery-index-group').forEach((group) => {
        const label = group.querySelector('h3')?.textContent?.trim() || 'Gallery';
        const optgroup = document.createElement('optgroup');
        optgroup.label = label;
        group.querySelectorAll('a[href^="#gallery-"]').forEach((link) => {
          const target = document.querySelector(link.getAttribute('href'));
          if (!(target instanceof HTMLElement)) return;
          const option = document.createElement('option');
          option.value = target.id;
          option.textContent = link.textContent.trim();
          optgroup.append(option);
        });
        gallerySelect.append(optgroup);
      });
      gallerySelect.addEventListener('change', () => {
        const index = galleryCategories.findIndex((category) => category.id === gallerySelect.value);
        if (index < 0) return;
        activeGalleryIndex = index;
        galleryShowAll = false;
        renderGalleryBrowser({ scroll: true });
      });
    }

    galleryIndexLinks.forEach((link, index) => {
      const count = galleryCategories[index]?.querySelectorAll('.asset-card').length || 0;
      const countLabel = document.createElement('span');
      countLabel.className = 'gallery-index-count';
      countLabel.textContent = String(count);
      countLabel.setAttribute('aria-label', `${count} images`);
      link.append(countLabel);
      link.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        activeGalleryIndex = index;
        galleryShowAll = false;
        renderGalleryBrowser({ scroll: true });
      });
    });

    galleryPrev?.addEventListener('click', () => {
      if (activeGalleryIndex <= 0) return;
      activeGalleryIndex -= 1;
      galleryShowAll = false;
      renderGalleryBrowser({ scroll: true });
    });
    galleryNext?.addEventListener('click', () => {
      if (activeGalleryIndex >= galleryCategories.length - 1) return;
      activeGalleryIndex += 1;
      galleryShowAll = false;
      renderGalleryBrowser({ scroll: true });
    });
    galleryViewAll?.addEventListener('click', () => {
      galleryShowAll = !galleryShowAll;
      renderGalleryBrowser({ scroll: true });
    });

    renderGalleryBrowser();
  }

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
    if (event.defaultPrevented) return;
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor) return;
    const id = anchor.getAttribute('href')?.slice(1);
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    event.preventDefault();
    const headerHeight = header?.getBoundingClientRect().height || 0;
    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
    window.scrollTo({ top, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    history.replaceState(null, '', window.location.pathname + window.location.search);
  });
})();
