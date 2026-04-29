(function () {
  const mobileMenu = document.getElementById('mobileMenu');
  const navLinks = document.getElementById('navLinks');
  if (!mobileMenu || !navLinks) return;

  const mqMobile = () => window.matchMedia('(max-width: 768px)').matches;

  mobileMenu.addEventListener('click', function (e) {
    e.stopPropagation();
    mobileMenu.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  function showDemoMessage(label) {
    var text = (label || '').trim();
    var toast = document.querySelector('.demo-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'demo-toast';
      toast.style.cssText =
        'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);' +
        'background:rgba(20,30,55,0.92);color:#fff;padding:10px 20px;border-radius:40px;' +
        'font-size:14px;font-weight:500;z-index:9999;box-shadow:0 10px 20px rgba(0,0,0,0.2);' +
        'font-family:var(--font-body,system-ui,sans-serif);transition:opacity .3s';
      document.body.appendChild(toast);
    }
    toast.textContent = 'Demo: "' + text + '" — connect your booking flow here.';
    toast.style.opacity = '1';
    clearTimeout(window.__demoToastTimer);
    window.__demoToastTimer = setTimeout(function () {
      toast.style.opacity = '0';
      setTimeout(function () {
        if (toast.parentNode) toast.remove();
      }, 300);
    }, 2000);
  }

  function mobileDropdownClickHandler(e) {
    var parentLi = this.parentElement;
    if (!parentLi || !parentLi.classList.contains('nav-item')) return;

    var dropdown = parentLi.querySelector('.dropdown-menu');

    if (mqMobile()) {
      if (dropdown) {
        e.preventDefault();
        if (parentLi.classList.contains('active-mobile')) {
          parentLi.classList.remove('active-mobile');
        } else {
          document.querySelectorAll('.nav-item.active-mobile').forEach(function (item) {
            if (item !== parentLi) item.classList.remove('active-mobile');
          });
          parentLi.classList.add('active-mobile');
        }
      } else {
        var href = this.getAttribute('href');
        if (href && href !== '#') {
          window.location.href = href;
        } else if (href === '#') {
          e.preventDefault();
          showDemoMessage(this.textContent);
        }
      }
    } else {
      var hrefDesk = this.getAttribute('href');
      if (hrefDesk === '#') {
        e.preventDefault();
        showDemoMessage(this.textContent);
      }
    }
  }

  function bindDropdownParents() {
    document.querySelectorAll('.main-header .nav-item > .nav-link').forEach(function (link) {
      link.removeEventListener('click', mobileDropdownClickHandler);
      link.addEventListener('click', mobileDropdownClickHandler);
    });
  }

  function normalizePath(path) {
    return (path || '').replace(/\\/g, '/').split('/').pop().toLowerCase();
  }

  function markCurrentPageLink() {
    var currentFile = normalizePath(window.location.pathname) || 'index.html';
    var matchedDropdownParent = null;

    document.querySelectorAll('.main-header .nav-item > .nav-link').forEach(function (link) {
      var href = normalizePath(link.getAttribute('href'));
      if (!href || href === '#') return;
      if (href === currentFile) {
        link.classList.add('current-page-link');
        if (link.parentElement) link.parentElement.classList.add('current-page-item');
      }
    });

    document.querySelectorAll('.main-header .dropdown-menu a').forEach(function (sublink) {
      var href = normalizePath(sublink.getAttribute('href'));
      if (!href || href === '#') return;
      if (href === currentFile) {
        sublink.classList.add('current-page-link');
        var parentItem = sublink.closest('.nav-item');
        if (parentItem) {
          parentItem.classList.add('current-page-item');
          matchedDropdownParent = parentItem;
        }
      }
    });

    if (matchedDropdownParent) {
      matchedDropdownParent.classList.add('active-mobile');
    }
  }


  bindDropdownParents();
  markCurrentPageLink();

  navLinks.addEventListener('click', function (e) {
    var item = e.target.closest('a');
    if (!item) return;
    if (!mqMobile() || !navLinks.classList.contains('active')) return;

    var inDropdown = item.closest('.dropdown-menu');
    var isToggle =
      item.classList.contains('nav-link') &&
      item.parentElement &&
      item.parentElement.querySelector('.dropdown-menu');

    if (inDropdown) {
      navLinks.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.querySelectorAll('.nav-item.active-mobile').forEach(function (el) {
        el.classList.remove('active-mobile');
      });
      return;
    }

    if (!isToggle) {
      navLinks.classList.remove('active');
      mobileMenu.classList.remove('active');
    }
  });

  document.querySelectorAll('.main-header .book-a-demo').forEach(function (el) {
    el.addEventListener('click', function (e) {
      if (el.getAttribute('href') === '#') e.preventDefault();
      showDemoMessage(el.textContent || 'Book a Demo');
    });
  });

  function resetMobileNav() {
    if (!mqMobile()) {
      document.querySelectorAll('.nav-item.active-mobile').forEach(function (item) {
        item.classList.remove('active-mobile');
      });
      navLinks.classList.remove('active');
      mobileMenu.classList.remove('active');
    }
  }

  window.addEventListener('resize', resetMobileNav);
})();
