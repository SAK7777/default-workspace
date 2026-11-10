/* ==========================================================================
   SAK 工作室 · 共享脚本
   动效改写自 React Bits（SplitText / Magnet / DecryptedText / ScrollReveal / LogoLoop）
   —— 全部为原生实现，无 React 依赖、无外链库
   ========================================================================== */
(function () {
  'use strict';

  window.__sakBoot = true;

  /* 紧急开关：任意页面加 ?nomotion=1 立刻关掉全部动效（无需改文件） */
  if (/[?&]nomotion=1/.test(location.search)) {
    var kill = document.createElement('style');
    kill.textContent = '*,*::before,*::after{animation:none!important;transition:none!important}'
      + '.rv,.split-line{opacity:1!important;transform:none!important}';
    document.head.appendChild(kill);
    document.documentElement.classList.add('no-motion');
  }

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    || document.documentElement.classList.contains('no-motion');

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

/* ==========================================================================
   MOTION SYSTEM v2 · 行为层
   进度条 / 导航状态 / 按钮涟漪 / 卡片倾斜 / 分组错峰 / 表单反馈
   ========================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. 滚动进度条 */
  (function () {
    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    var raf = 0;
    function update() {
      raf = 0;
      var h = document.documentElement.scrollHeight - innerHeight;
      var p = h > 0 ? Math.min(1, Math.max(0, scrollY / h)) : 0;
      bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    }
    addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    update();
  })();

  /* 2. 导航滚动收缩 */
  (function () {
    var nav = document.querySelector('.nav');
    if (!nav) return;
    var raf = 0;
    function update() {
      raf = 0;
      nav.classList.toggle('is-scrolled', scrollY > 40);
    }
    addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    update();
  })();

  /* 3. 菜单：同步 nav 状态（图标旋转） */
  (function () {
    var btn = document.getElementById('menuBtn');
    var nav = document.querySelector('.nav');
    if (!btn || !nav) return;
    new MutationObserver(function () {
      nav.classList.toggle('is-open', btn.getAttribute('aria-expanded') === 'true');
    }).observe(btn, { attributes: true, attributeFilter: ['aria-expanded'] });
  })();

  /* 4. 按钮：指针光晕 + 点击涟漪 */
  (function () {
    document.querySelectorAll('.btn').forEach(function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        btn.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
        btn.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
      });
      btn.addEventListener('pointerleave', function () {
        btn.style.removeProperty('--mx');
        btn.style.removeProperty('--my');
      });
      btn.addEventListener('click', function (e) {
        if (reduce) return;
        var r = btn.getBoundingClientRect();
        var d = Math.max(r.width, r.height) * 2;
        var s = document.createElement('span');
        s.className = 'ripple';
        s.style.width = s.style.height = d + 'px';
        s.style.left = (e.clientX - r.left) + 'px';
        s.style.top = (e.clientY - r.top) + 'px';
        s.addEventListener('animationend', function () { s.remove(); });
        btn.appendChild(s);
      });
    });
  })();

  /* 5. 卡片 3D 倾斜（仅指针设备，强度很小，避免晕） */
  (function () {
    if (reduce || window.matchMedia('(hover:none)').matches) return;
    document.querySelectorAll('.work').forEach(function (card) {
      var media = card.querySelector('.work__media');
      if (!media) return;
      var raf = 0, tx = 0, ty = 0;
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - .5) * 6;   // ±3deg
        ty = ((e.clientY - r.top) / r.height - .5) * -6;
        if (!raf) raf = requestAnimationFrame(function () {
          raf = 0;
          media.style.transform = 'perspective(900px) rotateY(' + tx.toFixed(2) + 'deg) rotateX(' + ty.toFixed(2) + 'deg)';
        });
      });
      card.addEventListener('pointerleave', function () {
        media.style.transform = '';
      });
    });
  })();

  /* 6. 分组错峰：给容器子元素排队（不写进 HTML，保持模板干净） */
  (function () {
    document.querySelectorAll('.works, .svc, .steps, .stats').forEach(function (box) {
      Array.prototype.forEach.call(box.children, function (child, i) {
        if (i > 5) return;
        child.style.transitionDelay = (i * 60) + 'ms';
      });
    });
  })();

  /* 7. 表单：校验 + 反馈 + 邮件兜底 */
  (function () {
    var form = document.querySelector('form[data-contact]');
    if (!form) return;
    var ok = form.querySelector('.form-ok');
    var okText = form.querySelector('.form-ok-text');
    var submit = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var fields = form.querySelectorAll('input, textarea');
      var bad = null;
      fields.forEach(function (f) {
        var invalid = f.required && !String(f.value).trim();
        if (f.type === 'email' && f.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value)) invalid = true;
        f.classList.toggle('invalid', invalid);
        if (invalid && !bad) bad = f;
      });

      if (bad) {
        bad.closest('.field').classList.add('shake');
        setTimeout(function () { bad.closest('.field').classList.remove('shake'); }, 360);
        bad.focus();
        return;
      }

      var name = (form.querySelector('[name="name"]') || {}).value || '';
      var mail = (form.querySelector('[name="email"]') || {}).value || '';
      var msg = (form.querySelector('[name="message"]') || {}).value || '';
      var subject = encodeURIComponent('SAK 工作室 · 合作咨询（' + name + '）');
      var body = encodeURIComponent('称呼：' + name + '\n邮箱：' + mail + '\n\n想做什么：\n' + msg);
      var mailto = 'mailto:318718579@qq.com?subject=' + subject + '&body=' + body;

      if (submit) { submit.disabled = true; submit.style.opacity = '.6'; }
      if (okText) {
        okText.innerHTML = '已收到，我们会尽快回信。也可以直接发到 ' +
          '<a href="' + mailto + '">318718579@qq.com</a>';
      }
      if (ok) ok.classList.add('show');
      fields.forEach(function (f) { f.classList.remove('invalid'); });
      form.reset();
      if (submit) setTimeout(function () { submit.disabled = false; submit.style.opacity = ''; }, 1200);
    });

    form.addEventListener('input', function (e) {
      if (e.target.classList && e.target.classList.contains('invalid') && e.target.value.trim()) {
        e.target.classList.remove('invalid');
      }
    });
  })();
})();
