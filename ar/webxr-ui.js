/* Design:Gym — 안드로이드 WebXR AR 안에서 색상 전환 (탭 + 스와이프)
   nyangnyang.kr/ar/webxr-ui.js
   카페24 common.js 에서 스크립트 태그로 로드됨. 수정은 이 파일만 고치면 됨. */
(function () {
  'use strict';
  if (window.__dgWebXR) return; window.__dgWebXR = true;

  var HOST = 'https://nyangnyang.kr/ar';
  var isAndroid = /Android/.test(navigator.userAgent);
  if (!isAndroid) return;                       // 아이폰은 Quick Look 그대로

  var ORDER = ['active_steps', 'before_sunrise', 'warm_sunlight'];
  var LABEL = { active_steps: 'Active steps', before_sunrise: 'Before sunrise', warm_sunlight: 'Warm sunlight' };
  var SWATCH = { active_steps: '#8FA98C', before_sunrise: '#5B6E86', warm_sunlight: '#E3B8A8' };

  function css() {
    if (document.getElementById('dg-xr-css')) return;
    var s = document.createElement('style');
    s.id = 'dg-xr-css';
    s.textContent =
      '.dg-xr{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;' +
        'padding:14px 16px calc(18px + env(safe-area-inset-bottom,0px));' +
        'display:none;flex-direction:column;gap:10px;' +
        'background:linear-gradient(to top,rgba(0,0,0,.55),rgba(0,0,0,0));' +
        'font-family:-apple-system,"Noto Sans KR",Roboto,sans-serif;touch-action:none;-webkit-user-select:none;user-select:none}' +
      '.dg-xr.on{display:flex}' +
      '.dg-xr-hint{align-self:center;font-size:12.5px;color:rgba(255,255,255,.85);letter-spacing:-.2px;' +
        'background:rgba(0,0,0,.35);padding:5px 12px;border-radius:999px;backdrop-filter:blur(6px)}' +
      '.dg-xr-row{display:flex;gap:8px}' +
      '.dg-xr-chip{flex:1;display:flex;align-items:center;gap:8px;height:52px;padding:0 12px;' +
        'border-radius:12px;background:rgba(255,255,255,.92);color:#1A1A18;' +
        'font-size:12.5px;font-weight:600;letter-spacing:-.3px;line-height:1.15;' +
        'border:2px solid transparent;transition:border-color .15s,transform .15s}' +
      '.dg-xr-chip.on{border-color:#1A1A18;transform:translateY(-2px)}' +
      '.dg-xr-sw{width:26px;height:26px;border-radius:8px;flex:none;box-shadow:inset 0 0 0 1px rgba(0,0,0,.08)}';
    document.head.appendChild(s);
  }

  function keyOf(mv) {
    var m = (mv.getAttribute('src') || '').match(/mat_([a-z_]+)\.glb/);
    return m ? m[1] : ORDER[0];
  }

  function build(mv) {
    css();
    var bar = document.createElement('div');
    bar.className = 'dg-xr';
    var hint = document.createElement('div');
    hint.className = 'dg-xr-hint';
    hint.textContent = '좌우로 밀거나 눌러서 색상 변경';
    var row = document.createElement('div');
    row.className = 'dg-xr-row';

    ORDER.forEach(function (k) {
      var c = document.createElement('div');
      c.className = 'dg-xr-chip';
      c.dataset.key = k;
      var sw = document.createElement('span');
      sw.className = 'dg-xr-sw';
      sw.style.background = SWATCH[k];
      var t = document.createElement('span');
      t.textContent = LABEL[k];
      c.appendChild(sw); c.appendChild(t);
      c.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); apply(mv, bar, k); });
      row.appendChild(c);
    });

    bar.appendChild(hint); bar.appendChild(row);

    // 좌우 스와이프
    var x0 = null, y0 = null;
    bar.addEventListener('touchstart', function (e) {
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
    }, { passive: true });
    bar.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var t = e.changedTouches[0];
      var dx = t.clientX - x0, dy = t.clientY - y0;
      x0 = null;
      if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return;
      var i = ORDER.indexOf(keyOf(mv));
      apply(mv, bar, ORDER[(i + (dx < 0 ? 1 : ORDER.length - 1)) % ORDER.length]);
    }, { passive: true });

    mv.appendChild(bar);
    return bar;
  }

  function apply(mv, bar, key) {
    if (keyOf(mv) === key) return;
    mv.setAttribute('src', HOST + '/models/mat_' + key + '.glb');
    mark(bar, key);
  }

  function mark(bar, key) {
    [].forEach.call(bar.querySelectorAll('.dg-xr-chip'), function (c) {
      c.classList.toggle('on', c.dataset.key === key);
    });
  }

  function attach(mv) {
    if (mv.__dgXR) return;
    mv.__dgXR = true;
    mv.setAttribute('ar-modes', 'webxr scene-viewer quick-look');
    var bar = build(mv);
    mark(bar, keyOf(mv));
    mv.addEventListener('ar-status', function (ev) {
      var on = ev.detail && ev.detail.status === 'session-started';
      bar.classList.toggle('on', !!on);
      if (on) mark(bar, keyOf(mv));
    });
  }

  function scan() {
    var mv = document.querySelector('model-viewer');
    if (mv) attach(mv);
  }
  scan();
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
})();
