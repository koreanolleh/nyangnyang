/* Design:Gym — 안드로이드 WebXR AR 안에서 색상 전환
   https://nyangnyang.kr/ar/webxr-ui.js
   카페24 common.js 는 이 파일을 <script> 로 불러오기만 한다.
   수정은 이 파일만 고쳐서 GitHub 에 올리면 끝. */
(function () {
  'use strict';
  if (window.__dgWebXR) return; window.__dgWebXR = true;
  if (!/Android/i.test(navigator.userAgent)) return;   // 아이폰은 Quick Look(USDZ) 그대로

  var HOST  = 'https://nyangnyang.kr/ar';
  var INAPP = /KAKAOTALK|NAVER|inapp|Instagram|FBAN|FBAV|FB_IAB|Line\/|DaumApps|Whale/i.test(navigator.userAgent);

  var ORDER  = ['active_steps', 'before_sunrise', 'warm_sunlight'];
  var LABEL  = { active_steps: 'Active steps', before_sunrise: 'Before sunrise', warm_sunlight: 'Warm sunlight' };
  var SWATCH = { active_steps: '#8FA98C', before_sunrise: '#5B6E86', warm_sunlight: '#E3B8A8' };

  /* ---------- 1) 인앱 브라우저(네이버/카톡 등)는 WebXR 이 없어서
        구글 Scene Viewer 로 넘어가고 우리 UI 를 못 얹는다.
        AR 링크를 누르면 크롬으로 넘겨준다. ---------- */
  function keyFromHref(h) {
    h = decodeURIComponent(h || '');
    var m = h.match(/[?&]c=([a-z_]+)/) || h.match(/mat_([a-z_]+)\.(?:glb|usdz)/);
    return (m && ORDER.indexOf(m[1]) >= 0) ? m[1] : ORDER[0];
  }

  function chromeIntent(url) {
    return 'intent://' + url.replace(/^https?:\/\//, '') +
           '#Intent;scheme=https;package=com.android.chrome;' +
           'S.browser_fallback_url=' + encodeURIComponent(url) + ';end';
  }

  /* 인앱 브라우저에서 AR 페이지에 바로 들어온 경우:
     구글 Scene Viewer 자동 실행을 막고 "크롬에서 열기" 시트를 띄운다. */
  function inAppSheet() {
    if (document.getElementById('dg-xr-inapp')) return;

    // model-viewer 의 자동 AR 실행 차단
    function block() {
      var C = window.customElements && customElements.get('model-viewer');
      if (C && C.prototype && !C.prototype.__dgBlocked) {
        C.prototype.__dgBlocked = true;
        C.prototype.activateAR = function () { return Promise.resolve(); };
        return true;
      }
      return false;
    }
    if (!block()) { var n = 0, iv = setInterval(function () { if (block() || ++n > 80) clearInterval(iv); }, 150); }

    var url = location.href.replace(/[?&]auto=1/, '');
    url += (url.indexOf('?') < 0 ? '?' : '&') + 'auto=1';

    var w = document.createElement('div');
    w.id = 'dg-xr-inapp';
    w.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:2147483600;' +
      'padding:18px 18px calc(22px + env(safe-area-inset-bottom,0px));background:#fff;' +
      'box-shadow:0 -10px 30px rgba(0,0,0,.18);border-radius:20px 20px 0 0;' +
      'font-family:-apple-system,"Apple SD Gothic Neo","Noto Sans KR",Roboto,sans-serif';
    w.innerHTML =
      '<div style="font-size:15px;font-weight:800;color:#1A1A18;letter-spacing:-.4px;margin-bottom:6px">' +
        '색상 바꿔보기는 크롬에서만 돼요</div>' +
      '<div style="font-size:13px;line-height:1.5;color:#6B6B66;letter-spacing:-.3px;margin-bottom:14px">' +
        '네이버·카카오톡 같은 앱 안의 브라우저는 AR 화면에 버튼을 올릴 수 없어요.<br>' +
        '크롬으로 열면 AR 화면에서 매트 색상을 바로 바꿔볼 수 있습니다.</div>' +
      '<button id="dg-xr-go" style="width:100%;height:52px;border:0;border-radius:14px;background:#1A1A18;' +
        'color:#fff;font-size:15px;font-weight:800;letter-spacing:-.4px;font-family:inherit">크롬에서 열기</button>';
    (document.body || document.documentElement).appendChild(w);
    w.querySelector('#dg-xr-go').addEventListener('click', function () {
      location.href = chromeIntent(url);
    });
  }

  if (INAPP) {
    if (/nyangnyang\.kr\/ar/.test(location.href)) {
      if (document.body) inAppSheet();
      else document.addEventListener('DOMContentLoaded', inAppSheet);
    }
    document.addEventListener('click', function (ev) {
      var a = ev.target && ev.target.closest &&
              ev.target.closest('a.dg-ar-pill, a.dg-ar-live, a.dg-ar-badge, a[href*="scene-viewer"], a[href*="nyangnyang.kr/ar"]');
      if (!a) return;
      ev.preventDefault(); ev.stopPropagation();
      var url = HOST + '/?c=' + keyFromHref(a.getAttribute('href')) + '&auto=1';
      location.href = chromeIntent(url);
    }, true);
  }

  function css() {
    if (document.getElementById('dg-xr-css')) return;
    var s = document.createElement('style');
    s.id = 'dg-xr-css';
    s.textContent =
      '@keyframes dgxrPop{0%{transform:scale(1)}45%{transform:scale(1.14)}100%{transform:scale(1)}}' +
      '@keyframes dgxrWipe{0%{opacity:0;transform:scale(.2)}35%{opacity:.55}100%{opacity:0;transform:scale(2.6)}}' +
      '@keyframes dgxrToast{0%{opacity:0;transform:translateY(10px)}18%{opacity:1;transform:translateY(0)}75%{opacity:1}100%{opacity:0;transform:translateY(-6px)}}' +
      '.dg-xr{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;' +
        'padding:12px 12px calc(16px + env(safe-area-inset-bottom,0px));' +
        'display:none;flex-direction:column;gap:9px;pointer-events:auto;' +
        'background:linear-gradient(to top,rgba(0,0,0,.62),rgba(0,0,0,0));' +
        'font-family:-apple-system,"Apple SD Gothic Neo","Noto Sans KR",Roboto,sans-serif;' +
        'touch-action:none;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}' +
      '.dg-xr.on{display:flex}' +
      '.dg-xr *{pointer-events:auto;box-sizing:border-box}' +
      '.dg-xr-hint{align-self:center;font-size:12.5px;font-weight:600;color:#fff;letter-spacing:-.3px;' +
        'background:rgba(0,0,0,.42);padding:6px 13px;border-radius:999px;pointer-events:none}' +
      '.dg-xr-row{display:flex;gap:8px}' +
      '.dg-xr-chip{flex:1;min-width:0;display:flex;align-items:center;justify-content:center;gap:7px;' +
        'height:54px;padding:0 8px;margin:0;border-radius:13px;background:rgba(255,255,255,.94);' +
        'color:#1A1A18;font-size:12px;font-weight:700;letter-spacing:-.4px;line-height:1.15;' +
        'font-family:inherit;border:2px solid transparent;appearance:none;-webkit-appearance:none;' +
        'transition:border-color .18s,transform .18s,box-shadow .18s}' +
      '.dg-xr-chip.on{border-color:#1A1A18;transform:translateY(-3px);box-shadow:0 6px 16px rgba(0,0,0,.35)}' +
      '.dg-xr-chip.pop .dg-xr-sw{animation:dgxrPop .42s ease-out}' +
      '.dg-xr-sw{width:24px;height:24px;border-radius:8px;flex:none;box-shadow:inset 0 0 0 1px rgba(0,0,0,.10)}' +
      '.dg-xr-tx{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
      '.dg-xr-wipe{position:fixed;left:50%;top:55%;width:60vmax;height:60vmax;margin:-30vmax 0 0 -30vmax;' +
        'border-radius:50%;z-index:2147482900;pointer-events:none;opacity:0}' +
      '.dg-xr-wipe.go{animation:dgxrWipe .55s cubic-bezier(.22,.9,.3,1)}' +
      '.dg-xr-toast{position:fixed;left:0;right:0;top:calc(18px + env(safe-area-inset-top,0px));' +
        'z-index:2147483001;text-align:center;pointer-events:none;opacity:0}' +
      '.dg-xr-toast span{display:inline-block;padding:9px 18px;border-radius:999px;' +
        'background:rgba(0,0,0,.62);color:#fff;font-size:14px;font-weight:700;letter-spacing:-.3px;' +
        'font-family:-apple-system,"Apple SD Gothic Neo","Noto Sans KR",Roboto,sans-serif}' +
      '.dg-xr-toast.go{animation:dgxrToast 1.25s ease-out}' +
      '.dg-xr-tap{position:fixed;left:0;top:0;right:0;bottom:0;display:none;'+
        'pointer-events:auto;background:transparent;-webkit-tap-highlight-color:transparent}' +
      '.dg-xr-tap.on{display:block}';
    document.head.appendChild(s);
  }

  function keyOf(mv) {
    var m = (mv.getAttribute('src') || '').match(/mat_([a-z_]+)\.glb/);
    return (m && ORDER.indexOf(m[1]) >= 0) ? m[1] : ORDER[0];
  }

  function mark(bar, key, pop) {
    [].forEach.call(bar.querySelectorAll('.dg-xr-chip'), function (c) {
      var on = c.getAttribute('data-key') === key;
      c.classList.toggle('on', on);
      if (on && pop) { c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); }
    });
  }

  function replay(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

  function apply(ui, key) {
    if (!key || ui.busy || keyOf(ui.mv) === key) return;
    ui.busy = true;
    try { navigator.vibrate && navigator.vibrate(18); } catch (e) {}

    ui.wipe.style.background = 'radial-gradient(circle,' + SWATCH[key] + ' 0%,rgba(0,0,0,0) 70%)';
    replay(ui.wipe, 'go');
    ui.toast.firstChild.textContent = LABEL[key];
    replay(ui.toast, 'go');

    ui.mv.setAttribute('src', HOST + '/models/mat_' + key + '.glb');
    mark(ui.bar, key, true);
    setTimeout(function () { ui.busy = false; }, 450);
  }

  function next(ui, dir) {
    var i = ORDER.indexOf(keyOf(ui.mv));
    apply(ui, ORDER[(i + (dir < 0 ? ORDER.length - 1 : 1)) % ORDER.length]);
  }

  function build(mv) {
    css();
    var ui = { mv: mv, busy: false };

    var bar = document.createElement('div');
    bar.className = 'dg-xr interactive';

    var hint = document.createElement('div');
    hint.className = 'dg-xr-hint';
    hint.textContent = '화면을 톡 누르면 색상이 바뀝니다';

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
        apply(ui, k);
      });
      row.appendChild(c);
    });

    bar.appendChild(hint);
    bar.appendChild(row);

    var wipe = document.createElement('div');  wipe.className = 'dg-xr-wipe';
    var toast = document.createElement('div'); toast.className = 'dg-xr-toast';
    toast.appendChild(document.createElement('span'));

    // 바 위 좌우 스와이프(되는 기기에서만 보너스)
    var x0 = null, y0 = null;
    bar.addEventListener('touchstart', function (ev) {
      x0 = ev.touches[0].clientX; y0 = ev.touches[0].clientY;
    }, { passive: true });
    bar.addEventListener('touchend', function (ev) {
      if (x0 === null) return;
      var t = ev.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0;
      x0 = null;
      if (Math.abs(dx) < 45 || Math.abs(dx) <= Math.abs(dy)) return;
      next(ui, dx < 0 ? 1 : -1);
    }, { passive: true });

    var tap = document.createElement('div');
    tap.className = 'dg-xr-tap interactive';   // interactive → model-viewer 가 XR select 를 막아줘서 DOM 터치가 정상 전달됨

    mv.appendChild(tap); mv.appendChild(bar); mv.appendChild(wipe); mv.appendChild(toast);
    ui.bar = bar; ui.wipe = wipe; ui.toast = toast; ui.tap = tap;

    /* AR 화면 아무데나 톡 → 다음 색상.
       길게 끌면(=매트 옮기기) 무시되도록 이동거리/시간으로 구분. */
    var sx = 0, sy = 0, st = 0, valid = false;
    tap.addEventListener('pointerdown', function (ev) {
      sx = ev.clientX; sy = ev.clientY; st = Date.now(); valid = true;
    });
    tap.addEventListener('pointerup', function (ev) {
      if (!valid) return;
      valid = false;
      if (Date.now() - st > 400) return;
      if (Math.abs(ev.clientX - sx) > 16 || Math.abs(ev.clientY - sy) > 16) return;
      next(ui, 1);
    });
    tap.addEventListener('pointercancel', function () { valid = false; });
    // 일부 기기에서 포인터 이벤트가 XR 쪽으로 먹히는 경우 대비 (apply 의 busy 락으로 중복 방지)
    tap.addEventListener('click', function (ev) { ev.preventDefault(); next(ui, 1); });

    return ui;
  }

  function attach(mv) {
    if (mv.__dgXR) return;
    mv.__dgXR = true;
    mv.setAttribute('ar-modes', 'webxr scene-viewer quick-look');   // 우리 화면으로 AR 그리기
    var ui = build(mv);
    mark(ui.bar, keyOf(mv));
    mv.addEventListener('ar-status', function (ev) {
      var st = (ev.detail && ev.detail.status) || '';
      if (st === 'session-started' || st === 'object-placed') {
        ui.bar.classList.add('on');
        ui.tap.classList.add('on');
        mark(ui.bar, keyOf(mv));
      } else {
        ui.bar.classList.remove('on');
        ui.tap.classList.remove('on');
      }
    });
  }

  function scan() { [].forEach.call(document.querySelectorAll('model-viewer'), attach); }
  scan();
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
})();
