/* =====================================================================
   js/fx.js — الخلفية والمؤثرات المشتركة
   - قلوب طايرة، علم زينة، قلوب بتطلع مع كل لمسة، كونفيتي
   - وسائط: صور وGIF وفيديو (FX.media)
   ===================================================================== */
window.FX = (function () {
  'use strict';

  const PINKS = ['#f472b6', '#fbcfe8', '#db2777', '#fda4af', '#ffffff', '#fce7f3'];
  const rand = (a, b) => a + Math.random() * (b - a);

  /* ---------- قلوب طايرة (نفس قيم الموقع المرجعي) ---------- */
  const HEARTS = [
    ['6%', 26, '6.5s', '0s', '20px', '12deg', '🩷', .75], ['14%', 30, '8s', '2.5s', '-25px', '-15deg', '💖', .8],
    ['22%', 20, '7s', '1s', '15px', '10deg', '✨', .7], ['30%', 28, '9s', '3.5s', '-30px', '-20deg', '💕', .85],
    ['38%', 24, '6.2s', '.5s', '25px', '18deg', '🩷', .7], ['48%', 32, '7.8s', '4s', '-15px', '-10deg', '🎈', .75],
    ['56%', 26, '8.5s', '1.8s', '20px', '14deg', '💖', .8], ['64%', 22, '6.8s', '3s', '-20px', '-12deg', '✨', .7],
    ['72%', 28, '7.5s', '.8s', '30px', '20deg', '🩷', .85], ['80%', 24, '8.2s', '2.2s', '-25px', '-16deg', '💕', .75],
    ['88%', 30, '7.2s', '4.5s', '15px', '12deg', '💖', .8], ['94%', 22, '6.5s', '1.5s', '-18px', '-14deg', '🩷', .7],
    ['18%', 26, '8.7s', '5s', '22px', '15deg', '💗', .75], ['84%', 28, '7.6s', '3.8s', '-22px', '-18deg', '✨', .7],
    ['50%', 34, '9.2s', '2s', '18px', '10deg', '💖', .8]
  ];

  function floatingHearts() {
    const box = document.getElementById('hearts');
    HEARTS.forEach(function (h) {
      const s = document.createElement('span');
      s.className = 'floating-heart';
      s.textContent = h[6];
      s.style.left = h[0];
      s.style.fontSize = h[1] + 'px';
      s.style.setProperty('--duration', h[2]);
      s.style.setProperty('--delay', h[3]);
      s.style.setProperty('--sway-x', h[4]);
      s.style.setProperty('--rot', h[5]);
      s.style.setProperty('--max-opacity', h[7]);
      box.appendChild(s);
    });
  }

  /* ---------- علم الزينة (بيتحسب على عرض الشاشة) ---------- */
  function bunting() {
    const svg = document.getElementById('bunting');
    const w = window.innerWidth || document.documentElement.clientWidth, h = 84, y0 = 10, sag = 15;
    if (!w) return;   // الصفحة لسه ماخدتش مقاس (بنعيد الرسم مع resize)
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    const curveY = function (x) { return y0 + sag * 4 * (x / w) * (1 - x / w); };
    const slope = function (x) { return sag * 4 * (1 / w) * (1 - 2 * x / w); };
    const n = Math.max(6, Math.round(w / 38));
    let html = '<path d="M0 ' + y0 + ' Q ' + (w / 2) + ' ' + (y0 + sag * 2) + ' ' + w + ' ' + y0 + '" fill="none" stroke="#50152d" stroke-width="2"/>';
    for (let i = 0; i < n; i++) {
      const x = (i + 0.5) * (w / n);
      const y = curveY(x);
      const a = Math.atan(slope(x)) * 180 / Math.PI;
      html += '<g transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + a.toFixed(1) + ')">' +
        '<polygon points="-14,0 14,0 0,38" fill="' + (i % 2 ? '#f472b6' : '#db2777') + '"/></g>';
    }
    svg.innerHTML = html;
  }

  /* ---------- قلوب بتطلع مع كل لمسة ---------- */
  const BURST = ['💖', '🩷', '💕', '💗', '✨'];
  function tapHearts() {
    document.addEventListener('pointerdown', function (e) {
      const count = 4 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const a = (2 * Math.PI * i) / count + (Math.random() - 0.5) * 0.4;
        const d = 35 + Math.random() * 45;
        const s = document.createElement('span');
        s.className = 'click-heart-burst';
        s.textContent = BURST[Math.floor(Math.random() * BURST.length)];
        s.style.left = e.clientX + 'px';
        s.style.top = e.clientY + 'px';
        s.style.fontSize = (18 + Math.random() * 12) + 'px';
        s.style.setProperty('--bx', (Math.cos(a) * d) + 'px');
        s.style.setProperty('--by', (-Math.abs(Math.sin(a) * d) - (25 + Math.random() * 45)) + 'px');
        s.style.setProperty('--br', ((Math.random() - 0.5) * 40) + 'deg');
        document.body.appendChild(s);
        setTimeout(function () { s.remove(); }, 1350);
      }
    }, { passive: true });
  }

  /* ---------- كونفيتي ---------- */
  let conf = null;
  function confettiInstance() {
    if (!conf && window.confetti) {
      conf = window.confetti.create(document.getElementById('confetti-canvas'), { resize: true, useWorker: false });
    }
    return conf;
  }
  const reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function burst(x, y) {
    const c = confettiInstance();
    if (!c || reduced) return;
    const base = { colors: PINKS, origin: { x: x / window.innerWidth, y: y / window.innerHeight }, zIndex: 100 };
    c(Object.assign({}, base, { particleCount: 90, spread: 80, startVelocity: 48 }));
    setTimeout(function () { c(Object.assign({}, base, { particleCount: 60, spread: 120, startVelocity: 36, scalar: 0.9 })); }, 180);
  }

  // مطر كونفيتي من فوق (زي المرجع)
  function rain(ms) {
    const c = confettiInstance();
    if (!c || reduced) return;
    const end = Date.now() + (ms || 2200);
    (function frame() {
      c({ particleCount: 5, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors: PINKS, zIndex: 100 });
      c({ particleCount: 5, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors: PINKS, zIndex: 100 });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }

  // ألعاب نارية
  function fireworks(ms) {
    const c = confettiInstance();
    if (!c || reduced) return;
    const end = Date.now() + ms;
    (function frame() {
      if (Date.now() > end) return;
      c({
        colors: PINKS.concat(['#facc15']), zIndex: 100,
        origin: { x: rand(0.12, 0.88), y: rand(0.1, 0.45) },
        particleCount: Math.round(rand(40, 70)), spread: 360, startVelocity: rand(22, 36),
        gravity: 0.7, decay: 0.93, ticks: 110, scalar: rand(0.9, 1.3)
      });
      setTimeout(frame, rand(170, 380));
    })();
  }

  /* =====================================================================
     وسائط: صورة / GIF / فيديو. النوع بيتعرف من امتداد الملف
     (mp4 / m4v / mov / webm = فيديو، أي حاجة تانية = صورة).
     العنصر ممكن يبقى مسار بس، أو { src, text, date, poster, type }.
     ===================================================================== */
  const VIDEO_EXT = /\.(mp4|m4v|mov|webm|ogv)(\?.*)?(#.*)?$/i;
  const dimsCache = {};   // مسار الملف -> { w, h } (المقاس الحقيقي بعد ما يتحمّل)

  function norm(item) {
    const o = (typeof item === 'string') ? { src: item } : Object.assign({}, item || {});
    o.src = o.src || o.photo || o.image || o.video || '';
    if (o.caption && !o.text) o.text = o.caption;
    o.isVideo = o.type ? o.type === 'video' : VIDEO_EXT.test(o.src);
    return o;
  }
  function items(list) { return (list || []).map(norm); }
  function known(item) { return dimsCache[norm(item).src] || null; }

  // بيجيب المقاس الحقيقي للصورة/الفيديو من غير ما يعرضه (ونخزّنه عشان مايتحمّلش تاني)
  function probe(item) {
    const o = norm(item);
    if (!o.src) return Promise.resolve(null);
    if (dimsCache[o.src]) return Promise.resolve(dimsCache[o.src]);
    return new Promise(function (resolve) {
      const done = function (d) { if (d) dimsCache[o.src] = d; resolve(d); };
      if (o.isVideo) {
        const v = document.createElement('video');
        v.preload = 'metadata'; v.muted = true;
        v.addEventListener('loadedmetadata', function () {
          const d = v.videoWidth && v.videoHeight ? { w: v.videoWidth, h: v.videoHeight } : null;
          v.removeAttribute('src'); v.load();
          done(d);
        }, { once: true });
        v.addEventListener('error', function () { done(null); }, { once: true });
        v.src = o.src;
      } else {
        const img = new Image();
        img.onload = function () { done(img.naturalWidth && img.naturalHeight ? { w: img.naturalWidth, h: img.naturalHeight } : null); };
        img.onerror = function () { done(null); };
        img.src = o.src;
      }
    });
  }

  const ICON_SND_ON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  const ICON_SND_OFF = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3z"/><path d="M16 9.5l5 5M21 9.5l-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

  /* بيرجّع { el, ready, isVideo, play(), pause(), destroy() }
     opts: fit      'cover' (يملا الإطار) | 'blur' (الصورة كاملة وحواليها خلفية مغبّشة منها)
           label    الكلمة اللي تظهر في المربع التجريبي
           lazy     تحميل الصورة لما تظهر (للصور المصغّرة)
           autoplay الفيديو يشتغل لوحده (من غير صوت)
           controls الفيديو: لمسة = إيقاف/تشغيل + زرار صوت + شريط تقدّم
           onSound  بيتنادى (true/false) لما الصوت يتفتح أو يتقفل */
  function media(item, opts) {
    opts = opts || {};
    const o = norm(item);
    const fit = opts.fit === 'blur' ? 'blur' : 'cover';
    const box = document.createElement('div');
    box.className = 'ph' + (fit === 'blur' ? ' fit-blur' : '');
    let resolveReady;
    const ready = new Promise(function (r) { resolveReady = r; });
    let destroyed = false;
    const api = { el: box, ready: ready, isVideo: o.isVideo, item: o, play: function () {}, pause: function () {}, destroy: function () { destroyed = true; } };

    function placeholder() {
      if (destroyed) return;
      box.classList.remove('is-loading', 'fit-blur');
      box.classList.add('is-ph');
      box.textContent = '';
      const h = document.createElement('span'); h.className = 'ph-heart'; h.textContent = o.isVideo ? '🎬' : '💗';
      const l = document.createElement('span'); l.className = 'ph-label'; l.textContent = opts.label || '';
      box.appendChild(h); box.appendChild(l);
      resolveReady(null);
    }

    if (!o.src) { placeholder(); return api; }
    box.classList.add('is-loading');

    /* ---------- صورة / GIF ---------- */
    if (!o.isVideo) {
      const img = new Image();
      img.className = 'ph-main';
      img.alt = ''; img.decoding = 'async'; img.draggable = false;
      if (opts.lazy) img.loading = 'lazy';
      img.addEventListener('load', function () {
        box.classList.remove('is-loading');
        const d = img.naturalWidth && img.naturalHeight ? { w: img.naturalWidth, h: img.naturalHeight } : null;
        if (d) dimsCache[o.src] = d;
        resolveReady(d);
      });
      img.addEventListener('error', placeholder);
      if (fit === 'blur') {
        const bg = new Image();
        bg.className = 'ph-bg'; bg.alt = ''; bg.draggable = false;
        bg.setAttribute('aria-hidden', 'true');
        if (opts.lazy) bg.loading = 'lazy';
        bg.src = o.src;
        box.appendChild(bg);
      }
      img.src = o.src;
      box.appendChild(img);
      return api;
    }

    /* ---------- فيديو ---------- */
    const v = document.createElement('video');
    v.className = 'ph-main';
    v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true;
    v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('webkit-playsinline', '');
    v.preload = opts.autoplay ? 'auto' : 'metadata';
    v.autoplay = !!opts.autoplay;
    if (o.poster) v.poster = o.poster;
    const loaded = function () { box.classList.remove('is-loading'); };
    v.addEventListener('loadedmetadata', function () {
      const d = v.videoWidth && v.videoHeight ? { w: v.videoWidth, h: v.videoHeight } : null;
      if (d) dimsCache[o.src] = d;
      resolveReady(d);
    });
    ['loadeddata', 'canplay', 'playing'].forEach(function (ev) { v.addEventListener(ev, loaded); });
    v.addEventListener('error', placeholder);
    // #t=0.001 عشان أول فريم يظهر حتى لو الفيديو واقف
    v.src = (o.src.indexOf('#') < 0 && !/^(blob|data):/.test(o.src)) ? o.src + '#t=0.001' : o.src;
    box.appendChild(v);

    api.play = function () { const p = v.play(); if (p && p.catch) p.catch(function () {}); };
    api.pause = function () { v.pause(); };
    api.destroy = function () {
      destroyed = true;
      try { v.pause(); } catch (e) { /* مش مشكلة */ }
      if (!v.muted && opts.onSound) { v.muted = true; opts.onSound(false); }
      v.removeAttribute('src');
      v.load();
    };

    if (opts.controls) {
      const ui = document.createElement('div');
      ui.className = 'vid-ui';
      ui.innerHTML = '<button type="button" class="vid-sound" aria-label="sound">' + ICON_SND_OFF + '</button>' +
        '<i class="vid-prog"><b></b></i><span class="vid-glyph" aria-hidden="true"></span>';
      box.appendChild(ui);
      const sound = ui.querySelector('.vid-sound');
      const bar = ui.querySelector('.vid-prog b');
      const glyph = ui.querySelector('.vid-glyph');

      const flash = function (txt) {
        glyph.textContent = txt;
        glyph.classList.remove('show');
        void glyph.offsetWidth;          // نعيد تشغيل الأنيميشن
        glyph.classList.add('show');
      };

      sound.addEventListener('click', function (e) {
        e.stopPropagation();
        v.muted = !v.muted;
        sound.innerHTML = v.muted ? ICON_SND_OFF : ICON_SND_ON;
        sound.classList.toggle('on', !v.muted);
        if (opts.onSound) opts.onSound(!v.muted);
        if (!v.muted && v.paused) api.play();
      });

      v.addEventListener('timeupdate', function () {
        if (v.duration) bar.style.width = (v.currentTime / v.duration * 100) + '%';
      });

      // لمسة (من غير سحب) = إيقاف / تشغيل
      let down = null;
      box.addEventListener('pointerdown', function (e) { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
      box.addEventListener('pointerup', function (e) {
        if (!down) return;
        const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
        const dt = performance.now() - down.t;
        down = null;
        if (moved > 10 || dt > 600 || box.classList.contains('is-ph')) return;
        if (e.target.closest && e.target.closest('.vid-sound')) return;
        if (v.paused) { api.play(); flash('▶'); } else { v.pause(); flash('❚❚'); }
      });
    }
    return api;
  }

  // صورة مصغّرة (الفيديو من غير ما نحمّله: مربع بعلامة تشغيل، أو poster لو موجود)
  function thumb(item, label) {
    const o = norm(item);
    if (o.isVideo) {
      const box = document.createElement('div');
      box.className = 'ph is-video';
      if (o.poster) {
        const img = new Image();
        img.className = 'ph-main'; img.alt = ''; img.loading = 'lazy'; img.decoding = 'async'; img.draggable = false;
        img.src = o.poster;
        box.appendChild(img);
      }
      const p = document.createElement('span');
      p.className = 'ph-play'; p.textContent = '▶';
      box.appendChild(p);
      return box;
    }
    return media(o, { lazy: true, label: label }).el;
  }

  function vibrate(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) { /* مش مشكلة */ } }
  const sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  function init() {
    floatingHearts();
    bunting();
    tapHearts();
    let t;
    window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(bunting, 150); });
    window.addEventListener('load', bunting);
  }

  return {
    init: init, burst: burst, rain: rain, fireworks: fireworks,
    media: media, thumb: thumb, probe: probe, known: known, items: items,
    vibrate: vibrate, sleep: sleep, rand: rand, reduced: reduced
  };
})();
