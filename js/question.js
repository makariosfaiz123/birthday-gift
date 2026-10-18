/* =====================================================================
   js/question.js — السؤال: "Will you stay with me forever?"
   زي الموقع المرجعي: كل ضغطة على No بتغيّر كلامه وتكبّر Yes،
   وهنا زودنا إن No بيهرب بعد الضغطة التانية.
   الإجابة بتحصل بالضغط على Yes بس (No مهما اتضغط ما بيجاوبش).
   ===================================================================== */
window.Question = (function () {
  'use strict';

  function init(ctx) {
    const C = ctx.content.question;
    const yes = document.getElementById('qYes');
    const no = document.getElementById('qNo');
    const area = document.getElementById('qButtons');
    const ask = document.getElementById('qAsk');
    const done = document.getElementById('qDone');
    const stars = document.getElementById('qStars');
    const nextBtn = document.getElementById('qNext');

    document.getElementById('qEyebrow').textContent = C.eyebrow;
    document.getElementById('qTitle').textContent = C.title;
    document.getElementById('qPhoto').appendChild(FX.media(C.photo, { label: 'Photo' }).el);
    document.getElementById('qDonePhoto').appendChild(FX.media(C.donePhoto || C.photo, { label: 'Photo' }).el);
    document.getElementById('qDoneTitle').textContent = C.doneTitle;
    document.getElementById('qDoneText').textContent = C.doneText;
    nextBtn.textContent = C.next;
    nextBtn.addEventListener('click', function () { ctx.next(); });
    yes.textContent = C.yes;
    no.textContent = C.no[0];

    let n = 0, answered = false;

    function grow() {
      const k = Math.min(n, 5);
      yes.style.fontSize = (1.1 + 0.12 * k) + 'rem';
      yes.style.padding = (0.8 + 0.1 * k) + 'rem ' + (2.2 + 0.15 * k) + 'rem';
    }

    function dodge() {
      if (FX.reduced) return;
      const a = area.getBoundingClientRect();
      const b = no.getBoundingClientRect();
      const baseX = b.left - (parseFloat(gsap.getProperty(no, 'x')) || 0);
      const baseY = b.top - (parseFloat(gsap.getProperty(no, 'y')) || 0);
      const margin = 8;
      const minX = a.left + margin - baseX, maxX = a.right - margin - b.width - baseX;
      const minY = a.top - 10 - baseY, maxY = a.bottom - b.height + 10 - baseY;
      // نختار مكان جديد مايتلزقش في Yes (بنجرّب كذا مرة)
      const yr = yes.getBoundingClientRect();
      // ناخد أبعد مكان عن Yes من 24 محاولة عشوائية
      let best = { x: 0, y: 0, d: -1 };
      for (let i = 0; i < 24; i++) {
        const x = FX.rand(Math.min(minX, maxX), Math.max(minX, maxX));
        const y = FX.rand(Math.min(minY, maxY), Math.max(minY, maxY));
        const L = baseX + x, T = baseY + y;
        const gapX = Math.max(yr.left - (L + b.width), L - yr.right);    // موجب = فاصل أفقي بينهم
        const gapY = Math.max(yr.top - (T + b.height), T - yr.bottom);   // موجب = فاصل رأسي بينهم
        const d = Math.max(gapX, gapY);
        if (d > best.d) best = { x: x, y: y, d: d };
      }
      gsap.to(no, { x: best.x, y: best.y, rotation: FX.rand(-8, 8), duration: 0.4, ease: 'back.out(1.6)' });
    }

    // No بتغيّر كلامه وتهرب، بس مهما ضغطت عليه ما بيجاوبش: الإجابة بتحصل بـYes بس
    function press() {
      if (answered) return;
      n++;
      FX.vibrate(12);
      no.textContent = C.no[Math.min(n, C.no.length - 1)];
      grow();
      if (n >= 3) yes.classList.add('pulse');
      if (n >= 2) setTimeout(dodge, 300);   // بعد ما Yes يخلّص تكبير، عشان نحسب مكانه صح
    }

    // pointerdown عشان لو الزرار هرب مايفلتش من الضغطة
    no.addEventListener('pointerdown', function (e) { e.preventDefault(); press(); });
    no.addEventListener('click', function (e) { if (e.detail === 0) press(); });   // كيبورد

    function makeStars() {
      for (let t = 0; t < 15; t++) {
        const s = document.createElement('i');
        s.style.top = (10 + (12 * t) % 80) + '%';
        s.style.left = (5 + (13 * t) % 90) + '%';
        s.style.animationDelay = (t * 0.17) + 's';
        stars.appendChild(s);
      }
    }

    function sayYes() {
      if (answered) return;
      answered = true;
      FX.vibrate([30, 40, 30]);
      const r = yes.getBoundingClientRect();
      FX.burst(r.left + r.width / 2, r.top + r.height / 2);
      FX.rain(2600);
      makeStars();
      stars.classList.add('on');

      gsap.to(ask, {
        autoAlpha: 0, y: -10, duration: 0.4, onComplete: function () {
          ask.hidden = true;
          done.hidden = false;
          gsap.fromTo(done.children, { autoAlpha: 0, y: 18, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.18, ease: 'back.out(1.4)' });
          nextBtn.classList.add('pulse');
        }
      });
    }
    yes.addEventListener('click', sayYes);

    return {
      enter: function () {
        if (!FX.reduced && !answered) gsap.from('#screen-question .content-wrapper > *', { y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out' });
      }
    };
  }

  return { init: init };
})();
