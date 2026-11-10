/* ==========================================================================
   SAK 工作室 · 共享脚本
   动效改写自 React Bits（SplitText / Magnet / DecryptedText / ScrollReveal / LogoLoop）
   —— 全部为原生实现，无 React 依赖、无外链库
   ========================================================================== */
(function () {
  'use strict';

  window.__sakBoot = true;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 兜底：任何脚本异常都把内容显示出来，绝不让页面空着 */
  window.addEventListener('error', function () {
    document.querySelectorAll('.rv').forEach(function (n) { n.classList.add('in'); });
    document.querySelectorAll('.split-line').forEach(function (n) { n.classList.add('in'); });
  });

  /* ---------- 0. 页面就绪 ---------- */
  window.addEventListener('load', function () { document.body.classList.add('ready'); });

  /* ---------- 1. 导航下拉 ---------- */
  (function () {
    var btn = document.getElementById('menuBtn');
    var menu = document.getElementById('menu');
    if (!btn || !menu) return;
    function toggle(open) {
      menu.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
    }
    btn.addEventListener('click', function () { toggle(!menu.classList.contains('open')); });
    menu.addEventListener('click', function (e) { if (e.target === menu) toggle(false); });
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggle(false); });
  })();

  /* ---------- 2. 双光标 ---------- */
  (function () {
    var dot = document.getElementById('cursor-dot');
    var ring = document.getElementById('cursor-ring');
    if (!dot || !ring || window.matchMedia('(pointer:coarse)').matches) return;
    var x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
    window.addEventListener('pointermove', function (e) {
      x = e.clientX; y = e.clientY;
      dot.style.transform = 'translate(' + (x - 3) + 'px,' + (y - 3) + 'px)';
    });
    (function loop() {
      rx += (x - rx) * 0.16; ry += (y - ry) * 0.16;
      ring.style.transform = 'translate(' + (rx - 17) + 'px,' + (ry - 17) + 'px)';
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('a, button, .work, .grid__item, .svc__item').forEach(function (n) {
      n.addEventListener('pointerenter', function () { ring.classList.add('grow'); });
      n.addEventListener('pointerleave', function () { ring.classList.remove('grow'); });
    });
  })();

  /* ---------- 3. SplitText：标题逐行揭幕 ----------
     用法：给元素加 data-split，内部文字会按行包进 .split-line
     简化版：按 <br> 或整体分块，逐块 translateY 入场            */
  (function () {
    if (reduce) return;
    var allLines = [];
    document.querySelectorAll('[data-split]').forEach(function (el, idx) {
      var raw = el.innerHTML.trim();
      var parts = raw.indexOf('<br') > -1 ? raw.split(/<br\s*\/?>/i) : [raw];
      el.innerHTML = parts.map(function (p) {
        return '<span class="split-line"><span>' + p + '</span></span>';
      }).join('');
      var lines = el.querySelectorAll('.split-line');
      lines.forEach(function (ln, i) {
        allLines.push(ln);
        setTimeout(function () { ln.classList.add('in'); }, 120 + idx * 90 + i * 90);
      });
    });
    /* 兜底：2 秒后无论如何都显示出来，避免定时器被打断后文字卡在遮罩下 */
    setTimeout(function () {
      allLines.forEach(function (ln) { ln.classList.add('in'); });
    }, 2000);
  })();

  /* ---------- 4. ScrollReveal：滚动进场 ---------- */
  (function () {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.rv').forEach(function (n) { n.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '-6% 0px -10% 0px', threshold: 0.05 });
    document.querySelectorAll('.rv').forEach(function (n) { io.observe(n); });
  })();

  /* ---------- 5. Magnet：磁吸元素（data-magnet 强度 0~1）---------- */
  (function () {
    if (reduce) return;
    document.querySelectorAll('[data-magnet]').forEach(function (el) {
      var strength = parseFloat(el.getAttribute('data-magnet')) || 0.3;
      var raf = 0, tx = 0, ty = 0, cx = 0, cy = 0;
      function render() {
        cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
        el.style.transform = 'translate(' + cx.toFixed(2) + 'px,' + cy.toFixed(2) + 'px)';
        if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) raf = requestAnimationFrame(render);
        else { raf = 0; el.style.transform = 'translate(' + tx + 'px,' + ty + 'px)'; }
      }
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        tx = (e.clientX - r.left - r.width / 2) * strength;
        ty = (e.clientY - r.top - r.height / 2) * strength;
        if (!raf) raf = requestAnimationFrame(render);
      });
      el.addEventListener('pointerleave', function () {
        tx = 0; ty = 0;
        if (!raf) raf = requestAnimationFrame(render);
      });
    });
  })();

  /* ---------- 6. DecryptedText：字符解码 ---------- */
  (function () {
    if (reduce) return;
    var glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*01';
    document.querySelectorAll('[data-decrypt]').forEach(function (el) {
      var text = el.textContent;
      var done = false;
      function run() {
        if (done) return; done = true;
        var frame = 0, timer = null;
        timer = setInterval(function () {
          el.textContent = text.split('').map(function (c, i) {
            if (c === ' ') return ' ';
            if (i < frame) return text[i];
            return glyphs[(Math.random() * glyphs.length) | 0];
          }).join('');
          if (frame >= text.length) { clearInterval(timer); el.textContent = text; }
          frame += 1;
        }, 34);
      }
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { run(); io.disconnect(); } });
      }, { threshold: 0.6 });
      io.observe(el);
    });
  })();

  /* ---------- 7. LogoLoop：跑马灯无缝克隆 ---------- */
  (function () {
    document.querySelectorAll('[data-loop]').forEach(function (track) {
      track.innerHTML += track.innerHTML; // 复制一份，位移 50% 时正好接上
    });
  })();

  /* ---------- 8. 数字滚动 ---------- */
  (function () {
    document.querySelectorAll('[data-count]').forEach(function (el) {
      var target = parseFloat(el.getAttribute('data-count')) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      if (reduce) { el.textContent = target + suffix; return; }
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          io.disconnect();
          var start = performance.now(), dur = 1600;
          (function tick(t) {
            var p = Math.min(1, (t - start) / dur);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (p < 1) requestAnimationFrame(tick);
          })(start);
        });
      }, { threshold: 0.4 });
      io.observe(el);
    });
  })();

  /* ---------- 9. 年份（页脚自动）---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
