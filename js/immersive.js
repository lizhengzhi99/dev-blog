/* ===================================
   沉浸式交互动效 — 增强层
   滚动进度条 / 卡片 3D 倾斜 / 磁吸按钮 / 视差 / 鼠标光晕
   =================================== */

(function () {
  "use strict";

  var reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. 顶部滚动进度条 ---------- */
  function initScrollProgress() {
    var bar = document.createElement("div");
    bar.className = "scroll-progress";
    document.body.appendChild(bar);

    function update() {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? window.scrollY / h : 0;
      bar.style.transform = "scaleX(" + Math.min(Math.max(p, 0), 1) + ")";
    }

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---------- 2. 卡片 3D 倾斜 ---------- */
  function initCardTilt() {
    if (reduce || window.innerWidth < 900) return;
    var cards = document.querySelectorAll(
      ".portfolio-card, .stat-item, .card-widget"
    );

    cards.forEach(function (card) {
      card.classList.add("tilt-card");
      var rect = null;

      card.addEventListener("mouseenter", function () {
        rect = card.getBoundingClientRect();
        card.style.transition = "transform 0.15s ease-out";
      });

      card.addEventListener("mousemove", function (e) {
        if (!rect) rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        var rx = (-py * 8).toFixed(2);
        var ry = (px * 8).toFixed(2);
        card.style.transform =
          "perspective(900px) rotateX(" +
          rx +
          "deg) rotateY(" +
          ry +
          "deg) translateY(-4px)";
      });

      card.addEventListener("mouseleave", function () {
        card.style.transition = "transform 0.5s cubic-bezier(0.4,0,0.2,1)";
        card.style.transform =
          "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)";
        rect = null;
      });
    });
  }

  /* ---------- 3. 磁吸按钮 ---------- */
  function initMagneticButtons() {
    if (reduce || window.innerWidth < 900) return;
    var btns = document.querySelectorAll(
      ".btn-primary, .btn-secondary, .hero-buttons a"
    );
    btns.forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var mx = e.clientX - r.left - r.width / 2;
        var my = e.clientY - r.top - r.height / 2;
        btn.style.transform =
          "translate(" + mx * 0.25 + "px," + my * 0.35 + "px)";
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.transform = "";
      });
    });
  }

  /* ---------- 4. 鼠标光晕（跟随指针的柔光） ---------- */
  function initMouseGlow() {
    if (reduce || window.innerWidth < 768) return;
    var glow = document.createElement("div");
    glow.className = "mouse-glow";
    document.body.appendChild(glow);

    var x = window.innerWidth / 2;
    var y = window.innerHeight / 2;
    var tx = x;
    var ty = y;

    window.addEventListener(
      "mousemove",
      function (e) {
        tx = e.clientX;
        ty = e.clientY;
        glow.classList.add("active");
      },
      { passive: true }
    );

    (function loop() {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      glow.style.transform = "translate(" + x + "px," + y + "px)";
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- 5. Hero 文字视差 ---------- */
  function initHeroParallax() {
    if (reduce) return;
    var info = document.querySelector("#page-header .site-info");
    var hint = document.querySelector(".scroll-hint");
    if (!info) return;

    function update() {
      var y = window.scrollY;
      if (y > window.innerHeight) return;
      info.style.transform = "translateY(" + y * 0.18 + "px)";
      info.style.opacity = String(Math.max(1 - y / (window.innerHeight * 0.75), 0));
      if (hint) {
        hint.style.opacity = String(Math.max(1 - y / 300, 0));
      }
    }

    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  /* ---------- 6. 元素进场增强（针对非卡片区块） ---------- */
  function initReveal() {
    var els = document.querySelectorAll(
      ".section-title, .section-subtitle, .skill-bar-item, .timeline-item"
    );
    if (!els.length) return;

    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach(function (el) {
        el.classList.add("reveal", "is-visible");
      });
      return;
    }

    els.forEach(function (el) {
      el.classList.add("reveal");
    });

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    els.forEach(function (el) {
      io.observe(el);
    });
  }

  function markHome() {
    var header = document.getElementById("page-header");
    if (header && header.classList.contains("full_page")) {
      document.body.classList.add("has-hero-3d");
    }
  }

  /* ---------- 7. 内页横幅：星点连线粒子层 ---------- */
  function initInnerHero() {
    var header = document.getElementById("page-header");
    if (!header || header.classList.contains("full_page")) return;

    document.body.classList.add("has-inner-hero");
    if (reduce || header.querySelector(".inner-hero-canvas")) return;

    var canvas = document.createElement("canvas");
    canvas.className = "inner-hero-canvas";
    canvas.setAttribute("aria-hidden", "true");
    header.insertBefore(canvas, header.firstChild);

    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0;
    var h = 0;
    var dots = [];
    var raf = null;
    var LINK = 120;
    var COLORS = ["#3b82f6", "#22d3ee", "#818cf8", "#e0f2fe"];

    function resize() {
      w = header.clientWidth;
      h = header.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var count = Math.max(24, Math.min(64, Math.round(w / 24)));
      dots = [];
      for (var i = 0; i < count; i++) {
        dots.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          r: Math.random() * 1.5 + 0.7,
          c: COLORS[(Math.random() * COLORS.length) | 0],
          a: Math.random() * 0.35 + 0.35,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      var i;
      var j;
      for (i = 0; i < dots.length; i++) {
        var d = dots[i];
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < -20) d.x = w + 20;
        else if (d.x > w + 20) d.x = -20;
        if (d.y < -20) d.y = h + 20;
        else if (d.y > h + 20) d.y = -20;
      }

      ctx.lineWidth = 0.6;
      for (i = 0; i < dots.length; i++) {
        for (j = i + 1; j < dots.length; j++) {
          var dx = dots[i].x - dots[j].x;
          var dy = dots[i].y - dots[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK) {
            ctx.strokeStyle =
              "rgba(96,165,250," + (0.18 * (1 - dist / LINK)).toFixed(3) + ")";
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.stroke();
          }
        }
      }

      for (i = 0; i < dots.length; i++) {
        var p = dots[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 2.6, 0, Math.PI * 2);
        ctx.fillStyle = p.c;
        ctx.globalAlpha = p.a * 0.12;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.globalAlpha = p.a;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function loop() {
      draw();
      raf = requestAnimationFrame(loop);
    }

    function start() {
      if (raf === null) loop();
    }

    function stop() {
      if (raf !== null) {
        cancelAnimationFrame(raf);
        raf = null;
      }
    }

    resize();
    draw();
    window.addEventListener("resize", resize);

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        function (entries) {
          if (entries[0].isIntersecting) start();
          else stop();
        },
        { threshold: 0 }
      ).observe(header);
    } else {
      start();
    }
  }

  function init() {
    markHome();
    initScrollProgress();
    initCardTilt();
    initMagneticButtons();
    initMouseGlow();
    initHeroParallax();
    initReveal();
    initInnerHero();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.addEventListener("load", function () {
    initCardTilt();
    initMagneticButtons();
    initReveal();
  });
})();
