/* ===================================
   首页 3D 沉浸式 Hero — Three.js 场景
   粒子星云 + 线框球体 + 光环 + 鼠标视差 + 滚动驱动
   =================================== */

(function () {
  "use strict";

  var state = {
    renderer: null,
    scene: null,
    camera: null,
    group: null,
    particles: null,
    wireframe: null,
    inner: null,
    rings: [],
    mouse: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    scrollT: 0,
    running: false,
    raf: null,
    header: null,
  };

  function isHomeHero() {
    var header = document.getElementById("page-header");
    if (!header) return null;
    if (!header.classList.contains("full_page")) return null;
    return header;
  }

  /* 生成圆形柔光贴图，让粒子呈光点而非方块 */
  function makeGlowTexture() {
    var size = 64;
    var cv = document.createElement("canvas");
    cv.width = cv.height = size;
    var ctx = cv.getContext("2d");
    var g = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.3, "rgba(255,255,255,0.75)");
    g.addColorStop(0.7, "rgba(255,255,255,0.2)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    var tex = new THREE.CanvasTexture(cv);
    tex.needsUpdate = true;
    return tex;
  }

  function buildParticles() {
    var count = 1800;
    var geometry = new THREE.BufferGeometry();
    var positions = new Float32Array(count * 3);
    var colors = new Float32Array(count * 3);

    var palette = [
      new THREE.Color(0x60a5fa),
      new THREE.Color(0x22d3ee),
      new THREE.Color(0x818cf8),
      new THREE.Color(0x38bdf8),
      new THREE.Color(0xc7d2fe),
    ];

    for (var i = 0; i < count; i++) {
      var radius = 8 + Math.random() * 10;
      var theta = Math.random() * Math.PI * 2;
      var phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.62;
      /* z 轴压扁，避免粒子贴近相机形成大光斑 */
      positions[i * 3 + 2] = radius * Math.cos(phi) * 0.55;

      var c = palette[(Math.random() * palette.length) | 0];
      var k = 0.55 + Math.random() * 0.45;
      colors[i * 3] = c.r * k;
      colors[i * 3 + 1] = c.g * k;
      colors[i * 3 + 2] = c.b * k;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    var material = new THREE.PointsMaterial({
      size: 0.22,
      map: makeGlowTexture(),
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    return new THREE.Points(geometry, material);
  }

  function buildWireframe() {
    var group = new THREE.Group();

    var outer = new THREE.Mesh(
      new THREE.IcosahedronGeometry(5.4, 2),
      new THREE.MeshBasicMaterial({
        color: 0x3b82f6,
        wireframe: true,
        transparent: true,
        opacity: 0.32,
      })
    );
    group.add(outer);

    var inner = new THREE.Mesh(
      new THREE.IcosahedronGeometry(3.6, 1),
      new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        wireframe: true,
        transparent: true,
        opacity: 0.22,
      })
    );
    group.add(inner);

    return group;
  }

  function buildRings() {
    var rings = [];
    var configs = [
      { r: 6.9, tube: 0.02, color: 0x22d3ee, opacity: 0.55, tilt: 0.5 },
      { r: 8.2, tube: 0.015, color: 0x818cf8, opacity: 0.4, tilt: -0.35 },
    ];
    configs.forEach(function (cfg) {
      var geo = new THREE.TorusGeometry(cfg.r, cfg.tube, 8, 140);
      var mat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: cfg.opacity,
      });
      var ring = new THREE.Mesh(geo, mat);
      ring.rotation.x = Math.PI / 2 + cfg.tilt;
      ring.rotation.y = cfg.tilt;
      rings.push(ring);
    });
    return rings;
  }

  function sizeNow() {
    if (!state.renderer || !state.header) return;
    var w = state.header.clientWidth || window.innerWidth;
    var h = state.header.clientHeight || window.innerHeight;
    state.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    state.renderer.setSize(w, h, false);
    state.camera.aspect = w / h;
    state.camera.updateProjectionMatrix();
  }

  function onMouseMove(e) {
    state.target.x = (e.clientX / window.innerWidth - 0.5) * 2;
    state.target.y = (e.clientY / window.innerHeight - 0.5) * 2;
  }

  function onScroll() {
    if (!state.header) return;
    var h = state.header.clientHeight || window.innerHeight;
    state.scrollT = Math.min(Math.max(window.scrollY / h, 0), 1);
  }

  function animate() {
    if (!state.running) return;
    state.raf = requestAnimationFrame(animate);
    var s = state;

    s.mouse.x += (s.target.x - s.mouse.x) * 0.05;
    s.mouse.y += (s.target.y - s.mouse.y) * 0.05;
    var scroll = s.scrollT;

    if (s.group) {
      s.group.rotation.y += 0.0016;
      s.group.rotation.x = s.mouse.y * 0.22;
      s.group.rotation.z = s.mouse.x * 0.08;
      s.group.position.x = s.mouse.x * 0.7;
      s.group.position.y = -s.mouse.y * 0.45 + scroll * 2.4;
      s.group.scale.setScalar(1 - scroll * 0.28);
    }

    if (s.wireframe) {
      s.wireframe.rotation.y -= 0.0022;
      s.wireframe.rotation.x += 0.0008;
    }

    s.rings.forEach(function (ring, i) {
      ring.rotation.z += 0.0016 * (i % 2 === 0 ? 1 : -1);
    });

    s.camera.position.z = 20 - scroll * 6;
    s.camera.position.x = s.mouse.x * 0.9;
    s.camera.position.y = -s.mouse.y * 0.5;
    s.camera.lookAt(0, 0, 0);

    if (s.particles) {
      s.particles.material.opacity = 0.9 * (1 - scroll * 0.7);
    }

    s.renderer.render(s.scene, s.camera);
  }

  function start() {
    if (state.running) return;
    state.running = true;
    animate();
  }

  function stop() {
    state.running = false;
    if (state.raf) cancelAnimationFrame(state.raf);
    state.raf = null;
  }

  function init() {
    if (typeof THREE === "undefined") return;
    var header = isHomeHero();
    if (!header) return;

    var reduce =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    state.header = header;

    var canvas = document.createElement("canvas");
    canvas.className = "hero-3d-canvas";
    canvas.setAttribute("aria-hidden", "true");
    header.insertBefore(canvas, header.firstChild);

    try {
      state.renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: false,
        powerPreference: "high-performance",
      });
    } catch (e) {
      return;
    }

    state.renderer.setClearColor(0x000000, 0);

    state.scene = new THREE.Scene();
    state.camera = new THREE.PerspectiveCamera(
      60,
      header.clientWidth / Math.max(header.clientHeight, 1),
      0.1,
      120
    );
    state.camera.position.z = 20;

    state.group = new THREE.Group();
    state.scene.add(state.group);

    state.particles = buildParticles();
    state.wireframe = buildWireframe();
    state.rings = buildRings();

    state.group.add(state.particles);
    state.group.add(state.wireframe);
    state.rings.forEach(function (r) {
      state.group.add(r);
    });

    sizeNow();
    requestAnimationFrame(sizeNow);
    start();

    window.addEventListener("resize", sizeNow);
    window.addEventListener("orientationchange", sizeNow);
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    });
    onScroll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.addEventListener("load", function () {
    if (state.renderer) sizeNow();
  });
})();
