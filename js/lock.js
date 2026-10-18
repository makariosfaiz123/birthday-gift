/* =====================================================================
   js/lock.js — شاشة القفل (الكود = تاريخ الميلاد)
   - 8 نقط وكيبورد أرقام (لمس أو كيبورد الكمبيوتر)
   - أول لمسة = الأغنية تبدأ (المتصفح بيسمح بالصوت بعد لمسة بس)
   - كود غلط: النقط تهتز وتطلع الرسالة
   - كود صح: النقط تنوّر، كونفيتي، ونفتح الرسالة
   ===================================================================== */
window.Lock = (function () {
  'use strict';

  function init(ctx) {
    const C = ctx.content.lock;
    const code = String(ctx.content.lockCode);
    const dotsEl = document.getElementById('pinDots');
    const hint = document.getElementById('lockHint');
    const keypad = document.getElementById('keypad');

    document.getElementById('lockEyebrow').textContent = C.eyebrow;
    document.getElementById('lockTitle').textContent = C.title;
    document.getElementById('lockAccent').textContent = C.accent;
    hint.textContent = C.hint;

    const dots = [];
    for (let i = 0; i < code.length; i++) {
      const d = document.createElement('i');
      d.className = 'pin-dot';
      dotsEl.appendChild(d);
      dots.push(d);
    }

    let entered = '';
    let locked = false;   // وقت الأنيميشن مفيش إدخال

    function paint() {
      dots.forEach(function (d, i) { d.classList.toggle('on', i < entered.length); });
    }

    function setHint(text, wrong) {
      hint.textContent = text;
      hint.classList.toggle('wrong', !!wrong);
    }

    async function wrong() {
      locked = true;
      FX.vibrate([60, 40, 60]);
      dotsEl.classList.add('err', 'shake');
      setHint(C.wrong, true);
      await FX.sleep(650);
      dotsEl.classList.remove('err', 'shake');
      entered = '';
      paint();
      await FX.sleep(1500);
      setHint(C.hint, false);
      locked = false;
    }

    async function right() {
      locked = true;
      FX.vibrate(40);
      dotsEl.classList.add('ok');
      setHint('✨', false);
      const r = dotsEl.getBoundingClientRect();
      FX.burst(r.left + r.width / 2, r.top);
      gsap.to('#lockIcon', { scale: 1.35, rotate: -10, duration: 0.35, yoyo: true, repeat: 1, ease: 'power2.out' });
      await FX.sleep(1100);
      ctx.unlock();
    }

    function press(k) {
      if (locked) return;
      ctx.music.arm();                 // أول لمسة = الأغنية (لو لسه)
      if (k === 'del') {
        entered = entered.slice(0, -1);
        paint();
        return;
      }
      if (entered.length >= code.length) return;
      entered += k;
      FX.vibrate(8);
      paint();
      if (entered.length === code.length) {
        if (entered === code) right(); else wrong();
      }
    }

    keypad.addEventListener('click', function (e) {
      const b = e.target.closest('.key');
      if (b) press(b.getAttribute('data-k'));
    });

    // كيبورد الكمبيوتر
    document.addEventListener('keydown', function (e) {
      if (!ctx.isCurrent('lock')) return;
      if (/^[0-9]$/.test(e.key)) press(e.key);
      else if (e.key === 'Backspace') press('del');
    });

    return {
      enter: function () {
        if (FX.reduced) return;
        gsap.from('#screen-lock .content-wrapper > *', { y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.09, ease: 'power2.out', delay: 0.15 });
      }
    };
  }

  return { init: init };
})();
