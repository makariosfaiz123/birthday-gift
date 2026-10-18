/* =====================================================================
   js/letter.js — صفحة الرسالة (كارت الموقع المرجعي + كتابة حرف حرف)
   - كل كلمة ليها "شبح" شفاف بيحجز مكانها، والحروف بتتكتب فوقه،
     فالسطور ماتتحركش ولا الكلمة تنط لسطر تاني وهي بتتكتب.
   - لمسة على الكارت = إظهار الرسالة كاملة
   ===================================================================== */
window.Letter = (function () {
  'use strict';

  const SLOW = /[،.؟!?,:؛]/;

  function init(ctx) {
    const C = ctx.content.letter;
    const body = document.getElementById('letterBody');
    const scroll = document.getElementById('letterScroll');
    const card = document.getElementById('letterCard');
    const nextBtn = document.getElementById('letterNext');
    const skipHint = document.getElementById('letterSkip');
    const divider = document.getElementById('letterDiv');
    const sign = document.getElementById('letterSign');

    document.getElementById('letterTitle').textContent = C.title;
    document.getElementById('letterClosing').textContent = C.closing;
    document.getElementById('letterSignature').textContent = C.signature;
    nextBtn.textContent = C.next;
    nextBtn.addEventListener('click', function () { ctx.next(); });

    // صورة القلب
    if (C.photo) {
      const img = document.getElementById('letterPhoto');
      img.addEventListener('load', function () {
        img.setAttribute('opacity', '1');
        document.getElementById('letterPhText').setAttribute('opacity', '0');
      });
      img.setAttribute('href', C.photo);
    }

    /* ---------- بناء الكلمات ---------- */
    const words = [];   // { typed, text }
    body.setAttribute('aria-label', C.body.replace(/\n+/g, ' '));
    C.body.split('\n').forEach(function (line) {
      const p = document.createElement('span');
      p.className = 'para';
      p.setAttribute('aria-hidden', 'true');
      line.split(' ').filter(Boolean).forEach(function (txt, i, arr) {
        const w = document.createElement('span');
        w.className = 'w';
        const g = document.createElement('span');
        g.className = 'ghost';
        g.textContent = txt;
        const t = document.createElement('span');
        t.className = 'typed';
        w.appendChild(g);
        w.appendChild(t);
        p.appendChild(w);
        if (i < arr.length - 1) p.appendChild(document.createTextNode(' '));
        words.push({ w: w, typed: t, text: txt, endOfPara: i === arr.length - 1 });
      });
      body.appendChild(p);
    });

    let state = 'idle';      // idle | typing | done
    let wi = 0, ci = 0, timer = null, current = null;

    function follow(w) {
      const sr = scroll.getBoundingClientRect();
      const wr = w.getBoundingClientRect();
      const margin = 36;
      if (wr.bottom > sr.bottom - margin) {
        scroll.scrollTo({ top: scroll.scrollTop + (wr.bottom - sr.bottom) + margin + 20, behavior: 'smooth' });
      }
    }

    function setCaret(t) {
      if (current && current !== t) current.classList.remove('caret');
      current = t;
      if (t) t.classList.add('caret');
    }

    function finish(instant) {
      clearTimeout(timer);
      state = 'done';
      words.forEach(function (o) { o.typed.textContent = o.text; });
      setCaret(null);
      gsap.to([divider, sign], { opacity: 1, duration: instant ? 0.4 : 1.2, stagger: 0.25, ease: 'power2.out' });
      scroll.scrollTo({ top: scroll.scrollHeight, behavior: 'smooth' });
      gsap.to(skipHint, { autoAlpha: 0, duration: 0.3, onComplete: function () { skipHint.hidden = true; } });
      nextBtn.hidden = false;
      nextBtn.classList.add('pulse');
      gsap.fromTo(nextBtn, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: instant ? 0.2 : 0.6 });
    }

    function tick() {
      if (state !== 'typing') return;
      if (wi >= words.length) { finish(false); return; }
      const o = words[wi];
      ci++;
      o.typed.textContent = o.text.slice(0, ci);
      setCaret(o.typed);
      follow(o.w);

      let delay = 58 + Math.random() * 40;
      if (ci >= o.text.length) {
        const last = o.text.charAt(o.text.length - 1);
        wi++; ci = 0;
        delay += 40;
        if (SLOW.test(last)) delay += 260;
        if (o.endOfPara) delay += 650;
      }
      timer = setTimeout(tick, delay);
    }

    function startTyping() {
      if (state !== 'idle') return;
      state = 'typing';
      timer = setTimeout(tick, 900);
    }

    card.addEventListener('click', function () {
      if (state === 'typing') finish(true);
    });

    return {
      enter: function () {
        if (state === 'idle') {
          nextBtn.hidden = true;
          startTyping();
        }
      },
      leave: function () { /* لو رجع للصفحة تاني الحالة محفوظة */ }
    };
  }

  return { init: init };
})();
