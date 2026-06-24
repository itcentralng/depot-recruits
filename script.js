(function () {
  var COMPANIES = ['ALFA','BRAVO','CHARLIE','DELTA','ECHO','FOXTROT','GOLF','HOTEL','INDIA','JULIET'];

  // nav state stack: each entry is { screen, label }
  var navStack = [];

  // current selections
  var state = {
    category: '',   // 'alumni' | 'current'
    year:     '',   // e.g. 'alumni' key (for now just 'alumni')
    coy:      ''
  };

  // ── Helpers ─────────────────────────────────────────

  function dataFor(tab) {
    return RECRUIT_DATA[tab] || [];
  }

  function countByCoy(tab, coy) {
    return dataFor(tab).filter(function(r){ return r.c === coy; }).length;
  }

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(function(s){ s.classList.remove('active'); });
    document.getElementById(id).classList.add('active');
  }

  function updateNav() {
    var breadcrumb = document.getElementById('breadcrumb');
    var backBtn    = document.getElementById('back-btn');

    if (navStack.length === 0) {
      breadcrumb.innerHTML = '';
      backBtn.classList.add('hidden');
      return;
    }

    backBtn.classList.remove('hidden');

    var parts = navStack.map(function(e, i) {
      var cls = (i === navStack.length - 1) ? 'bc-active' : '';
      return '<span class="' + cls + '">' + e.label + '</span>';
    });
    breadcrumb.innerHTML = parts.join('<span class="bc-sep"> › </span>');
  }

  function push(screen, label) {
    navStack.push({ screen: screen, label: label });
    showScreen(screen);
    updateNav();
  }

  window.goBack = function () {
    navStack.pop();
    var prev = navStack.length ? navStack[navStack.length - 1] : null;
    showScreen(prev ? prev.screen : 'screen-home');
    if (!navStack.length) {
      document.getElementById('breadcrumb').innerHTML = '';
      document.getElementById('back-btn').classList.add('hidden');
    } else {
      updateNav();
    }
  };

  // ── Home screen ─────────────────────────────────────

  function init() {
    var alumni  = dataFor('alumni').length;
    var current = dataFor('current').length;
    document.getElementById('home-count-alumni').textContent  = alumni.toLocaleString() + ' recruits';
    document.getElementById('home-count-current').textContent = current.toLocaleString() + ' recruits';
  }

  window.selectCategory = function (cat) {
    state.category = cat;
    navStack = [];

    if (cat === 'alumni') {
      push('screen-year', 'Alumni');
      buildYearScreen();
    } else {
      push('screen-company', 'Current · 90 RRI');
      buildCompanyScreen('current', '90 RRI');
    }
  };

  // ── Year screen ──────────────────────────────────────

  function buildYearScreen() {
    // For now one year; designed to scale
    var years = [
      { key: 'alumni', label: '89 RRI', name: 'Eighty-Ninth Regular Recruit Intake' }
    ];

    var html = '';
    years.forEach(function(y) {
      var total = dataFor(y.key).length;
      html += '<button class="year-card" onclick="selectYear(\'' + y.key + '\',\'' + y.label + '\')">' +
        '<div class="year-card-label">' + y.label + '</div>' +
        '<div class="year-card-intake">' + y.name + '</div>' +
        '<div class="year-card-count">' + total.toLocaleString() + ' recruits</div>' +
        '</button>';
    });
    document.getElementById('year-cards').innerHTML = html;
  }

  window.selectYear = function (tab, label) {
    state.year = tab;
    push('screen-company', label);
    buildCompanyScreen(tab, label);
  };

  // ── Company screen ───────────────────────────────────

  function buildCompanyScreen(tab, intakeLabel) {
    document.getElementById('coy-screen-title').textContent = 'Select Company';
    document.getElementById('coy-screen-sub').textContent   = intakeLabel;

    var html = '';
    COMPANIES.forEach(function(coy) {
      var count = countByCoy(tab, coy);
      html += '<button class="company-card" onclick="selectCompany(\'' + coy + '\')">' +
        '<div class="company-card-bar"></div>' +
        '<div class="company-card-name">' + coy + '</div>' +
        '<div class="company-card-count">' + count.toLocaleString() + ' recruits</div>' +
        '</button>';
    });
    document.getElementById('company-grid').innerHTML = html;
  }

  window.selectCompany = function (coy) {
    state.coy = coy;
    var tab = (state.category === 'alumni') ? state.year : 'current';
    push('screen-list', coy + ' Company');
    buildListScreen(tab, coy);
  };

  // ── List screen ──────────────────────────────────────

  function buildListScreen(tab, coy) {
    var intake = (tab === 'current') ? '90 RRI' : '89 RRI';
    var recruits = dataFor(tab).filter(function(r){ return r.c === coy; });

    document.getElementById('list-coy-name').textContent = coy + ' COMPANY';
    document.getElementById('list-coy-meta').textContent = intake + ' · ' +
      (state.category === 'alumni' ? 'Alumni' : 'Current Intake');
    document.getElementById('list-count-badge').textContent = recruits.length.toLocaleString() + ' recruits';

    var intakeLabel = intake;
    var html = '';
    recruits.forEach(function(r) {
      html += '<article class="recruit-card" onclick="openModal(' +
        JSON.stringify(r).replace(/"/g, '&quot;') + ',\'' + intakeLabel + '\')">' +
        '<div class="card-photo-wrap">' +
          '<img class="card-photo" src="assets/images/military-silhouette.png" alt="' + r.name + '" loading="lazy">' +
        '</div>' +
        '<div class="card-body">' +
          '<div class="card-serial">No. ' + r.s + '</div>' +
          '<div class="card-name">' + r.name + '</div>' +
          '<div class="card-depot">' + (r.n || '') + '</div>' +
        '</div>' +
      '</article>';
    });
    document.getElementById('recruit-grid').innerHTML = html || '<div class="grid-empty">No recruits in this company</div>';
    document.getElementById('recruit-grid').scrollTop = 0;
  }

  // ── Modal ─────────────────────────────────────────────

  window.openModal = function (r, intakeLabel) {
    document.getElementById('modal-badge').textContent    = intakeLabel;
    document.getElementById('modal-name').textContent     = r.name;
    document.getElementById('modal-depot').textContent    = r.n || '—';
    document.getElementById('modal-coy-row').innerHTML    = 'Company: <span>' + (r.c || '—') + '</span>';
    var remarksEl = document.getElementById('modal-remarks');
    remarksEl.textContent  = r.r || '';
    remarksEl.style.display = r.r ? '' : 'none';
    document.getElementById('modal').classList.remove('hidden');
  };

  window.closeModal = function (e) {
    if (!e || e.target === document.getElementById('modal')) {
      document.getElementById('modal').classList.add('hidden');
    }
  };

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') window.closeModal();
  });

  init();
})();
