(function () {
  var header = document.querySelector('.dr-header');
  if (!header) return;

  var toggle = header.querySelector('.dr-nav-toggle');
  var panel = header.querySelector('#dr-nav-menu');
  if (!toggle || !panel) return;

  function closePanel() {
    toggle.classList.remove('dr-is-open');
    panel.classList.remove('dr-is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', function () {
    var isOpen = toggle.classList.toggle('dr-is-open');
    if (isOpen) {
      panel.classList.add('dr-is-open');
    } else {
      panel.classList.remove('dr-is-open');
    }
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  panel.addEventListener('click', function (event) {
    if (event.target.closest('a')) {
      closePanel();
    }
  });
})();
