/* =====================================================================
   js/candle.js — الشمعة والرسالة الأخيرة
   1) ضغطة على الكعكة أو على "Blow the Candle": اللهب يطفي ومعاه دخان
   2) لحظة ضلمة قصيرة
   3) ألعاب نارية
   4) "Happy Birthday" والرسالة الأخيرة (ومعاها "Light it Again")
   ===================================================================== */
window.Candle = (function () {
  'use strict';

  const CFG = { darkDelay: 700, darkIn: 0.8, darkHold: 900, fireworksMs: 3800 };

  function init(ctx) {
    const C = ctx.content.candle;
    const name = ctx.content.name;
    const cake = document.getElementById('cake');
    const dark = document.getElementById('candleDark');
    const wishBox = document.getElementById('candleWish');
    const doneBox = document.getElementById('candleDone');
    const flame = document.getElementById('ckFlameWrap');
    const smoke = document.getElementById('ckSmoke');

    function title(el, lead) {
      el.textContent = lead + ' ';
      const s = document.createElement('span');
      s.className = 'acc';
      s.textContent = name;
      el.appendChild(s);
    }
    title(document.getElementById('candleWishTitle'), C.wishTitle);
    document.getElementById('candleWishText').textContent = C.wishText;
    document.getElementById('candleBlow').textContent = C.blowLabel;
    title(document.getElementById('candleDoneTitle'), C.doneTitle);
    document.getElementById('candleDoneTitle').appendChild(document.createTextNode('!'));
    document.getElementById('candleDoneText').textContent = C.doneText;
    document.getElementById('candleAgain').textContent = C.againLabel;
    document.getElementById('candleFooter').textContent = C.footer;
    document.getElementById('candleFooterSmall').textContent = C.footerSmall;

    gsap.set(flame, { svgOrigin: '110 51' });
    let lit = true;

    function extinguish() {
      cake.classList.add('out');
      gsap.to(wishBox, { autoAlpha: 0, y: 10, duration: 0.5 });
      gsap.to(flame, { scaleY: 0, scaleX: 0.3, autoAlpha: 0, svgOrigin: '110 51', duration: 0.35, ease: 'power2.in' });
      const len = smoke.getTotalLength();
      smoke.style.strokeDasharray = len;
      smoke.style.strokeDashoffset = len;
      gsap.timeline()
        .set(smoke, { x: 0 })
        .to(smoke, { opacity: 0.8, duration: 0.2 })
        .to(smoke, { strokeDashoffset: 0, duration: 1.5, ease: 'power1.out' }, 0)
        .to(smoke, { x: 6, duration: 1.5, ease: 'sine.inOut' }, 0)
        .to(smoke, { opacity: 0, duration: 1.1 }, 0.9);
    }

    function showDone() {
      wishBox.hidden = true;
      doneBox.hidden = false;
      gsap.fromTo(doneBox.querySelectorAll('.gift-title, .description, .btn-secondary, .end-footer'),
        { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.25, ease: 'power2.out' });
    }

    async function blowOut() {
      if (!lit) return;
      lit = false;
      FX.vibrate(25);
      extinguish();

      if (FX.reduced) { await FX.sleep(600); showDone(); return; }
      await FX.sleep(CFG.darkDelay);

      gsap.to(cake, { opacity: 0.45, duration: CFG.darkIn });
      await new Promise(function (r) { gsap.to(dark, { opacity: 1, duration: CFG.darkIn, onComplete: r }); });
      await FX.sleep(CFG.darkHold);

      gsap.to(dark, { opacity: 0, duration: 1.2 });
      gsap.to(cake, { opacity: 1, duration: 1.2 });
      FX.fireworks(CFG.fireworksMs);
      await FX.sleep(1400);
      showDone();
    }

    function relight() {
      lit = true;
      cake.classList.remove('out');
      gsap.set(flame, { scale: 1, autoAlpha: 1, svgOrigin: '110 51' });
      doneBox.hidden = true;
      wishBox.hidden = false;
      gsap.set(wishBox, { y: 0 });
      gsap.to(wishBox, { autoAlpha: 1, duration: 0.7 });
    }

    cake.addEventListener('click', blowOut);
    document.getElementById('candleBlow').addEventListener('click', blowOut);
    document.getElementById('candleAgain').addEventListener('click', relight);

    return {
      enter: function () {
        if (!FX.reduced) gsap.from(cake, { autoAlpha: 0, y: 24, duration: 1.2, ease: 'power2.out' });
      }
    };
  }

  return { init: init };
})();
