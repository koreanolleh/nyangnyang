/* Design:Gym — 안드로이드 WebXR AR 안에서 색상 전환 (탭 + 스와이프)
   https://nyangnyang.kr/ar/webxr-ui.js
   카페24 common.js 는 이 파일을 <script> 로 불러오기만 한다.
   앞으로 수정은 이 파일만 고쳐서 GitHub 에 올리면 끝. */
(function () {
  'use strict';
  if (window.__dgWebXR) return; window.__dgWebXR = true;

  var HOST = 'https://nyangnyang.kr/ar';
  if (!/Android/i.test(navigator.userAgent)) return;   // 아이폰은 Quick Look(USDZ) 그대로

  var ORDER  = ['active_steps', 'before_sunrise', 'warm_sunlight'];
  var LABEL  = { active_steps: 'Active steps', before_sunrise: 'Before sunrise', warm_sunlight: 'Warm sunlight' };
  var SWATCH = { active_steps: '#8FA98C', before_sunrise: '#5B6E86', warm_sunlight: '#E3B8A8' };

  function css() {
    if (document.getElementById('dg-xr-css')) return;
    var s = document.createElement('style');
    s.id = 'dg-xr-css';
    s.textContent =
      '.dg-xr{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;' +
        'padding:14px 12px calc(16px + env(safe-area-inset-bottom,0px));' +
        'display:none;flex-direction:column;gap:10px;pointer-events:auto;' +
        'background:linear-gradient(to top,rgba(0,0,0,.62),rgba(0,0,0,0));' +
        'font-family:-apple-system,"Apple SD Gothic Neo","Noto Sans KR",Roboto,sans-serif;' +
        'touch-action:none;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}' +
      '.dg-xr.on{display:flex}' +
      '.dg-xr *{pointer-events:auto;box-sizing:border-box}' +
      '.dg-xr-hint{align-self:center;font-size:12.5px;color:#fff;letter-spacing:-.3px;' +
        'background:rgba(0,0,0,.42);padding:6px 13px;border-radius:999px;pointer-events:none}' +
      '.dg-xr-row{display:flex;gap:8px}' +
      '.dg-xr-chip{flex:1;min-width:0;display:flex;align-items:center;justify-content:center;gap:7px;' +
        'height:54px;padding:0 8px;margin:0;border-radius:13px;background:rgba(255,255,255,.94);' +
        'color:#1A1A18;font-size:12px;font-weight:700;letter-spacing:-.4px;line-height:1.15;text-align:left;' +
        'font-family:inherit;border:2px solid transparent;appearance:none;-webkit-appearance:none;' +
        'transition:border-color .15s,transform .15s,box-shadow .15s}' +
      '.dg-xr-chip.on{border-color:#1A1A18;transform:translateY(-3px);box-shadow:0 6px 16px rgba(0,0,0,.35)}' +
      '.dg-xr-sw{width:24px;height:24px;border-radius:8px;flex:none;box-shadow:inset 0 0 0 1px rgba(0,0,0,.10)}' +
      '.dg-xr-tx{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}';
    document.head.appendChild(s);
  }

  function keyOf(mv) {
    var m = (mv.getAttribute('src') || '').match(/mat_([a-z_]+)\.glb/);
    return (m && ORDER.indexOf(m[1]) >= 0) ? m[1] : ORDER[0];
  }

  function mark(bar, key) {
    [].forEach.call(bar.querySelectorAll('.dg-xr-chip'), function (c) {
      c.classList.toggle('on', c.getAttribute('data-key') === key);
    });
  }

  function apply(mv, bar, key) {
    if (!key || keyOf(mv) === key) return;
    mv.setAttribute('src', HOST + '/models/mat_' + key + '.glb');
    mark(bar, key);
  }

  function build(mv) {
    css();
    var bar = document.createElement('div');
    bar.className = 'dg-xr interactive';

    var hint = document.createElement('div');
    hint.className = 'dg-xr-hint';
    hint.textContent = '좌우로 밀거나 눌러서 색상 변경';

    var row = document.createElement('div');
    row.className = 'dg-xr-row';

    ORDER.forEach(function (k) {
      var c = document.createElement('button');
      c.type = 'button';
      c.className = 'dg-xr-chip interactive';
      c.setAttribute('data-key', k);
      var sw = document.createElement('span');
      sw.className = 'dg-xr-sw';
      sw.style.background = SWATCH[k];
      var tx = document.createElement('span');
      tx.className = 'dg-xr-tx';
      tx.textContent = LABEL[k];
      c.appendChild(sw); c.appendChild(tx);
      c.addEventListener('click', function (ev) {
        ev.preventDefault(); ev.stopPropagation();
        apply(mv, bar, k);
      });
      row.appendChild(c);
    });

    bar.appendChild(hint);
    bar.appendChild(row);

    // 좌우 스와이프로 순환
    var x0 = null, y0 = null;
    bar.addEventListener('touchstart', function (ev) {
      x0 = ev.touches[0].clientX; y0 = ev.touches[0].clientY;
    }, { passive: true });
    bar.addEventListener('touchend', function (ev) {
      if (x0 === null) return;
      var t = ev.changedTouches[0];
      var dx = t.clientX - x0, dy = t.clientY - y0;
      x0 = null;
      if (Math.abs(dx) < 45 || Math.abs(dx) <= Math.abs(dy)) return;
      var i = ORDER.indexOf(keyOf(mv));
      var n = ORDER[(i + (dx < 0 ? 1 : ORDER.length - 1)) % ORDER.length];
      apply(mv, bar, n);
    }, { passive: true });

    mv.appendChild(bar);   // model-viewer 기본 slot → shadow 의 div.default (= WebXR dom-overlay root)
    return bar;
  }

  function attach(mv) {
    if (mv.__dgXR) return;
    mv.__dgXR = true;
    mv.setAttribute('ar-modes', 'webxr scene-viewer quick-look');   // 우리 화면으로 AR 그리기
    var bar = build(mv);
    mark(bar, keyOf(mv));
    mv.addEventListener('ar-status', function (ev) {
      var st = (ev.detail && ev.detail.status) || '';
      if (st === 'session-started' || st === 'object-placed') {
        bar.classList.add('on');
        mark(bar, keyOf(mv));
      } else {
        bar.classList.remove('on');
      }
    });
  }

  function scan() {
    [].forEach.call(document.querySelectorAll('model-viewer'), attach);
  }
  scan();
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
})();
