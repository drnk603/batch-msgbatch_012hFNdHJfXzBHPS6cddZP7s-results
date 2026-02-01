(function() {
  'use strict';

  if (typeof window.__app === 'undefined') {
    window.__app = {};
  }

  var app = window.__app;

  function debounce(func, wait) {
    var timeout;
    return function() {
      var context = this;
      var args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  }

  function throttle(func, limit) {
    var inThrottle;
    return function() {
      var args = arguments;
      var context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(function() {
          inThrottle = false;
        }, limit);
      }
    };
  }

  function initBurgerMenu() {
    if (app.burgerInitialized) return;
    app.burgerInitialized = true;

    var toggle = document.querySelector('.navbar-toggler');
    var collapse = document.querySelector('.navbar-collapse');
    var body = document.body;

    if (!toggle || !collapse) return;

    var isOpen = false;

    function openMenu() {
      isOpen = true;
      collapse.classList.add('show');
      toggle.setAttribute('aria-expanded', 'true');
      body.classList.add('u-no-scroll');
    }

    function closeMenu() {
      isOpen = false;
      collapse.classList.remove('show');
      toggle.setAttribute('aria-expanded', 'false');
      body.classList.remove('u-no-scroll');
    }

    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isOpen) {
        closeMenu();
      }
    });

    document.addEventListener('click', function(e) {
      if (isOpen && !collapse.contains(e.target) && !toggle.contains(e.target)) {
        closeMenu();
      }
    });

    var navLinks = collapse.querySelectorAll('.nav-link');
    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener('click', function() {
        closeMenu();
      });
    }

    var resizeHandler = debounce(function() {
      if (window.innerWidth >= 1024 && isOpen) {
        closeMenu();
      }
    }, 250);

    window.addEventListener('resize', resizeHandler);
  }

  function initSmoothScroll() {
    if (app.smoothScrollInitialized) return;
    app.smoothScrollInitialized = true;

    function getHeaderHeight() {
      var header = document.querySelector('.l-header, .navbar');
      return header ? header.offsetHeight : 72;
    }

    document.addEventListener('click', function(e) {
      var target = e.target;
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }

      if (!target) return;

      var href = target.getAttribute('href');
      if (!href || !href.includes('#')) return;

      var hashIndex = href.indexOf('#');
      var hash = href.substring(hashIndex);
      var path = href.substring(0, hashIndex);

      if (hash === '#' || hash === '#!') return;

      var currentPath = window.location.pathname;
      var isCurrentPage = !path || path === '' || currentPath.endsWith(path) || (path === '/' && (currentPath === '/' || currentPath.endsWith('index.html')));

      if (isCurrentPage) {
        var targetId = hash.substring(1);
        var targetElement = document.getElementById(targetId);

        if (targetElement) {
          e.preventDefault();
          var headerHeight = getHeaderHeight();
          var elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
          var offsetPosition = elementPosition - headerHeight;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });

          if (window.history && window.history.pushState) {
            window.history.pushState(null, '', hash);
          }
        }
      }
    });
  }

  function initScrollSpy() {
    if (app.scrollSpyInitialized) return;
    app.scrollSpyInitialized = true;

    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav-link[href*="#"]');

    if (sections.length === 0 || navLinks.length === 0) return;

    function getHeaderHeight() {
      var header = document.querySelector('.l-header, .navbar');
      return header ? header.offsetHeight : 72;
    }

    var handleScroll = throttle(function() {
      var scrollPosition = window.pageYOffset + getHeaderHeight() + 50;
      var activeId = null;

      for (var i = sections.length - 1; i >= 0; i--) {
        var section = sections[i];
        if (section.offsetTop <= scrollPosition) {
          activeId = section.getAttribute('id');
          break;
        }
      }

      for (var j = 0; j < navLinks.length; j++) {
        var link = navLinks[j];
        var href = link.getAttribute('href');
        
        if (href && href.includes('#')) {
          var linkHash = href.substring(href.indexOf('#') + 1);
          
          if (linkHash === activeId) {
            link.classList.add('is-active');
            link.setAttribute('aria-current', 'page');
          } else {
            link.classList.remove('is-active');
            link.removeAttribute('aria-current');
          }
        }
      }
    }, 100);

    window.addEventListener('scroll', handleScroll);
    handleScroll();
  }

  function initActiveMenu() {
    if (app.activeMenuInitialized) return;
    app.activeMenuInitialized = true;

    var currentPath = window.location.pathname;
    var navLinks = document.querySelectorAll('.nav-link');

    for (var i = 0; i < navLinks.length; i++) {
      var link = navLinks[i];
      var linkPath = link.getAttribute('href');

      if (!linkPath || linkPath.startsWith('#')) continue;

      var isMatch = false;

      if (linkPath === '/' || linkPath === '/index.html' || linkPath.endsWith('/index.html')) {
        if (currentPath === '/' || currentPath === '/index.html' || currentPath.endsWith('/index.html')) {
          isMatch = true;
        }
      } else if (linkPath.startsWith('/') && currentPath === linkPath) {
        isMatch = true;
      } else if (!linkPath.startsWith('/') && currentPath.endsWith('/' + linkPath)) {
        isMatch = true;
      }

      if (isMatch) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('is-active');
      }
    }
  }

  function initImages() {
    if (app.imagesInitialized) return;
    app.imagesInitialized = true;

    var images = document.querySelectorAll('img');

    for (var i = 0; i < images.length; i++) {
      var img = images[i];

      if (!img.hasAttribute('loading')) {
        var isLogo = img.classList.contains('navbar-brand') || img.closest('.navbar-brand');
        var isCritical = img.hasAttribute('data-critical');
        
        if (!isLogo && !isCritical) {
          img.setAttribute('loading', 'lazy');
        }
      }

      (function(image) {
        image.addEventListener('error', function() {
          var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect fill="#e9ecef" width="100" height="100"/><text x="50" y="50" font-family="Arial" font-size="14" fill="#6c757d" text-anchor="middle" dy=".3em">Image</text></svg>';
          var encoded = 'data:image/svg+xml;base64,' + btoa(svg);
          image.src = encoded;
        });
      })(img);
    }
  }

  function initForms() {
    if (app.formsInitialized) return;
    app.formsInitialized = true;

    app.notify = function(message, type) {
      var container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.setAttribute('role', 'region');
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-atomic', 'true');
        document.body.appendChild(container);
      }

      var toast = document.createElement('div');
      toast.className = 'alert alert-' + (type || 'info') + ' alert-dismissible fade show';
      toast.setAttribute('role', 'alert');
      toast.innerHTML = message + '<button type="button" class="btn-close" aria-label="Zavrieť"></button>';

      container.appendChild(toast);

      var closeBtn = toast.querySelector('.btn-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', function() {
          toast.classList.remove('show');
          setTimeout(function() {
            if (toast.parentNode) {
              toast.parentNode.removeChild(toast);
            }
          }, 150);
        });
      }

      setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 150);
      }, 5000);
    };

    var contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var isValid = true;
        var errors = [];

        var firstName = document.getElementById('firstName');
        var lastName = document.getElementById('lastName');
        var email = document.getElementById('email');
        var phone = document.getElementById('phone');
        var message = document.getElementById('message');
        var consent = document.getElementById('privacyConsent');

        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        var phonePattern = /^[\+\d\s\(\)\-]{10,20}$/;
        var namePattern = /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/;

        if (!firstName || !firstName.value.trim() || !namePattern.test(firstName.value.trim())) {
          isValid = false;
          if (firstName) {
            firstName.classList.add('is-invalid');
            var feedback = firstName.nextElementSibling;
            if (feedback && feedback.classList.contains('invalid-feedback')) {
              feedback.textContent = 'Meno musí obsahovať 2-50 písmen.';
            }
          }
          errors.push('Meno je povinné.');
        } else if (firstName) {
          firstName.classList.remove('is-invalid');
        }

        if (!lastName || !lastName.value.trim() || !namePattern.test(lastName.value.trim())) {
          isValid = false;
          if (lastName) {
            lastName.classList.add('is-invalid');
            var feedback = lastName.nextElementSibling;
            if (feedback && feedback.classList.contains('invalid-feedback')) {
              feedback.textContent = 'Priezvisko musí obsahovať 2-50 písmen.';
            }
          }
          errors.push('Priezvisko je povinné.');
        } else if (lastName) {
          lastName.classList.remove('is-invalid');
        }

        if (!email || !email.value.trim() || !emailPattern.test(email.value.trim())) {
          isValid = false;
          if (email) {
            email.classList.add('is-invalid');
            var feedback = email.nextElementSibling;
            if (feedback && feedback.classList.contains('invalid-feedback')) {
              feedback.textContent = 'Zadajte platnú e-mailovú adresu.';
            }
          }
          errors.push('E-mail je povinný a musí byť platný.');
        } else if (email) {
          email.classList.remove('is-invalid');
        }

        if (!phone || !phone.value.trim() || !phonePattern.test(phone.value.trim())) {
          isValid = false;
          if (phone) {
            phone.classList.add('is-invalid');
            var feedback = phone.nextElementSibling;
            if (feedback && feedback.classList.contains('invalid-feedback')) {
              feedback.textContent = 'Telefón musí obsahovať 10-20 znakov (číslice, +, -, medzery, zátvorky).';
            }
          }
          errors.push('Telefón je povinný.');
        } else if (phone) {
          phone.classList.remove('is-invalid');
        }

        if (!message || !message.value.trim() || message.value.trim().length < 10) {
          isValid = false;
          if (message) {
            message.classList.add('is-invalid');
            var feedback = message.nextElementSibling;
            if (feedback && feedback.classList.contains('invalid-feedback')) {
              feedback.textContent = 'Správa musí obsahovať aspoň 10 znakov.';
            }
          }
          errors.push('Správa je povinná (min. 10 znakov).');
        } else if (message) {
          message.classList.remove('is-invalid');
        }

        if (!consent || !consent.checked) {
          isValid = false;
          if (consent) {
            consent.classList.add('is-invalid');
            var feedback = consent.parentElement.querySelector('.invalid-feedback');
            if (feedback) {
              feedback.textContent = 'Musíte súhlasiť so spracovaním údajov.';
            }
          }
          errors.push('Súhlas je povinný.');
        } else if (consent) {
          consent.classList.remove('is-invalid');
        }

        contactForm.classList.add('was-validated');

        if (!isValid) {
          app.notify(errors[0], 'danger');
          return false;
        }

        var submitBtn = contactForm.querySelector('[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          var originalText = submitBtn.innerHTML;
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Odosielanie...';

          setTimeout(function() {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            app.notify('Formulár bol úspešne odoslaný!', 'success');
            contactForm.reset();
            contactForm.classList.remove('was-validated');
            
            setTimeout(function() {
              window.location.href = 'thank_you.html';
            }, 1500);
          }, 1000);
        }

        return false;
      });
    }

    var newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var isValid = true;
        var errors = [];

        var email = document.getElementById('newsletter-email');
        var consent = document.getElementById('newsletter-consent');

        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email || !email.value.trim() || !emailPattern.test(email.value.trim())) {
          isValid = false;
          if (email) {
            email.classList.add('is-invalid');
          }
          errors.push('Zadajte platnú e-mailovú adresu.');
        } else if (email) {
          email.classList.remove('is-invalid');
        }

        if (!consent || !consent.checked) {
          isValid = false;
          if (consent) {
            consent.classList.add('is-invalid');
          }
          errors.push('Musíte súhlasiť so spracovaním údajov.');
        } else if (consent) {
          consent.classList.remove('is-invalid');
        }

        newsletterForm.classList.add('was-validated');

        if (!isValid) {
          app.notify(errors[0], 'danger');
          return false;
        }

        var submitBtn = newsletterForm.querySelector('[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          var originalText = submitBtn.innerHTML;
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Odosielanie...';

          setTimeout(function() {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            app.notify('Prihlásenie do newslettera bolo úspešné!', 'success');
            newsletterForm.reset();
            newsletterForm.classList.remove('was-validated');
          }, 1000);
        }

        return false;
      });
    }
  }

  function initAccordion() {
    if (app.accordionInitialized) return;
    app.accordionInitialized = true;

    var buttons = document.querySelectorAll('.accordion-button');

    for (var i = 0; i < buttons.length; i++) {
      (function(button) {
        button.addEventListener('click', function(e) {
          e.preventDefault();
          
          var target = button.getAttribute('data-bs-target');
          if (!target) return;

          var collapse = document.querySelector(target);
          if (!collapse) return;

          var isExpanded = button.getAttribute('aria-expanded') === 'true';

          if (isExpanded) {
            button.setAttribute('aria-expanded', 'false');
            button.classList.add('collapsed');
            collapse.classList.remove('show');
          } else {
            button.setAttribute('aria-expanded', 'true');
            button.classList.remove('collapsed');
            collapse.classList.add('show');
          }
        });
      })(buttons[i]);
    }
  }

  function initScrollToTop() {
    if (app.scrollToTopInitialized) return;
    app.scrollToTopInitialized = true;

    var scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.className = 'btn btn-primary';
    scrollToTopBtn.setAttribute('aria-label', 'Späť na začiatok');
    scrollToTopBtn.innerHTML = '↑';
    scrollToTopBtn.style.cssText = 'position: fixed; bottom: 2rem; right: 2rem; z-index: 1000; width: 48px; height: 48px; border-radius: 50%; display: none; padding: 0;';

    document.body.appendChild(scrollToTopBtn);

    var handleScroll = throttle(function() {
      if (window.pageYOffset > 300) {
        scrollToTopBtn.style.display = 'flex';
      } else {
        scrollToTopBtn.style.display = 'none';
      }
    }, 100);

    window.addEventListener('scroll', handleScroll);

    scrollToTopBtn.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  function initHeaderScroll() {
    if (app.headerScrollInitialized) return;
    app.headerScrollInitialized = true;

    var header = document.querySelector('.l-header, .navbar');
    if (!header) return;

    var handleScroll = throttle(function() {
      if (window.pageYOffset > 50) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }, 100);

    window.addEventListener('scroll', handleScroll);
    handleScroll();
  }

  app.init = function() {
    initBurgerMenu();
    initSmoothScroll();
    initScrollSpy();
    initActiveMenu();
    initImages();
    initForms();
    initAccordion();
    initScrollToTop();
    initHeaderScroll();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', app.init);
  } else {
    app.init();
  }

})();