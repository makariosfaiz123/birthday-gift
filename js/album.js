/* =====================================================================
   js/album.js — الذكريات: ألبوم بيتفتح بضغطة (دزاين الموقع المرجعي)
   - الغلاف: ضغطة = يتفتح زي الكتاب ويبان العارض
   - العارض: صور وGIF وفيديوهات بأي عدد وأي مقاس.
       الإطار (الكارت) بيتفصّل على مقاس الصورة نفسها من غير قص،
       وتحتها مكان للكلام. أسهم + سحب بالإصبع + صور مصغّرة.
   - الفيديو: بيشتغل من غير صوت. لو فتحت الصوت الأغنية بتقف لحد ما تقفله.
   ===================================================================== */
window.Album = (function () {
  'use strict';

  const MIN_W = 186;      // أقل عرض لمحتوى الكارت (بنحسب عليه سطور الكلام)

  function init(ctx) {
    const C = ctx.content.album;
    const items = FX.items(C.items);
    if (!items.length) items.push(FX.items([''])[0]);
    const n = items.length;

    const wrap = document.getElementById('albumStage');
    const cover = document.getElementById('albumCover');
    const coverPhoto = document.getElementById('albumCoverPhoto');
    const viewer = document.getElementById('albumViewer');
    const stage = document.getElementById('viewerStage');
    const photoBox = document.getElementById('viewerPhoto');
    const caption = document.getElementById('viewerCaption');
    const probeEl = document.getElementById('viewerProbe');
    const thumbs = document.getElementById('albumThumbs');
    const sub = document.getElementById('albumSub');
    const cont = document.getElementById('albumContinue');

    document.getElementById('albumTitle').textContent = C.title;
    document.getElementById('albumOpen').textContent = C.openLabel;
    document.getElementById('albumBack').textContent = C.backLabel;
    cont.textContent = C.next;
    cont.addEventListener('click', function () { ctx.next(); });

    // الغلاف: الصورة اللي اخترتها، ولو مفيش أول صورة في الألبوم
    const first = items[0];
    const coverItem = C.cover || (first.isVideo ? (first.poster || '') : first.src);
    coverPhoto.appendChild(FX.media(coverItem, { label: 'Album' }).el);

    let idx = 0, isOpen = false, opened = false, busy = false, token = 0;
    let cur = null;          // { m: الوسائط الحالية, dim: المقاس الحقيقي, text }

    function setSub() {
      sub.textContent = isOpen ? C.counter.replace('{n}', idx + 1).replace('{total}', n) : C.subtitle;
    }
    setSub();

    /* ---------- الصور المصغّرة ---------- */
    const thumbEls = items.map(function (it, i) {
      const t = document.createElement('button');
      t.type = 'button';
      t.className = 'thumb';
      t.setAttribute('aria-label', 'Photo ' + (i + 1));
      t.appendChild(FX.thumb(it, String(i + 1)));
      t.addEventListener('click', function () { show(i); });
      thumbs.appendChild(t);
      return t;
    });

    function updateChrome() {
      thumbEls.forEach(function (t, k) { t.classList.toggle('active', k === idx); });
      const t = thumbEls[idx];
      if (t && thumbs.scrollWidth > thumbs.clientWidth) {
        const tr = t.getBoundingClientRect(), br = thumbs.getBoundingClientRect();
        thumbs.scrollTo({ left: thumbs.scrollLeft + (tr.left - br.left) - (br.width - tr.width) / 2, behavior: 'smooth' });
      }
      setSub();
    }

    /* ---------- مقاس الإطار: على مقاس الصورة نفسها ----------
       بناخد نسبة الصورة (عرض ÷ طول) ونكبّرها أو نصغّرها لحد ما تتحشر في أكبر
       مساحة متاحة (عرض الشاشة وارتفاع العارض) من غير ما نقص منها حاجة،
       وبنسيب مكان لسطور الكلام اللي تحتها. */
    function probeHeight(text, w) {
      probeEl.style.width = Math.round(w) + 'px';
      probeEl.textContent = text;
      return probeEl.offsetHeight;
    }

    function computeSize(dim, text) {
      const availW = Math.min(wrap.clientWidth || 300, 330);
      // ارتفاع منطقة العارض: نسبة من ارتفاع الشاشة، عشان الأزرار اللي تحتها (ومنها "كمّل") تفضل ظاهرة فوق الشريط السفلي
      const stageH = Math.round(Math.min(460, Math.max(280, window.innerHeight * 0.43)));
      stage.style.height = stageH + 'px';
      const maxW = availW - 26;                                   // 26 = حواف الكارت (12 + 12 + الحدود)
      const ratio = dim && dim.w && dim.h ? dim.w / dim.h : 5 / 6;
      const chrome = 26 + (text ? 10 : 0);                        // حواف الكارت + مسافة الكلام

      const fitFor = function (capH) {
        let h = Math.min(maxW / ratio, Math.max(110, stageH - chrome - capH));
        let w = h * ratio;
        if (w > maxW) { w = maxW; h = w / ratio; }
        return { w: w, h: h };
      };

      let s = fitFor(text ? probeHeight(text, MIN_W) : 0);        // مرحلة 1: أطول كلام ممكن (عرض ضيّق)
      if (text) s = fitFor(probeHeight(text, Math.max(s.w, MIN_W)));   // مرحلة 2: على العرض الحقيقي
      return { w: Math.round(s.w), h: Math.round(s.h) };
    }

    function applySize(dim, text, instant) {
      const s = computeSize(dim, text);
      if (instant || FX.reduced) gsap.set(photoBox, { width: s.w, height: s.h });
      else gsap.to(photoBox, { width: s.w, height: s.h, duration: 0.45, ease: 'power3.out', overwrite: true });
    }

    function setCaption(text, instant) {
      const apply = function () { caption.textContent = text || ''; caption.classList.toggle('empty', !text); };
      if (instant || FX.reduced) { gsap.killTweensOf(caption); gsap.set(caption, { autoAlpha: 1 }); apply(); return; }
      gsap.to(caption, {
        autoAlpha: 0, duration: 0.12, overwrite: true,
        onComplete: function () { apply(); gsap.to(caption, { autoAlpha: 1, duration: 0.25 }); }
      });
    }

    /* ---------- عرض صورة / فيديو ---------- */
    function destroyCurrent() {
      if (!cur) return;
      const c = cur;
      cur = null;
      c.m.destroy();
      c.m.el.remove();
    }

    function prefetch(i) {
      if (n < 2) return;
      FX.probe(items[(i + 1) % n]);
      FX.probe(items[(i - 1 + n) % n]);
    }

    function show(i, dir, instant) {
      i = ((i % n) + n) % n;
      if (cur && i === idx && !instant) return;
      const d = dir || (i >= idx ? 1 : -1);
      const my = ++token;
      const item = items[i];

      const m = FX.media(item, {
        controls: true, autoplay: true, label: 'Photo ' + (i + 1),
        onSound: function (on) { if (on) ctx.music.hold(); else ctx.music.release(); }
      });
      m.el.classList.add('slide');
      photoBox.appendChild(m.el);

      const old = cur;
      const knownDim = FX.known(item);
      cur = { m: m, dim: knownDim, text: item.text || '' };
      idx = i;
      updateChrome();
      setCaption(item.text, !old || instant);

      // المقاس: لو عارفينه نطبّقه فورًا، وإلا مقاس مبدئي لحد ما الملف يوصّل مقاسه
      if (knownDim) applySize(knownDim, item.text, !old || instant);
      else if (!old || instant) applySize(null, item.text, true);
      if (!knownDim) {
        m.ready.then(function (dim) {
          if (my !== token) return;
          cur.dim = dim;
          applySize(dim, item.text, false);
        });
      }

      if (old) {
        const oe = old.m.el;
        const kill = function () { old.m.destroy(); oe.remove(); };
        if (FX.reduced) kill();
        else gsap.to(oe, { x: -d * 40, autoAlpha: 0, duration: 0.3, ease: 'power2.in', onComplete: kill });
      }
      if (FX.reduced) gsap.set(m.el, { autoAlpha: 1 });
      else gsap.fromTo(m.el, { x: d * 40, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.4, delay: old ? 0.08 : 0, ease: 'power2.out' });

      prefetch(i);
    }

    /* ---------- فتح الألبوم وقفله ---------- */
    function open() {
      if (isOpen || busy) return;
      busy = true;
      isOpen = true;
      FX.vibrate(15);
      show(idx, 1, true);

      const done = function () {
        cover.hidden = true;
        viewer.hidden = false;
        gsap.fromTo(viewer, { autoAlpha: 0, y: 16, scale: 0.95 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out', onComplete: function () { busy = false; } });
        if (!opened) {
          opened = true;
          cont.hidden = false;
          gsap.fromTo(cont, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8, delay: 0.7 });
          cont.classList.add('pulse');
        }
      };
      if (FX.reduced) { done(); return; }
      gsap.to(cover, { rotationY: -105, autoAlpha: 0, duration: 0.7, ease: 'power2.inOut', onComplete: done });
    }

    function close() {
      if (!isOpen || busy) return;
      busy = true;
      isOpen = false;
      setSub();
      if (cur) cur.m.pause();
      const done = function () {
        destroyCurrent();
        viewer.hidden = true;
        cover.hidden = false;
        gsap.set(cover, { rotationY: -105, autoAlpha: 0 });
        gsap.to(cover, { rotationY: 0, autoAlpha: 1, duration: 0.7, ease: 'power2.out', onComplete: function () { busy = false; } });
      };
      if (FX.reduced) { destroyCurrent(); viewer.hidden = true; cover.hidden = false; gsap.set(cover, { clearProps: 'all' }); busy = false; return; }
      gsap.to(viewer, { autoAlpha: 0, scale: 0.95, duration: 0.35, onComplete: done });
    }

    cover.addEventListener('click', open);
    document.getElementById('albumBack').addEventListener('click', close);
    document.getElementById('albumPrev').addEventListener('click', function () { show(idx - 1, -1); });
    document.getElementById('albumNext').addEventListener('click', function () { show(idx + 1, 1); });

    // سحب بالإصبع (يمين / شمال)
    let sx = null, sy = 0;
    stage.addEventListener('pointerdown', function (e) {
      if (e.target.closest && e.target.closest('.vid-sound')) return;
      sx = e.clientX; sy = e.clientY;
    });
    stage.addEventListener('pointerup', function (e) {
      if (sx === null) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      sx = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) show(dx < 0 ? idx + 1 : idx - 1, dx < 0 ? 1 : -1);
    });
    stage.addEventListener('pointercancel', function () { sx = null; });

    // كيبورد الكمبيوتر
    document.addEventListener('keydown', function (e) {
      if (!ctx.isCurrent('album') || !isOpen) return;
      if (e.key === 'ArrowRight') show(idx + 1, 1);
      else if (e.key === 'ArrowLeft') show(idx - 1, -1);
    });

    // لو الشاشة اتقلبت أو اتغيّر مقاسها نعيد حساب الإطار
    let rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { if (isOpen && cur) applySize(cur.dim, cur.text, true); }, 120);
    });

    return {
      enter: function () {
        if (isOpen && !cur) show(idx, 1, true);
        if (!FX.reduced) gsap.from('#screen-album .content-wrapper > h2, #screen-album .content-wrapper > p, #albumStage', { y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out' });
      },
      leave: function () { destroyCurrent(); }
    };
  }

  return { init: init };
})();
