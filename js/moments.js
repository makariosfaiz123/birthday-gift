/* =====================================================================
   js/moments.js — كروت الصور المتكدسة: تحت كل صورة تاريخها وكلام
   - الصور (أو الفيديو) بتظهر كاملة من غير قص
   - اسحب الكارت اللي فوق لأي جنب (أو لمسة): بيطير ويظهر اللي تحته
   - الكارت بيروح تحت الكومة، فالكومة بتلف من غير ما تخلص
   - زرار "كمّل" بيظهر بعد ما تشوف كل الصور مرة
   ===================================================================== */
window.Moments = (function () {
  'use strict';

  const CFG = { visibleCards: 4, flyDistance: 90, flingSpeed: 0.55, tapDistance: 8, flyDuration: 0.5 };

  function init(ctx) {
    const C = ctx.content.moments;
    const stack = document.getElementById('mStack');
    const counter = document.getElementById('mCounter');
    const nextBtn = document.getElementById('mNext');
    const reduced = FX.reduced;

    document.getElementById('mTitle').textContent = C.title;
    document.getElementById('mHint').textContent = C.hint;
    nextBtn.textContent = C.next;
    nextBtn.addEventListener('click', function () { ctx.next(); });

    const items = FX.items(C.cards);
    const n = items.length;
    if (!n) { nextBtn.hidden = false; return { enter: function () {}, leave: function () {} }; }

    // لو مفيش ولا كارت عليه كلام، الكارت بيبقى أقصر
    stack.classList.toggle('no-text', !items.some(function (c) { return c.text; }));

    const rots = items.map(function (_, i) { return (i % 2 ? 1 : -1) * (2.5 + ((i * 5) % 6)); });
    const medias = [];
    const cards = items.map(function (c, i) {
      const el = document.createElement('div');
      el.className = 'pol';
      // الصورة كاملة من غير قص (خلفية مغبّشة منها لو مقاسها غير مقاس الكارت)
      const m = FX.media(c, { fit: 'blur', label: 'Photo ' + (i + 1) });
      m.el.classList.add('pol-photo');
      el.appendChild(m.el);
      medias.push(m);

      // تحت الصورة: التاريخ وتحته كلام
      const cap = document.createElement('div');
      cap.className = 'pol-cap';
      const d = document.createElement('div');
      d.className = 'pol-date';
      d.textContent = c.date || '';
      cap.appendChild(d);
      if (c.text) {
        const t = document.createElement('div');
        t.className = 'pol-text';
        t.textContent = c.text;
        cap.appendChild(t);
      }
      el.appendChild(cap);
      stack.appendChild(el);
      return el;
    });

    const order = items.map(function (_, i) { return i; });   // order[0] = اللي فوق
    const seen = new Set([0]);
    let busy = false, tapDir = 1, started = false;

    function pose(k, idx) {
      if (reduced) return { x: 0, y: 0, rotation: 0, scale: 1, opacity: k === 0 ? 1 : 0 };
      return { x: 0, y: k * 6, rotation: rots[idx], scale: 1 - k * 0.03, opacity: k < CFG.visibleCards ? 1 : 0 };
    }

    function layout(exclude, animate) {
      order.forEach(function (idx, k) {
        if (idx === exclude) return;
        const el = cards[idx];
        el.style.zIndex = n - k;
        if (animate) gsap.to(el, Object.assign(pose(k, idx), { duration: 0.5, ease: 'power3.out', overwrite: 'auto' }));
        else gsap.set(el, pose(k, idx));
      });
    }

    // الفيديو بيشتغل (من غير صوت) وهو الكارت اللي فوق بس
    function syncVideos(active) {
      medias.forEach(function (m, i) {
        if (!m.isVideo) return;
        if (active && i === order[0]) m.play(); else m.pause();
      });
    }

    function updateCounter() {
      counter.textContent = (order[0] + 1) + ' / ' + n;
      if (seen.size >= n && nextBtn.hidden) {
        nextBtn.hidden = false;
        nextBtn.classList.add('pulse');
        gsap.fromTo(nextBtn, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power2.out' });
      }
    }

    function send(dir, dy) {
      if (busy) return;
      busy = true;
      FX.vibrate(8);
      const idx = order[0];
      const el = cards[idx];
      order.push(order.shift());
      seen.add(order[0]);
      updateCounter();
      layout(idx, true);
      syncVideos(true);

      if (reduced) {
        gsap.to(el, { opacity: 0, duration: 0.25, onComplete: function () {
          el.style.zIndex = 1; gsap.set(el, pose(n - 1, idx));
          gsap.to(cards[order[0]], { opacity: 1, duration: 0.3 }); busy = false;
        } });
        return;
      }
      el.style.zIndex = n + 5;
      gsap.to(el, {
        x: dir * window.innerWidth * 1.1, y: (dy || 0) - 40, rotation: rots[idx] + dir * 28,
        duration: CFG.flyDuration, ease: 'power2.in', overwrite: 'auto',
        onComplete: function () { el.style.zIndex = 1; gsap.set(el, pose(n - 1, idx)); busy = false; }
      });
    }

    let drag = null;
    stack.addEventListener('pointerdown', function (e) {
      if (busy || drag) return;
      const now = performance.now();
      drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, t0: now, lx: e.clientX, lt: now, vx: 0, dx: 0, dy: 0 };
      try { stack.setPointerCapture(e.pointerId); } catch (err) { /* مش مشكلة */ }
      if (!reduced) gsap.killTweensOf(cards[order[0]]);
    });
    stack.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      const now = performance.now();
      drag.dx = e.clientX - drag.x0;
      drag.dy = e.clientY - drag.y0;
      const dt = now - drag.lt;
      if (dt > 0) drag.vx = 0.6 * drag.vx + 0.4 * ((e.clientX - drag.lx) / dt);
      drag.lx = e.clientX; drag.lt = now;
      if (reduced) return;
      const idx = order[0];
      gsap.set(cards[idx], { x: drag.dx, y: drag.dy * 0.6, rotation: rots[idx] + drag.dx * 0.06 });
    });
    function endDrag(e) {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag; drag = null;
      const idx = order[0];
      const isTap = Math.hypot(d.dx, d.dy) < CFG.tapDistance && (performance.now() - d.t0) < 350;
      const fling = Math.abs(d.dx) > CFG.flyDistance || Math.abs(d.vx) > CFG.flingSpeed;
      if (e.type !== 'pointercancel' && (isTap || fling)) {
        let dir;
        if (isTap) { dir = tapDir; tapDir = -tapDir; }
        else dir = (Math.abs(d.dx) > 20 ? d.dx : d.vx) >= 0 ? 1 : -1;
        send(dir, d.dy * 0.6);
      } else if (!reduced) {
        gsap.to(cards[idx], { x: 0, y: 0, rotation: rots[idx], duration: 0.6, ease: 'elastic.out(1, 0.6)' });
      }
    }
    stack.addEventListener('pointerup', endDrag);
    stack.addEventListener('pointercancel', endDrag);

    return {
      enter: function () {
        syncVideos(true);
        if (started) return;
        started = true;
        layout(-1, false);
        updateCounter();
        if (reduced) return;
        for (let k = Math.min(CFG.visibleCards, n) - 1; k >= 0; k--) {
          gsap.from(cards[order[k]], { y: 90, opacity: 0, rotation: 0, duration: 0.9, delay: 0.12 * (CFG.visibleCards - 1 - k), ease: 'power3.out' });
        }
      },
      leave: function () { syncVideos(false); }
    };
  }

  return { init: init };
})();
