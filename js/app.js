/* =====================================================================
   js/app.js — التشغيل: الموسيقى، التنقل بين الصفحات، الشريط السفلي
   الترتيب: قفل ← رسالة ← ذكريات ← سؤال ← كروت ← شمعة
   ===================================================================== */
(function () {
  'use strict';

  if (!window.gsap) {
    document.body.innerHTML = '<p style="color:#f472b6;padding:40px;text-align:center">اتأكد من النت وجرّب تاني 💗</p>';
    return;
  }

  const C = window.CONTENT;
  const ORDER = ['lock', 'letter', 'album', 'question', 'moments', 'candle'];
  const screens = {};
  ORDER.forEach(function (id) { screens[id] = document.getElementById('screen-' + id); });

  const dock = document.getElementById('dock');
  const dockBtns = Array.prototype.slice.call(dock.querySelectorAll('button'));

  let current = 'lock';
  let furthest = 0;
  let moving = false;

  /* ------------------------- الموسيقى ------------------------- */
  const music = (function () {
    const audio = document.getElementById('song');
    const btn = document.getElementById('musicBtn');
    let armed = false;       // الأغنية اتشغّلت أو بتحاول
    let userPaused = false;  // هو اللي وقّفها بإيده
    let held = false;        // واقفة مؤقتًا عشان فيديو صوته شغّال

    audio.src = C.song;
    audio.loop = true;
    audio.preload = 'auto';

    audio.addEventListener('play', function () { btn.classList.add('playing'); });
    audio.addEventListener('pause', function () { btn.classList.remove('playing'); });

    function play() {
      const p = audio.play();
      if (p && typeof p.then === 'function') {
        p.then(function () {
          // تدرّج في الصوت (iOS بيتجاهل volume، عادي)
          try { audio.volume = 0; gsap.to(audio, { volume: 0.95, duration: 2.2, ease: 'power1.in' }); } catch (e) { /* مش مشكلة */ }
        }).catch(function () { armed = false; });   // المتصفح رفض: نحاول في اللمسة الجاية
      }
    }

    function arm() {
      if (armed || userPaused) return;
      armed = true;
      play();
    }

    // أي لمسة أولى في الموقع = الأغنية
    ['pointerup', 'keydown', 'touchend'].forEach(function (ev) {
      document.addEventListener(ev, arm, { passive: true });
    });

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      held = false;
      if (audio.paused) { userPaused = false; armed = true; play(); }
      else { userPaused = true; audio.pause(); }
    });

    // لو خرج من الصفحة نوقف، ولما يرجع نكمّل (إلا لو هو اللي واقفها)
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) audio.pause();
      else if (armed && !userPaused && !held) audio.play().catch(function () {});
    });

    // فيديو فتح صوته: الأغنية تقف لحد ما الصوت يتقفل (أو الفيديو يتقفل)
    function hold() {
      if (!audio.paused) { held = true; audio.pause(); }
    }
    function release() {
      if (!held) return;
      held = false;
      if (!userPaused) audio.play().catch(function () {});
    }

    return { arm: arm, hold: hold, release: release };
  })();

  /* ------------------------- التنقل ------------------------- */
  const modules = {};

  function tween(target, vars) {
    return new Promise(function (resolve) { gsap.to(target, Object.assign({}, vars, { onComplete: resolve })); });
  }

  function updateDock() {
    dockBtns.forEach(function (b) {
      const i = ORDER.indexOf(b.getAttribute('data-go'));
      b.classList.toggle('current', ORDER[i] === current);
      b.classList.toggle('seen', i <= furthest && ORDER[i] !== current);
      b.disabled = i > furthest;
    });
  }

  async function go(id) {
    if (moving || id === current || !screens[id]) return;
    moving = true;
    const from = screens[current];
    const to = screens[id];
    await tween(from, { autoAlpha: 0, y: -10, duration: FX.reduced ? 0.2 : 0.5, ease: 'power2.in' });
    if (modules[current] && modules[current].leave) modules[current].leave();   // نوقف الفيديوهات
    from.hidden = true;
    to.hidden = false;
    to.scrollTop = 0;
    current = id;
    furthest = Math.max(furthest, ORDER.indexOf(id));
    updateDock();
    gsap.fromTo(to, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: FX.reduced ? 0.2 : 0.8, ease: 'power2.out', clearProps: 'transform' });
    modules[id].enter();
    moving = false;
  }

  function next() {
    const i = ORDER.indexOf(current);
    if (i < ORDER.length - 1) go(ORDER[i + 1]);
  }

  function unlock() {
    dock.hidden = false;
    gsap.fromTo(dock, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8, delay: 0.4 });
    go('letter');
  }

  dockBtns.forEach(function (b) {
    b.addEventListener('click', function () { go(b.getAttribute('data-go')); });
  });

  /* ------------------------- تشغيل ------------------------- */
  const ctx = {
    content: C,
    music: music,
    next: next,
    unlock: unlock,
    isCurrent: function (id) { return current === id; }
  };

  FX.init();
  modules.lock = window.Lock.init(ctx);
  modules.letter = window.Letter.init(ctx);
  modules.album = window.Album.init(ctx);
  modules.question = window.Question.init(ctx);
  modules.moments = window.Moments.init(ctx);
  modules.candle = window.Candle.init(ctx);

  const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise(function (r) { setTimeout(r, 1800); })]).then(function () {
    modules.lock.enter();
  });
})();
